import * as THREE from '../vendor/three/three.module.js';

// A constant-radius curve lets the entire pre-bent consist move as one rigid
// transform: no per-frame uploads of thousands of instance matrices on phones.
export function bendTrainModel(train,radius){
  const original=new THREE.Matrix4(),local=new THREE.Matrix4(),pose=new THREE.Matrix4();
  const pitch=train.config?.pitch||train.group.userData.carPitch||20.6;
  function carPose(x){
    const index=THREE.MathUtils.clamp(Math.round(-x/pitch),0,train.carCount-1),s=-index*pitch;
    pose.makeRotationY(-s/radius);pose.setPosition(radius*Math.sin(s/radius),0,radius*(1-Math.cos(s/radius)));
    return s;
  }
  for(const item of [...train.group.children]){
    if(!item.isInstancedMesh)continue;
    for(let i=0;i<item.count;i++){
      item.getMatrixAt(i,original);const center=carPose(original.elements[12]);
      local.makeTranslation(-center,0,0).multiply(original);
      item.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(pose,local));
    }
    item.instanceMatrix.needsUpdate=true;item.computeBoundingBox();item.computeBoundingSphere();
  }
  for(const wheel of train.wheels){
    const center=carPose(wheel.position.x),carrier=new THREE.Group();
    carrier.applyMatrix4(pose);wheel.position.x-=center;train.group.add(carrier);carrier.add(wheel);
  }
  train.group.userData.curveRadius=radius;
}
