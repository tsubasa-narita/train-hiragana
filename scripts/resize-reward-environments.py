"""Resize the three reward HDRs without rendering, GPU use or new dependencies.

Default: prepare candidates/reports ONLY; assets are never changed.
    python scripts/resize-reward-environments.py
To replace the three HDRs, pass --apply:
    python scripts/resize-reward-environments.py --apply

Uses Blender's bundled bpy + NumPy. Linear-light, solid-angle-weighted 2x2
area filtering is exact for this 2:1 reduction, conserves spherical radiance,
has no ringing, and never clips highlights to the SDR range. Peak radiance
can naturally fall when small bright sources occupy less than a target pixel.
RGBE quantization is measured separately against the unquantized filter result.
Inputs must be original 1024x512 HDRs matching the immutable backup. A second
resize is deliberately refused. To reproduce, restore originals first or use
--root with a separate copy containing the original assets and license.
"""

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import time
import zlib


NAMES = ('railway_bridge_02.hdr', 'shanghai_bund.hdr', 'small_hangar_01.hdr')
DEFAULT_BLENDER = 'C:/Program Files/Blender Foundation/Blender 4.5/blender.exe'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')


def write_png(path, rgb):
    """Write an already tone-mapped uint8 preview, not an HDR conversion path."""
    h, w, channels = rgb.shape
    assert channels == 3
    def chunk(kind, content):
        return struct.pack('>I', len(content)) + kind + content + struct.pack('>I', zlib.crc32(kind + content) & 0xffffffff)
    scanlines = b''.join(b'\0' + row.tobytes() for row in rgb)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(scanlines, 6)) + chunk(b'IEND', b''))


def worker(args):
    import bpy
    import numpy as np

    root = args.root.resolve()
    env = root / 'assets/reward3d/environment'
    backup = root / '.tools/reward-environment-original'
    out = root / 'test-results/reward-environment-resize'
    candidates = out / 'candidates'
    candidates.mkdir(parents=True, exist_ok=True)
    backup.mkdir(parents=True, exist_ok=True)
    license_path = env / 'LICENSE.md'
    if not license_path.is_file():
        raise RuntimeError('Missing LICENSE.md; refusing to proceed')
    license_hash = digest(license_path)

    # Preflight the complete set before doing any work or touching live assets.
    source_hashes = {}
    for name in NAMES:
        source = env / name
        raw = source.read_bytes()
        if b'FORMAT=32-bit_rle_rgbe' not in raw[:2048]:
            raise RuntimeError('Expected Radiance RGBE: ' + name)
        source_hashes[name] = digest(source)
        target = backup / name
        if target.exists() and digest(target) != source_hashes[name]:
            raise RuntimeError('Live source differs from immutable backup (already resized or externally changed): ' + name)
    saved_license = backup / 'LICENSE.md'
    if saved_license.exists() and digest(saved_license) != license_hash:
        raise RuntimeError('License differs from backup; inspect manually')
    for name in (*NAMES, 'LICENSE.md'):
        target = backup / name
        if not target.exists():
            shutil.copy2(env / name, target)

    def pixels(path):
        image = bpy.data.images.load(str(path), check_existing=False)
        try:
            # Treat environment RGB values as radiance data, without OCIO changes.
            image.colorspace_settings.name = 'Non-Color'
            w, h = image.size[:]
            rgba = np.empty(w * h * 4, dtype=np.float32)
            image.pixels.foreach_get(rgba)
            rgb = rgba.reshape(h, w, 4)[:, :, :3].copy()
            return rgb
        finally:
            bpy.data.images.remove(image)

    def row_weights(height):
        edges = np.linspace(0, math.pi, height + 1, dtype=np.float64)
        return np.cos(edges[:-1]) - np.cos(edges[1:])

    def statistics(rgb):
        finite = np.isfinite(rgb)
        if not finite.all():
            raise RuntimeError('Non-finite HDR channels: ' + str(int((~finite).sum())))
        if (rgb < 0).any():
            raise RuntimeError('Negative HDR channels')
        lum = rgb.astype(np.float64) @ np.array([.2126, .7152, .0722])
        weights = row_weights(rgb.shape[0])
        mass = lum * weights[:, None]
        theta = math.pi * (np.arange(rgb.shape[0]) + .5) / rgb.shape[0]
        phi = 2 * math.pi * (np.arange(rgb.shape[1]) + .5) / rgb.shape[1]
        directions = (np.sin(theta)[:, None] * np.cos(phi)[None, :],
                      np.broadcast_to(-np.cos(theta)[:, None], lum.shape),
                      np.sin(theta)[:, None] * np.sin(phi)[None, :])
        moment = [float((mass * axis).sum() / mass.sum()) for axis in directions]
        color_mean = (rgb.astype(np.float64) * weights[:,None,None]).sum(axis=(0,1)) / (weights.sum()*rgb.shape[1])
        peak_y, peak_x = np.unravel_index(np.argmax(lum), lum.shape)
        peak_direction = [float(axis[peak_y, peak_x]) for axis in directions]
        return {
            'width':int(rgb.shape[1]), 'height':int(rgb.shape[0]),
            'nan_count':int(np.isnan(rgb).sum()), 'inf_count':int(np.isinf(rgb).sum()),
            'negative_channels':int((rgb < 0).sum()), 'min_channel':float(rgb.min()),
            'peak_channel':float(rgb.max()), 'peak_luminance':float(lum.max()),
            'mean_luminance':float(lum.mean()),
            'solid_angle_mean_luminance':float((lum * weights[:, None]).sum() / (weights.sum() * lum.shape[1])),
            'luminance_percentiles':dict(zip(('50','95','99','99.9'), map(float, np.percentile(lum, [50,95,99,99.9])))),
            'channels_above_one':int((rgb > 1).sum()),
            'solid_angle_mean_rgb':list(map(float,color_mean)),
            'integrated_rgb_chromaticity':list(map(float,color_mean/color_mean.sum())),
            'radiance_direction_first_moment':moment,
            'peak_direction_unit_vector':peak_direction,
        }

    def relative(a, b):
        return (b - a) / a if a else 0.0

    results = []
    for name in NAMES:
        print('PREPARING ' + name, flush=True)
        before = pixels(env / name)
        if before.shape != (512, 1024, 3):
            raise RuntimeError(f'Expected 1024x512, got {before.shape}: {name}')
        original_stats = statistics(before)
        # Exact area of each latitude strip. Horizontal pixels have equal width.
        weights = row_weights(512).reshape(256, 2)
        blocks = before.astype(np.float64).reshape(256, 2, 512, 2, 3)
        filtered = (blocks * weights[:, :, None, None, None]).sum(axis=(1,3)) / (2 * weights.sum(axis=1)[:, None, None])
        filtered = filtered.astype(np.float32)
        reference_stats = statistics(filtered)
        candidate = candidates / name
        image = bpy.data.images.new('HDR 512 candidate', width=512, height=256, alpha=False, float_buffer=True, is_data=True)
        try:
            rgba = np.ones((256,512,4), dtype=np.float32)
            rgba[:,:,:3] = filtered
            image.pixels.foreach_set(rgba.ravel())
            image.filepath_raw = str(candidate)
            image.file_format = 'HDR'
            # Image.save(), not save_render(): no exposure/view transform/gamma.
            image.save()
        finally:
            bpy.data.images.remove(image)
        if b'FORMAT=32-bit_rle_rgbe' not in candidate.read_bytes()[:2048]:
            raise RuntimeError('Writer did not produce Radiance RGBE: ' + name)
        decoded = pixels(candidate)
        after_stats = statistics(decoded)
        if decoded.shape != (256,512,3):
            raise RuntimeError('Output dimensions changed unexpectedly')
        if original_stats['peak_channel'] > 1 and after_stats['peak_channel'] <= 1:
            raise RuntimeError('HDR highlights were clipped to SDR: ' + name)

        source_bytes = (env / name).stat().st_size
        output_bytes = candidate.stat().st_size
        delta = decoded.astype(np.float64) - filtered.astype(np.float64)
        mean_delta = relative(original_stats['mean_luminance'], after_stats['mean_luminance'])
        energy_delta = relative(original_stats['solid_angle_mean_luminance'], after_stats['solid_angle_mean_luminance'])
        quantization_delta = relative(reference_stats['solid_angle_mean_luminance'], after_stats['solid_angle_mean_luminance'])
        peak_ratio = after_stats['peak_luminance'] / original_stats['peak_luminance']
        def angle(a,b):
            a=np.array(a); b=np.array(b)
            return math.degrees(math.acos(float(np.clip(np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b)), -1, 1))))
        direction_change = angle(original_stats['radiance_direction_first_moment'],after_stats['radiance_direction_first_moment'])
        peak_direction_change = angle(original_stats['peak_direction_unit_vector'],after_stats['peak_direction_unit_vector'])
        color_change = [relative(a,b) for a,b in zip(original_stats['solid_angle_mean_rgb'],after_stats['solid_angle_mean_rgb'])]
        warnings = []
        if abs(mean_delta) > .01: warnings.append('Pixel mean luminance changed by more than 1%')
        if peak_ratio < .5: warnings.append('Peak luminance fell by more than 50%; inspect small bright reflections')
        if direction_change > 1: warnings.append('Radiance direction first moment changed by more than 1 degree')
        if max(map(abs,color_change)) > .01: warnings.append('Integrated R/G/B radiance changed by more than 1%')
        if abs(energy_delta) > .01 or abs(quantization_delta) > .01:
            raise RuntimeError(f'Spherical mean/encoding radiance error exceeds 1%: {name}')

        # Shared exposure, source and output side-by-side at 1024x512 each.
        # Previews alone are SDR; all numerical comparison uses linear HDR data.
        exposure = .18 / max(original_stats['solid_angle_mean_luminance'], 1e-12)
        def preview(rgb):
            mapped = np.maximum(rgb.astype(np.float64) * exposure, 0)
            mapped = mapped / (1 + mapped)
            srgb = np.where(mapped <= .0031308, mapped * 12.92, 1.055 * np.power(mapped, 1/2.4) - .055)
            return np.rint(np.clip(srgb, 0, 1) * 255).astype(np.uint8)
        expanded = np.repeat(np.repeat(decoded,2,axis=0),2,axis=1)
        preview_name = name.removesuffix('.hdr') + '-before-after.png'
        # bpy pixels are bottom-up; PNG scanlines are top-down.
        write_png(out / preview_name, np.flipud(np.concatenate((preview(before), preview(expanded)), axis=1)))
        record = {
            'name':name, 'source_sha256':source_hashes[name], 'output_sha256':digest(candidate),
            'source_bytes':source_bytes, 'output_bytes':output_bytes,
            'bytes_reduction_fraction':1-output_bytes/source_bytes,
            'before':original_stats, 'filtered_float_reference':reference_stats, 'after':after_stats,
            'mean_luminance_relative_change':mean_delta,
            'solid_angle_mean_relative_change':energy_delta,
            'rgbe_quantization_solid_angle_mean_relative_change':quantization_delta,
            'peak_luminance_retained_fraction':peak_ratio,
            'radiance_direction_first_moment_change_degrees':direction_change,
            'peak_direction_change_degrees':peak_direction_change,
            'solid_angle_mean_rgb_relative_change':color_change,
            'rgbe_quantization_max_channel_abs_error':float(np.abs(delta).max()),
            'rgbe_quantization_channel_rmse':float(np.sqrt(np.mean(delta*delta))),
            'warnings':warnings, 'comparison_png':preview_name,
        }
        results.append(record)
        print(json.dumps(record, ensure_ascii=True, allow_nan=False), flush=True)

    # Assets can only be replaced when the explicit --apply switch was supplied.
    if digest(license_path) != license_hash:
        raise RuntimeError('License changed concurrently')
    for name in NAMES:
        if digest(env / name) != source_hashes[name]:
            raise RuntimeError('Source changed concurrently; refusing replacement: ' + name)
    if args.apply:
        replaced = []
        try:
            for name in NAMES:
                staging = out / (name + '.apply')
                shutil.copyfile(candidates / name, staging)
                os.replace(staging, env / name)
                replaced.append(name)
            for record in results:
                if digest(env / record['name']) != record['output_sha256']:
                    raise RuntimeError('Installed HDR hash mismatch')
        except Exception:
            for name in replaced:
                shutil.copyfile(backup / name, env / name)
            raise
    else:
        for name in NAMES:
            assert digest(env / name) == source_hashes[name]

    report = {
        'mode':'applied' if args.apply else 'prepared_only_live_assets_unchanged',
        'blender':bpy.app.version_string, 'numpy':np.__version__,
        'method':'linear RGB 2x2 exact area filter, latitude solid-angle weighted; no tone mapping/clipping on HDR path',
        'format':'Radiance 32-bit_rle_rgbe', 'license_sha256':license_hash,
        'license_unchanged':digest(license_path)==license_hash,
        'backup_directory':str(backup), 'results':results,
        'total_source_bytes':sum(r['source_bytes'] for r in results),
        'total_output_bytes':sum(r['output_bytes'] for r in results),
    }
    write_json(out / ('applied.json' if args.apply else 'prepared.json'), report)
    lines = ['# Reward HDR resize quality comparison', '', 'Mode: **' + report['mode'] + '**', '',
             'Source: 1024x512. Candidate: 512x256 Radiance RGBE. No rendering or GPU drawing.',
             'Filter: linear radiance 2x2 area average, weighted by exact latitude strip solid angle.',
             'Peaks can decrease through spatial averaging; this is measured separately from RGBE quantization.', '',
             '| HDR | Original bytes | Candidate bytes | Saved | Mean change | Spherical mean change | Peak retained |',
             '| --- | ---: | ---: | ---: | ---: | ---: | ---: |']
    for r in results:
        lines.append(f"| {r['name']} | {r['source_bytes']:,} | {r['output_bytes']:,} | {r['bytes_reduction_fraction']:.2%} | {r['mean_luminance_relative_change']:+.4%} | {r['solid_angle_mean_relative_change']:+.4%} | {r['peak_luminance_retained_fraction']:.2%} |")
    lines += ['', 'All outputs checked for finite, non-negative values and HDR values above 1.',
              'LICENSE.md is unchanged; originals and license are retained in .tools/reward-environment-original/.',
              'Preview PNGs: LEFT = original; RIGHT = resized output expanded 2x with nearest pixels. Shared exposure and Reinhard/sRGB preview only; HDR files have no tone map.',
              'Numerical results and encoding error are available in prepared.json / applied.json.', '']
    for r in results:
        lines += ['## ' + r['name'], '', f"![Original / resized]({r['comparison_png']})", '']
        lines += [f"- Radiance directional first moment change: {r['radiance_direction_first_moment_change_degrees']:.5f} degrees; brightest pixel direction change: {r['peak_direction_change_degrees']:.5f} degrees.",
                  '- Integrated R/G/B radiance change: ' + ', '.join(f'{v:+.4%}' for v in r['solid_angle_mean_rgb_relative_change']) + '.',
                  f"- Peak luminance: {r['before']['peak_luminance']:.6g} -> {r['after']['peak_luminance']:.6g} (relative scene-linear units)."]
        lines += ['- ' + warning for warning in r['warnings']]
        lines.append('')
    (out / 'REPORT.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('COMPLETE ' + report['mode'], flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--blender', default=DEFAULT_BLENDER)
    parser.add_argument('--apply', action='store_true', help='Replace the three live HDRs after producing comparison reports')
    parser.add_argument('--worker', action='store_true', help=argparse.SUPPRESS)
    argv = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
    args = parser.parse_args(argv)
    if args.worker:
        worker(args)
        return
    out = args.root.resolve() / 'test-results/reward-environment-resize'
    out.mkdir(parents=True, exist_ok=True)
    command = [args.blender,'--background','--factory-startup','--disable-autoexec','--threads','4',
               '--python-exit-code','2','--python',str(Path(__file__).resolve()),'--','--worker','--root',str(args.root.resolve())]
    if args.apply: command.append('--apply')
    env = os.environ.copy()
    env.update(TEMP=str(out), TMP=str(out), PYTHONDONTWRITEBYTECODE='1')
    started = time.perf_counter()
    try:
        run = subprocess.run(command, cwd=out, env=env, capture_output=True, timeout=180)
        stdout, stderr, code = run.stdout, run.stderr, run.returncode
        timed_out = False
    except subprocess.TimeoutExpired as exc:
        stdout, stderr, code = exc.stdout or b'', exc.stderr or b'', -1
        timed_out = True
    label = 'apply' if args.apply else 'prepare'
    (out / (label + '.stdout.log')).write_bytes(stdout)
    (out / (label + '.stderr.log')).write_bytes(stderr)
    process = dict(mode=label, wall_seconds=time.perf_counter()-started, exit_code=code, timed_out=timed_out, timeout_seconds=180)
    write_json(out / (label + '.process.json'), process)
    print(json.dumps(process))
    print(stdout.decode('utf-8',errors='replace')[-6500:])
    if stderr: print(stderr.decode('utf-8',errors='replace'), file=sys.stderr)
    if code or timed_out: raise SystemExit(1)


if __name__ == '__main__':
    main()
