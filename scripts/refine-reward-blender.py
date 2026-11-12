"""Refine the reward train prototypes with Blender 4.5 (no external assets).

  blender --background --python scripts/refine-reward-blender.py -- --root REPO

Only the five explicitly named solid component classes are welded, rounded,
and shaded. Body panels, glazing, lamps, wheels, UVs, and material graphs are
left alone. Editable bevel/normal modifiers remain in the compressed .blend;
the GLB exporter evaluates them. Missing inputs are reported without waiting.
"""

import argparse
import json
import math
from pathlib import Path
import struct
import sys
import traceback

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector


TRAINS = ("yokosuka", "shonan-shinjuku", "saikyo", "toyoko", "yamanote", "komachi", "hayabusa")
WIDTHS = {"cab-shell": 0.012, "cab-skirt": 0.010, "coupler": 0.008,
          "roof-housing": 0.008, "underfloor-housing": 0.006}
PROTOTYPES = {"CAB", "STANDARD", "GREEN", "PANTOGRAPH", "AXLE"}
REQUIRED = PROTOTYPES - {"GREEN"}


def log(label, value):
    print(label + " " + json.dumps(value, ensure_ascii=True), flush=True)


def read_glb(path):
    raw = path.read_bytes()
    if len(raw) < 20 or struct.unpack_from("<4sII", raw) != (b"glTF", 2, len(raw)):
        raise ValueError(f"Invalid GLB v2 header: {path}")
    chunks = []
    offset = 12
    while offset < len(raw):
        size, kind = struct.unpack_from("<II", raw, offset)
        if size % 4 or offset + 8 + size > len(raw):
            raise ValueError(f"Invalid GLB chunk: {path}")
        chunks.append((kind, raw[offset + 8:offset + 8 + size]))
        offset += 8 + size
    if offset != len(raw) or chunks[0][0] != 0x4E4F534A:
        raise ValueError(f"Invalid GLB chunk layout: {path}")
    doc = json.loads(chunks[0][1])
    binary = next((chunk for kind, chunk in chunks if kind == 0x004E4942), b"")
    if any(b.get("uri") for b in doc.get("buffers", [])):
        raise ValueError("External buffers are not permitted")
    if any(i.get("uri", "").startswith(("http:", "https:", "file:"))
           for i in doc.get("images", [])):
        raise ValueError("External images are not permitted")
    return doc, binary


def node_matrix(node):
    if "matrix" in node:
        m = node["matrix"]
        return Matrix(tuple(tuple(m[c * 4 + r] for c in range(4)) for r in range(4)))
    q = node.get("rotation", (0, 0, 0, 1))
    return Matrix.LocRotScale(Vector(node.get("translation", (0, 0, 0))),
                              Quaternion((q[3], q[0], q[1], q[2])),
                              Vector(node.get("scale", (1, 1, 1))))


def glb_stats(doc, binary):
    """Read actual accessor positions, including stride, in glTF Y-up space."""
    nodes = doc.get("nodes", [])
    prototype_matrices = {}
    bounds = [Vector((math.inf,) * 3), Vector((-math.inf,) * 3)]
    triangles = 0
    vertices = 0
    meshes = 0
    accessors = doc.get("accessors", [])
    views = doc.get("bufferViews", [])

    def positions(index):
        acc = accessors[index]
        if acc["componentType"] != 5126 or acc["type"] != "VEC3" or "sparse" in acc:
            raise ValueError("Expected dense FLOAT VEC3 position accessor")
        view = views[acc["bufferView"]]
        start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
        stride = view.get("byteStride", 12)
        end = start + max(0, acc["count"] - 1) * stride + 12
        if end > len(binary) or end > view.get("byteOffset", 0) + view["byteLength"]:
            raise ValueError("Position accessor exceeds buffer view")
        for i in range(acc["count"]):
            p = struct.unpack_from("<3f", binary, start + i * stride)
            if not all(math.isfinite(x) for x in p):
                raise ValueError("Non-finite vertex position")
            yield Vector(p)

    def visit(index, parent):
        nonlocal triangles, vertices, meshes
        node = nodes[index]
        matrix = parent @ node_matrix(node)
        if node.get("name") in PROTOTYPES:
            prototype_matrices[node["name"]] = matrix
        if "mesh" in node:
            meshes += 1
            for primitive in doc["meshes"][node["mesh"]]["primitives"]:
                if primitive.get("mode", 4) != 4:
                    raise ValueError("Expected triangle primitives")
                acc = accessors[primitive["attributes"]["POSITION"]]
                count = accessors[primitive["indices"]]["count"] if "indices" in primitive else acc["count"]
                if count % 3:
                    raise ValueError("Incomplete triangle")
                triangles += count // 3
                vertices += acc["count"]
                for p in positions(primitive["attributes"]["POSITION"]):
                    p = matrix @ p
                    for axis in range(3):
                        bounds[0][axis] = min(bounds[0][axis], p[axis])
                        bounds[1][axis] = max(bounds[1][axis], p[axis])
        for child in node.get("children", []):
            visit(child, matrix)

    scene = doc["scenes"][doc.get("scene", 0)]
    for index in scene.get("nodes", []):
        visit(index, Matrix.Identity(4))
    if not REQUIRED.issubset(prototype_matrices):
        raise ValueError(f"Missing prototype groups: {REQUIRED - prototype_matrices.keys()}")
    if not all(math.isfinite(x) for p in bounds for x in p):
        raise ValueError("Empty or invalid model bounds")
    return {"meshes": meshes, "triangles": triangles, "vertices": vertices,
            "bounds_y_up": [[round(v, 5) for v in p] for p in bounds]}, prototype_matrices


def component(obj):
    name = obj.name.lower()
    return next((prefix for prefix in WIDTHS if name.startswith(prefix + "__")
                 or name == prefix or name.startswith(prefix + ".")), None)


def prototype(obj):
    while obj is not None:
        if obj.name in PROTOTYPES:
            return obj
        obj = obj.parent
    return None


def smoothstep(value):
    v = max(0.0, min(1.0, value))
    return v * v * (3.0 - 2.0 * v)


def cab_glass_envelope(cab):
    """Only front-facing glazing vertices; side windows cannot enlarge the mask."""
    coords = []
    inverse = cab.matrix_world.inverted()
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or prototype(obj) != cab:
            continue
        if not any("CAB_GLASS" in slot.material.name or "CAB_DAY" in slot.material.name
                   for slot in obj.material_slots if slot.material):
            continue
        matrix = inverse @ obj.matrix_world
        coords.extend(p for v in obj.data.vertices if (p := matrix @ v.co).x > 9.5)
    if not coords:
        return None
    return (min(p.y for p in coords) - 0.045, max(p.y for p in coords) + 0.045,
            min(p.z for p in coords) - 0.045, max(p.z for p in coords) + 0.045)


def refine(obj, kind, envelope):
    # glTF hard normals and nonindexed triangles duplicate solid corner vertices.
    # Weld only the named solids at a one-micrometre tolerance so bevels can
    # traverse their edges. UVs remain per-loop; glazing never enters this path.
    mesh = obj.data
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.000001)
    bm.normal_update()
    rolled = 0
    cab = prototype(obj)
    if kind == "cab-shell" and cab is not None and cab.name == "CAB" and envelope:
        matrix = cab.matrix_world.inverted() @ obj.matrix_world
        inverse = matrix.inverted()
        ymin, ymax, zmin, zmax = envelope
        for vert in bm.verts:
            p = matrix @ vert.co
            # Preserve every aperture edge and all open/nonmanifold boundaries.
            if p.x < 9.65 or abs(p.y) <= 1.25 or not vert.is_manifold:
                continue
            clearance = max(ymin - p.y, p.y - ymax, zmin - p.z, p.z - zmax, 0.0)
            roll = 0.080 * smoothstep((abs(p.y) - 1.25) / 0.25) * smoothstep(clearance / 0.15)
            if roll > 0.000001:
                p.x -= roll
                vert.co = inverse @ p
                rolled += 1
    bm.normal_update()
    for face in bm.faces:
        face.smooth = True
    for edge in bm.edges:
        edge.smooth = edge.is_manifold and edge.calc_face_angle(0.0) < math.radians(35)
    bm.to_mesh(mesh)
    bm.free()
    # Imported split normals no longer describe the rounded geometry. Rebuild
    # them only on these solids; weighted normals keep broad sheet faces flat.
    if mesh.has_custom_normals:
        bpy.context.view_layer.objects.active = obj
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    mesh.update()
    scale = obj.matrix_world.to_scale()
    if max(abs(s) for s in scale) - min(abs(s) for s in scale) > 0.0001:
        raise ValueError(f"Nonuniform solid scale would distort physical bevel: {obj.name}")
    bevel = obj.modifiers.new("Physical edge radius (metres)", "BEVEL")
    bevel.width = WIDTHS[kind] / max(abs(scale.x), 0.000001)
    bevel.segments = 2
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(30)
    bevel.use_clamp_overlap = True
    bevel.harden_normals = True
    bevel.mark_sharp = True
    bevel.face_strength_mode = "FSTR_AFFECTED"
    normal = obj.modifiers.new("Area weighted sheet normals", "WEIGHTED_NORMAL")
    normal.mode = "FACE_AREA_WITH_ANGLE"
    normal.weight = 50
    normal.keep_sharp = True
    normal.use_face_influence = True
    return {"object": obj.name, "bevel_m": WIDTHS[kind], "rolled_vertices": rolled}


def validate_materials(source, result):
    before = {m["name"]: m for m in source.get("materials", []) if m.get("name")}
    after = {m["name"]: m for m in result.get("materials", []) if m.get("name")}
    if not before.keys() <= after.keys():
        raise ValueError(f"Lost named materials: {before.keys() - after.keys()}")
    for name, material in before.items():
        src = material.get("pbrMetallicRoughness", {})
        dst = after[name].get("pbrMetallicRoughness", {})
        for field, default in (("baseColorFactor", [1, 1, 1, 1]),
                               ("metallicFactor", 1), ("roughnessFactor", 1)):
            a, b = src.get(field, default), dst.get(field, default)
            pairs = zip(a, b) if isinstance(a, list) else [(a, b)]
            if any(abs(x - y) > 0.0005 for x, y in pairs):
                raise ValueError(f"Material {name}: changed {field}: {a} -> {b}")
        if material.get("alphaMode", "OPAQUE") != after[name].get("alphaMode", "OPAQUE"):
            raise ValueError(f"Material {name}: changed alpha mode")
    if len(source.get("images", [])) != len(result.get("images", [])):
        raise ValueError("Image count changed during material round trip")


def process(root, train):
    source_path = root / ".tools" / "reward-source" / (train + ".glb")
    target = root / "assets" / "reward3d" / (train + ".glb")
    blend = root / "design" / "reward3d" / (train + ".blend")
    source, binary = read_glb(source_path)
    before, before_roots = glb_stats(source, binary)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    # The glTF importer sets color textures to sRGB and data maps to Non-Color.
    # Preserve its material nodes and colorspaces, and embed images on export.
    bpy.ops.import_scene.gltf(filepath=str(source_path), import_pack_images=True)
    cab = bpy.data.objects.get("CAB")
    envelope = cab_glass_envelope(cab) if cab is not None else None
    edits = []
    for obj in list(bpy.context.scene.objects):
        kind = component(obj) if obj.type == "MESH" else None
        if kind is None:
            continue
        protected = ("GLASS", "HEADLAMP", "CAB_DAY")
        if any(any(key in slot.material.name.upper() for key in protected)
               for slot in obj.material_slots if slot.material):
            raise ValueError(f"Protected optical material on solid component: {obj.name}")
        edits.append(refine(obj, kind, envelope))
    if not edits:
        raise ValueError("No named solid components found; refusing a conversion-only export")
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.ops.file.pack_all()
    for path in (target, blend):
        path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend), compress=True)
    bpy.ops.export_scene.gltf(
        filepath=str(target), check_existing=False, export_format="GLB",
        export_yup=True, export_apply=True, export_materials="EXPORT",
        export_image_format="AUTO", export_keep_originals=False,
        export_normals=True, export_texcoords=True, export_vertex_color="MATERIAL",
        export_animations=False, export_skins=False, export_morph=False,
        export_cameras=False, export_lights=False, export_extras=True,
        export_draco_mesh_compression_enable=False, export_use_gltfpack=False,
        export_hierarchy_flatten_objs=False, use_selection=False,
        use_visible=False, use_renderable=False)
    result, binary = read_glb(target)
    after, after_roots = glb_stats(result, binary)
    if set(before_roots) != set(after_roots):
        raise ValueError("Prototype group names changed")
    for name in before_roots:
        delta = max(abs(before_roots[name][r][c] - after_roots[name][r][c])
                    for r in range(4) for c in range(4))
        if delta > 0.0001:
            raise ValueError(f"Prototype transform changed: {name}: {delta}")
    for i in range(2):
        if max(abs(a - b) for a, b in zip(before["bounds_y_up"][i], after["bounds_y_up"][i])) > 0.11:
            raise ValueError("Refined bounds exceed expected physical bevel/roll tolerance")
    validate_materials(source, result)
    if after["triangles"] > before["triangles"] * 1.35 + 10000:
        raise ValueError("Excessive triangle increase for mobile geometry budget")
    log("REFINEMENT", {"train": train, "edits": edits})
    log("VALIDATED", {"train": train, "glb": str(target), "blend": str(blend),
                      "glb_bytes": target.stat().st_size, "blend_bytes": blend.stat().st_size,
                      "before": before, "after": after,
                      "prototype_groups": sorted(after_roots),
                      "images": len(result.get("images", []))})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--trains", nargs="+", choices=TRAINS, default=list(TRAINS))
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    root = args.root.resolve()
    failed = []
    for train in args.trains:
        try:
            process(root, train)
        except Exception as error:
            failed.append(train)
            log("FAILED", {"train": train, "error": str(error)})
            traceback.print_exc()
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
