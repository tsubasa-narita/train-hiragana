import * as THREE from '../vendor/three/three.module.js';
import { ramp } from './reward-timeline.js';

const { lerp, smoothstep } = THREE.MathUtils;

function swimSurface(material, clock, phase, bend, slope) {
  material.customProgramCacheKey = () => `${phase}/${bend}/${slope}`;
  material.onBeforeCompile = shader => {
    shader.uniforms.swimTime = clock;
    shader.vertexShader = `uniform float swimTime;\n${shader.vertexShader}`
      .replace('#include <beginnormal_vertex>', `
        #include <beginnormal_vertex>
        ${slope}`)
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        ${phase}
        ${bend}`);
  };
}

// The forebody and both pectoral fins are a single closed, tapered surface.
function mantaShell() {
  const vertices = [], indices = [], colors = [];
  const span = 13.5, ribs = 52, sections = 32;
  const navy = new THREE.Color(0x103044), pale = new THREE.Color(0xc5e9e5);
  const shoulder = new THREE.Color(0x599ca6), mark = new THREE.Color(0x466e7e), tint = new THREE.Color();
  for (let i = 0; i <= ribs; i++) {
    const z = span * (2 * i / ribs - 1), wing = Math.abs(z) / span;
    const leading = 4.2 - 7.0 * wing ** 1.38, trailing = -5.2 + 2.25 * wing ** .78;
    const thickness = .048 + .91 * Math.exp(-13 * wing * wing) + .24 * (1 - wing);
    for (let j = 0; j < sections; j++) {
      const angle = j * Math.PI * 2 / sections, top = Math.sin(angle);
      const x = lerp(trailing, leading, .5 + Math.cos(angle) * .5);
      const y = top * thickness + .19 * wing * Math.cos(angle) - .18 * wing;
      vertices.push(x,y,z);
      if (top < 0) {
        const border = smoothstep(-top,.03,.32) * (1 - smoothstep(wing,.76,.98));
        const gills = Math.abs(z) > .62 && Math.abs(z) < 1.75 && x > -.56 && x < 1.77
          ? smoothstep(.70,.98,Math.cos((x + Math.abs(z) * .16) * 14.7)) : 0;
        const spots = smoothstep(.70,.91,Math.cos(x*3.2-z*2.8)*Math.cos(z*4.2+x*.75)) * (1-smoothstep(wing,.32,.58));
        tint.copy(navy).lerp(pale,border*.94).lerp(mark,Math.max(gills*.77,spots*.39));
      } else {
        const stripe = Math.exp(-Math.abs(wing-.28-(x-.6)*.055)*17) * smoothstep(x,.2,3.2);
        tint.copy(navy).lerp(shoulder,stripe*.61 + top*.07);
      }
      colors.push(tint.r,tint.g,tint.b);
      if (i === ribs) continue;
      const a=i*sections+j,b=(i+1)*sections+j,an=i*sections+(j+1)%sections,bn=(i+1)*sections+(j+1)%sections;
      indices.push(a,an,b,an,bn,b);
    }
  }
  for (const [base,reverse] of [[0,true],[ribs*sections,false]]) {
    for (let j=1;j<sections-1;j++) indices.push(base,base+j+(reverse?1:0),base+j+(reverse?0:1));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

function curvedTube(points, radius, endScale) {
  const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const segments=22, sides=8, frames=path.computeFrenetFrames(segments,false), vertices=[], indices=[];
  const p=new THREE.Vector3();
  for(let i=0;i<=segments;i++){
    const t=i/segments,center=path.getPointAt(t),r=radius*lerp(1,endScale,t**.7);
    for(let j=0;j<sides;j++){
      const angle=j*Math.PI*2/sides;
      p.copy(center).addScaledVector(frames.normals[i],Math.cos(angle)*r).addScaledVector(frames.binormals[i],Math.sin(angle)*r);
      vertices.push(p.x,p.y,p.z);
      if(i<segments){
        const a=i*sides+j,b=(i+1)*sides+j,an=i*sides+(j+1)%sides,bn=(i+1)*sides+(j+1)%sides;
        indices.push(a,b,an,an,b,bn);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

function createManta(kit, clock){
  const {own,mesh,material}=kit;
  const skin=material({vertexColors:true,side:THREE.DoubleSide,roughness:.52,emissive:0x416d7c,emissiveIntensity:.14});
  swimSurface(skin,clock,`
    float wing = abs(position.z)/13.5;
    float beat = sin(swimTime*2.35-wing*1.04+position.x*.11);`,
    'transformed.y += pow(wing,1.85)*beat*3.05;', `
    float s = abs(position.z)/13.5;
    float phase = swimTime*2.35 - s*1.04 + position.x*.11;
    objectNormal.z -= objectNormal.y * sign(position.z) * (pow(s,.85)*sin(phase)*1.85 - 1.04*pow(s,1.85)*cos(phase))*.226;
    objectNormal.x -= objectNormal.y * pow(s,1.85)*cos(phase)*.335;`);
  const manta=mesh(own(mantaShell()),skin);manta.name='swimming-manta';
  const dark=material({color:0x102a3e,roughness:.34}), edge=material({color:0x3c7b90,roughness:.52,side:THREE.DoubleSide});
  const sphere=own(new THREE.SphereGeometry(1,14,9));
  manta.add(mesh(sphere,dark,4.07,-.25,0,.24,.135,1.32));
  for(const side of [-1,1]){
    const tips=[[3.35,-.23,side*1.51],[4.33,-.33,side*1.43],[5.07,-.43,side*1.34],[5.48,-.01,side*1.12]];
    manta.add(mesh(own(curvedTube(tips,.28,.20)),edge));
    manta.add(mesh(sphere,edge,3.31,.02,side*2.14,.34,.29,.27));
    manta.add(mesh(sphere,dark,3.49,.036,side*2.28,.19,.163,.11));
  }
  const tail=own(curvedTube([[-4.5,-.11,0],[-6.4,-.35,.21],[-9.1,-.47,.48],[-11.6,-.29,.11],[-13,-.13,-.27]],.155,.036));
  manta.add(mesh(tail,edge));
  manta.add(mesh(sphere,edge,-4.32,.46,0,.54,.56,.13));
  return manta;
}

function fishGeometry() {
  const points=[],colors=[],indices=[];
  const ribs=[[-.89,.021,.03],[-.72,.09,.064],[-.42,.18,.12],[-.12,.29,.18],[.23,.30,.18],[.56,.23,.138],[.80,.135,.088],[.96,.06,.043],[1,.013,.017]];
  function vertex(x,y,z,tint){points.push(x,y,z);colors.push(...tint);return points.length/3-1;}
  for(const [x,height,width] of ribs)for(let j=0;j<10;j++){
    const a=j*Math.PI/5,y=Math.cos(a),z=Math.sin(a);
    const upper=smoothstep(y,-.26,.85),band=.84+.16*Math.cos(x*13.7-y*1.8);
    const tint=[lerp(.86,.34,upper)*band,lerp(.94,.57,upper)*band,lerp(.94,.69,upper)];
    if(x===.80 && (j===2||j===8))tint.splice(0,3,.025,.045,.08);
    vertex(x,y*height,z*width,tint);
  }
  for(let i=0;i<ribs.length-1;i++)for(let j=0;j<10;j++){
    const a=i*10+j,b=a+10,an=i*10+(j+1)%10,bn=an+10;
    indices.push(a,an,b,an,bn,b);
  }
  function fin(points){indices.push(...points.map(p=>vertex(...p,[.47,.69,.77])));}
  fin([[-.79,0,0],[-1.19,.35,0],[-.98,0,0]]);
  fin([[-.79,0,0],[-.98,0,0],[-1.19,-.29,0]]);
  fin([[.35,.223,0],[.01,.46,0],[-.44,.133,0]]);
  fin([[.33,-.06,.14],[-.35,-.225,.33],[-.12,-.15,.13]]);
  fin([[.33,-.06,-.14],[-.12,-.15,-.13],[-.35,-.225,-.33]]);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

function createShoal(kit, clock, reduced) {
  const {own,batch,material,random}=kit;
  const finish=material({color:0xffffff,vertexColors:true,side:THREE.DoubleSide,emissive:0x246776,emissiveIntensity:.42,metalness:.14,roughness:.39});
  swimSurface(finish,clock,`
    float phase=swimTime*6.3+instanceMatrix[3].x*.41+instanceMatrix[3].z*.36;
    float weight = pow(clamp(.44-.51*position.x,0.,1.),1.75);`,
    `transformed.z += sin(phase+position.x*2.5)*.36*weight;
    transformed.y += sin(phase*.51)*.18;`, '');
  const fish=[];
  for(let i=0;i<(reduced?58:128);i++){
    const group=i%3;
    const x=(random()-.5)*56+[-17,4,15][group],z=14+group*6+random()*10, y=5.8+group*3.55+random()*3.4;
    const size=.27+random()*.78;
    fish.push([x,y,z,size,size,size,-.17+group*.13+(random()-.5)*.19,0,0,[0xf7c376,0x93d1df,0xcddef0][group]]);
  }
  const school=batch(own(fishGeometry()),finish,fish);school.name='reef-fish-shoal';
  return school;
}

function seaFan() {
  const shape=new THREE.BufferGeometry(),v=[],indices=[];
  for(let i=0;i<=16;i++){
    const t=i/16,spread=Math.sin(Math.PI*t)*(.20+.30*t);
    for(const side of [-1,1])v.push(side*spread+.21*t*t,t,.11*Math.sin(t*4)+side*.075*Math.sin(t*8));
    if(i<16){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  shape.setAttribute('position',new THREE.Float32BufferAttribute(v,3));shape.setIndex(indices);shape.computeVertexNormals();
  return shape;
}

function createReef(kit, clock) {
  const {own,batch,material,random}=kit;
  const rocks=[],coral=[],grass=[],tips=[];
  const rockColors=[0x426e83,0x315c71,0x556d8a], coralColors=[0xec8f7d,0xcc7591,0xd7ae7a,0x867bb8];
  for(let i=0;i<180;i++){
    const x=random()*670-335,z=(i%2?1:-1)*(10.5+random()*69),size=1.3+random()*5.6;
    const base=-13.36,tint=rockColors[i%3];
    rocks.push([x,base+size*.18,z,size,size*.57,size*.74,random()*6.28,.17*random(),.26*random(),tint]);
    if(Math.abs(z)>43)continue;
    const height=1.3+random()*2.3,top=base+height,shell=coralColors[i%4];
    const centre=x+Math.cos(i)*size*.46;
    coral.push([centre,base+height/2,z,.37,height,.37,0,0,.02,shell]);
    for(let part=0;part<5;part++){
      const side=part%2===0?1:-1,angle=side*(.46+random()*.28),span=.77+random()*.81;
      const y=base+height*(.3+.111*part),px=centre+Math.sin(angle)*span*.43;
      coral.push([px,y+Math.cos(angle)*span*.44,z,.19,span,.19,0,.13,-angle,shell]);
      tips.push([px+Math.sin(angle)*span*.46,y+Math.cos(angle)*span*.91,z-.08,.19,.19,.19,0,0,0,shell]);
    }
    tips.push([centre,top,z,.26,.21,.26,0,0,0,shell]);
    for(let j=0;j<5;j++){
      const reach=1.6+random()*3.9;
      grass.push([x+(random()-.5)*3,base-.06,z+(random()-.5)*3,reach*.5,reach,reach*.51,random()*6.28,.09,.17*Math.sin(j),j%2?0x63957a:0x388a76]);
    }
  }
  batch(own(new THREE.DodecahedronGeometry(1,1)),material({color:0xffffff,roughness:.94}),rocks);
  const matte=material({color:0xffffff,emissive:0x943443,emissiveIntensity:.13});
  batch(own(new THREE.CylinderGeometry(.65,1,1,7)),matte,coral);
  batch(own(new THREE.IcosahedronGeometry(1,0)),matte,tips);
  const kelp=material({color:0xffffff,emissive:0x215749,emissiveIntensity:.18,side:THREE.DoubleSide});
  swimSurface(kelp,clock,'float current = swimTime*1.25 + instanceMatrix[3].x*.31;',
    'transformed.x += position.y*position.y*.26*sin(current + position.y*1.8);', '');
  batch(own(seaFan()),kelp,grass);
}

export function buildSeaLife(kit,reduced){
  const clock={value:0};
  createReef(kit,clock);
  const school=createShoal(kit,clock,reduced),manta=createManta(kit,clock);
  manta.scale.setScalar(.88);
  return (seconds,headX)=>{
    const t=reduced?4.5:seconds;
    clock.value=t;
    school.position.x=headX+t*3.45-17;
    const passing=ramp(2.4,8.7,t);
    manta.position.set(headX+20.7-t*4.54,10.75+2.7*Math.sin(passing*Math.PI),21.6-t*.84);
    manta.rotation.set(.36-.36*ramp(2.9,7.2,t),.57,.041*Math.sin(t*1.23));
  };
}
