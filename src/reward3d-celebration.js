import * as THREE from '../vendor/three/three.module.js';
import {ramp} from './reward-timeline.js';

export function createCelebration(scene,{scenario,color='#83b939',reduced=false}={}){
  const group=new THREE.Group();group.name='cinema-celebration';scene.add(group);
  const resources=new Set(),keep=x=>(resources.add(x),x);
  let seed=7213,disposed=false;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.16,'rgba(255,255,255,.85)');
  gradient.addColorStop(.5,'rgba(255,255,255,.14)');gradient.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const texture=keep(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;
  // Small suspended motes catch the sun, rather than covering the train with UI.
  const motes=[],moteMaterial=keep(new THREE.SpriteMaterial({map:texture,color:scenario==='night'?0x9ce3ff:0xffe2a3,
    transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  for(let i=0;i<(reduced?12:42);i++){
    const sprite=new THREE.Sprite(moteMaterial),phase=random()*Math.PI*2;
    const data={sprite,x:random()*44-22,y:random()*10+.5,z:(i%2?1:-1)*(3+random()*9),phase};
    sprite.scale.setScalar(.045+random()*.12);group.add(sprite);motes.push(data);
  }
  // Mist banks at the portal peel away from the track as the view opens.
  const mist=[];
  if(scenario==='skybridge'){
    const material=keep(new THREE.SpriteMaterial({map:texture,color:0xe7f4ff,transparent:true,opacity:.6,depthWrite:false}));
    for(const side of [-1,1])for(let i=0;i<4;i++){
      const sprite=new THREE.Sprite(material);sprite.scale.set(12+i*3,7+i*2,1);group.add(sprite);
      mist.push({sprite,side,i,material});
    }
  }
  const bursts=[];
  if(scenario==='night'&&!reduced){
    const tint=new THREE.Color(color);
    for(let b=0;b<2;b++){
      const positions=new Float32Array(96*3),colors=[],directions=[];
      for(let i=0;i<96;i++){
        const angle=i/96*Math.PI*2+random()*.05,elevation=(random()-.5)*.25;
        directions.push(new THREE.Vector3(Math.cos(angle),Math.sin(angle),Math.sin(elevation)));
        const c=b===0?new THREE.Color(0xffcf79):tint.clone().lerp(new THREE.Color(0xaeefff),.55);
        c.multiplyScalar(3);colors.push(...c);
      }
      const geometry=keep(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
      geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
      const material=keep(new THREE.PointsMaterial({size:1.2,map:texture,vertexColors:true,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending}));
      const points=new THREE.Points(geometry,material);points.frustumCulled=false;group.add(points);
      bursts.push({points,geometry,material,directions,start:7.8+b*.65,b});
    }
  }
  return {
    update(moment,pose,finalPosition,camera){
      if(disposed)return;
      const t=moment.seconds;
      moteMaterial.opacity=(.08+.40*moment.reveal+.22*moment.finale)*(1-ramp(9.7,10,t)*.25);
      for(const m of motes)m.sprite.position.set(pose.x+m.x+Math.sin(t*.4+m.phase)*.7,m.y+Math.sin(t*.5+m.phase)*.3,pose.z+m.z);
      for(const m of mist){
        m.material.opacity=.32*(1-ramp(2.2,4.8,t));
        m.sprite.position.set(-27-m.i*4,1.8+m.i*.8,m.side*(6+m.i*3+moment.reveal*20));
      }
      for(const burst of bursts){
        const age=t-burst.start,active=age>=0&&age<2.2;
        burst.material.opacity=active?ramp(0,.12,age)*(1-ramp(.8,2.2,age)):.0;
        burst.points.visible=active;
        if(!active)continue;
        const position=burst.geometry.attributes.position;
        const radius=age*16/(1+age*.65);
        for(let i=0;i<burst.directions.length;i++){
          const d=burst.directions[i];position.setXYZ(i,d.x*radius,d.y*radius-age*age*1.4,d.z*radius);
        }
        position.needsUpdate=true;
        // Compose the two distant bursts in the upper sky. They never cover
        // the hero train, even when a phone's tall crop changes the lens.
        camera.updateMatrixWorld();
        const centre=new THREE.Vector3(burst.b===0?-.46:.48,burst.b===0?.55:.62,.99).unproject(camera);
        centre.sub(camera.position).normalize().multiplyScalar(110).add(camera.position);
        burst.points.position.copy(centre);burst.points.quaternion.copy(camera.quaternion);burst.points.renderOrder=2;
      }
    },
    dispose(){if(disposed)return;disposed=true;for(const resource of resources)resource.dispose();group.removeFromParent();group.clear();},
  };
}
