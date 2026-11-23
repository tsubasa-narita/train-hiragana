import * as THREE from '../vendor/three/three.module.js';
import {ramp} from './reward-timeline.js';

// Each star leaves a short curved trail. Fixed attributes let the GPU advance
// the entire shell with one clock uniform, including when playback seeks.
function createFirework(keep, random, color, willow) {
  const velocities=[], sparks=[], colors=[];
  const gold=new THREE.Color(0xffaa44), ivory=new THREE.Color(0xffedbb);
  const rim=willow?gold:new THREE.Color(color).lerp(new THREE.Color(0x80dcff),.55);
  const tint=new THREE.Color();
  const stars=willow?78:62, samples=11;
  for(let i=0;i<stars;i++){
    const height=1-2*(i+.5)/stars;
    const radius=Math.sqrt(1-height*height), angle=i*2.4+random()*.13;
    const speed=(i%4===0?.55:1)*(.82+random()*.24);
    const vx=Math.cos(angle)*radius*speed, vy=height*speed, vz=Math.sin(angle)*radius*speed;
    const life=1.3+random()*(willow?.88:.62);
    const size=.8+random()*.42;
    tint.copy(i%4===0?ivory:rim).lerp(ivory,random()*.27);
    for(let j=0;j<samples;j++){
      const tail=j/(samples-1);
      velocities.push(vx,vy,vz); sparks.push(tail,life,size);
      colors.push(tint.r,tint.g,tint.b);
    }
  }
  const geometry=keep(new THREE.BufferGeometry());
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(velocities,3));
  geometry.setAttribute('spark',new THREE.Float32BufferAttribute(sparks,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const material=keep(new THREE.ShaderMaterial({
    vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{age:{value:0},pointScale:{value:1},droop:{value:willow?2.5:1.65}},
    vertexShader:`
      uniform float age, pointScale, droop;
      attribute vec3 spark;
      varying vec3 vLight;
      void main(){
        float tail=spark.x;
        float t=max(0.,age-tail*min(.32,age*.65));
        float travel=19.*(1.-exp(-1.45*t));
        vec3 p=position*travel;
        p.y-=droop*t*t;
        float fade=smoothstep(0.,.11,age)*(1.-smoothstep(spark.y*.5,spark.y,age));
        vLight=mix(color,vec3(1.,.9,.71),.32*(1.-tail))*fade*mix(2.3,.09,tail);
        gl_PointSize=max(1.,pointScale*spark.z*mix(1.,.48,tail));
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }`,
    fragmentShader:`
      varying vec3 vLight;
      void main(){
        vec2 uv=gl_PointCoord*2.-1.;
        float r=dot(uv,uv);
        gl_FragColor=vec4(vLight,exp(-3.8*r)*(1.-smoothstep(.7,1.,r)));
      }`,
  }));
  const points=new THREE.Points(geometry,material);
  points.frustumCulled=false;
  points.visible=false;
  return points;
}

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
    for(let b=0;b<2;b++){
      const shell=createFirework(keep,random,color,b===0);
      group.add(shell);bursts.push(shell);
    }
  }
  const centre=new THREE.Vector3(),buffer=new THREE.Vector2();
  for(const shell of bursts)shell.onBeforeRender=renderer=>{
    renderer.getDrawingBufferSize(buffer);
    shell.material.uniforms.pointScale.value=THREE.MathUtils.clamp(Math.min(buffer.x,buffer.y)*.011,3.8,12);
  };
  return {
    update(moment,pose,camera){
      if(disposed)return;
      const t=moment.seconds;
      moteMaterial.opacity=(.08+.40*moment.reveal+.22*moment.finale)*(1-ramp(9.7,10,t)*.25);
      for(const m of motes)m.sprite.position.set(pose.x+m.x+Math.sin(t*.4+m.phase)*.7,m.y+Math.sin(t*.5+m.phase)*.3,pose.z+m.z);
      for(const m of mist){
        m.material.opacity=.32*(1-ramp(2.2,4.8,t));
        m.sprite.position.set(-27-m.i*4,1.8+m.i*.8,m.side*(6+m.i*3+moment.reveal*20));
      }
      for(const [index,shell] of bursts.entries()){
        const age=t-(index===0?7.85:8.84);
        shell.visible=age>=0&&age<2.2;
        if(!shell.visible)continue;
        shell.material.uniforms.age.value=age;
        // Place the shells beyond the skyline, where buildings and wires
        // naturally mask sparks. Leave sky at both edges on narrow phones.
        camera.updateMatrixWorld();
        centre.set(index===0?-.45:.42,index===0?.68:.57,.99).unproject(camera);
        centre.sub(camera.position).normalize().multiplyScalar(450).add(camera.position);
        shell.position.copy(centre);shell.quaternion.copy(camera.quaternion);
        shell.scale.setScalar((index===0?3.05:2.7)*Math.min(1,camera.aspect));
      }
    },
    dispose(){if(disposed)return;disposed=true;for(const resource of resources)resource.dispose();group.removeFromParent();group.clear();},
  };
}
