import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {REWARD_3D_TRAINS} from '../src/reward3d-catalog.js';

test('four Blender libraries are self contained, compressed and preserve reusable prototypes',async()=>{
  for(const train of REWARD_3D_TRAINS){
    const data=await readFile(new URL(`../assets/reward3d/${train.id}.glb`,import.meta.url));
    assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
    assert.ok(data.length<2500000,'mobile download stays below 2.5 MB per train');
    const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
    assert.ok(json.extensionsUsed.includes('EXT_meshopt_compression'));
    const names=new Set(json.nodes.map(node=>node.name));
    for(const name of ['CAB','STANDARD','PANTOGRAPH','AXLE',...(train.greenCars.length?['GREEN']:[])])assert.ok(names.has(name),`${train.id}/${name}`);
    assert.ok(json.materials.some(m=>m.name.startsWith('HEADLAMP')));
    assert.ok(json.materials.some(m=>m.name.startsWith('CAB_GLASS')));
    assert.ok(json.materials.some(m=>m.pbrMetallicRoughness?.metallicFactor>.5));
    assert.ok(json.buffers.every(b=>!b.uri));assert.ok(json.images.every(i=>i.bufferView!==undefined&&!i.uri));
    assert.ok((await stat(new URL(`../design/reward3d/${train.id}.blend`,import.meta.url))).size>100000);
  }
});
