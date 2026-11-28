import * as THREE from '../vendor/three/three.module.js';
import { scenery } from './reward3d-dream.js';
import { mouldedBox } from './reward3d-dream-town.js';
import { detailSurface, sceneryDetailTexture } from './reward3d-surface.js';
import { ramp } from './reward-timeline.js';

const palette={blue:0x255acb,rail:0x377ef4,red:0xdd3943,yellow:0xf2ba27,cream:0xffe6b6,mint:0x3aae9a};
const pi=Math.PI;

function carpet(kit) {
  const {mesh,own,material}=kit;
  const rug=detailSurface(material({color:0x84c2b6,roughness:1}),own(sceneryDetailTexture()),{
    projection:[1,.05,1],scale:[5.2,4.0],strength:[.30,.38,.61],tint:0xc0d8c6,
  });
  const ground=mesh(own(new THREE.PlaneGeometry(850,480)),rug,0,-6.001,18);
  ground.rotation.x=-pi/2;
  const colors=[0xb9ddc9,0xa7d4c2,0x8ccbbd,0xa2d3cb];
  const tile=own(new THREE.PlaneGeometry(1,1).rotateX(-pi/2));
  const patches=[];
  for(let row=-4;row<=4;row++)for(let col=-6;col<=7;col++){
    patches.push([col*32,-5.993,row*32,31.91,1,31.91,0,0,0,colors[((col*3+row*5)%4+4)%4]]);
  }
  kit.batch(tile,detailSurface(material({color:0xffffff,roughness:1}),own(sceneryDetailTexture()),{
    projection:[1,.05,1],scale:[6,4.4],strength:[.18,.23,.42],tint:0xe0ebd7,
  }),patches).name='woven-rug-squares';
}

function snapTrack(kit, rounded, gauge) {
  const {own,batch,material,box}=kit;
  const deck=[],rails=[],ties=[],tabs=[],brackets=[],feet=[],tops=[];
  const railHalf=gauge/2,step=5.6;
  for(let i=-38;i<=55;i++){
    const x=i*step;
    const inBridge=x>32&&x<83;
    deck.push([x,-.28,0,step-.075,.43,3.24,0,0,0,i%3===0?0x3b73d8:0x2e68d0]);
    for(const z of [-railHalf,railHalf]){
      rails.push([x,.064,z,step-.018,.172,.145]);
      rails.push([x,.008,z,step-.018,.074,.27]);
    }
    for(const dx of [-2,-1.2,-.4,.4,1.2,2])ties.push([x+dx,-.044,0,.225,.10,2.61]);
    for(const z of [-1.13,1.13]){
      tabs.push([x+step*.5,-.11,z,.40,.118,.40]);
      tabs.push([x+step*.5,.004,z,.19,.024,.19]);
    }
    if(i%2||inBridge)continue;
    feet.push([x,-5.63,0,1.89,.67,4.17]);
    brackets.push([x,-3.21,0,1.24,4.37,2.42]);
    for(const z of [-.75,0,.75])tops.push([x,-3.19,z,1.28,3.54,.14]);
    tops.push([x,-.66,0,1.89,.40,3.57]);
  }
  batch(rounded,material({color:0xffffff,roughness:.35,metalness:.06}),deck).name='blue-snap-rail-bed';
  batch(box,material({color:palette.rail,roughness:.30,metalness:.07}),rails).name='playroom-railheads';
  batch(rounded,material({color:0x437cd6,roughness:.43}),ties);
  batch(own(new THREE.CylinderGeometry(1,1,1,12)),material({color:0x1b52ad,roughness:.40}),tabs);
  batch(rounded,material({color:palette.yellow,roughness:.40}),[...feet,...brackets],true).name='snap-in-pier-blocks';
  batch(rounded,material({color:0xf8cf4f,roughness:.45}),tops);
}

function trussBridge(kit, rounded) {
  const {batch,material}=kit;
  const sides=[],braces=[],crossbars=[],pillars=[],bolts=[];
  const start=27,end=95,width=3.6;
  const beam=(x1,y1,x2,y2,z,size,depth)=>{
    braces.push([(x1+x2)/2,(y1+y2)/2,z,Math.hypot(x2-x1,y2-y1),size,depth,0,0,Math.atan2(y2-y1,x2-x1)]);
  };
  const xPositions=Array.from({length:9},(_,i)=>THREE.MathUtils.lerp(start,end,i/8));
  const height=i=>.44+5.6*Math.sin(pi*i/8)**.68;
  for(let i=0;i<8;i++){
    const x=xPositions[i],next=xPositions[i+1];
    beam(x,-1.04,next,-1.04,-width,.66,.61);
    beam(x,-1.04,next,-1.04,width,.79,.86);
    beam(x,height(i),next,height(i+1),width,.70,.56);
    beam(x,-.91,next,height(i+1),width,.39,.45);
    crossbars.push([(x+next)/2,-.78,0,.64,.44,width*2+.6]);
    if(i>0)sides.push([x,(height(i)-.92)/2,width,.48,height(i)+.92,.59]);
    bolts.push([x,-1.04,-width-.34,.36,.36,.09]);
    bolts.push([x,-1.04,width-.40,.42,.42,.09]);
  }
  for(const x of [start,end])for(const z of [-width,width]){
    pillars.push([x,-3.57,z,3.35,4.30,1.96]);
    pillars.push([x,-5.69,z,3.87,.55,2.35]);
    pillars.push([x,-1.32,z,3.88,.32,2.26]);
  }
  batch(rounded,material({color:palette.red,roughness:.31,metalness:.06}),[...sides,...braces,...crossbars],true).name='coral-snap-arch-bridge';
  batch(rounded,material({color:0xffd663,roughness:.40}),pillars,true);
  batch(rounded,material({color:0xffbd6c,roughness:.32}),bolts);
}

function blocksAndRoom(kit, rounded) {
  const {own,batch,mesh,material}=kit;
  const wall=material({color:0xf4d7a8,roughness:.95});
  mesh(rounded,wall,0,50,93,690,114,9).name='sunlit-playroom-wall';
  mesh(rounded,material({color:0xf6e7c2,roughness:.7}),0,-3.2,87,610,6,2.1);
  const furniture=material({color:0xd7a968,roughness:.73});
  const ledges=[],wallWindows=[],trim=[],dividers=[];
  for(const x of [-76,68,212]){
    ledges.push([x,11,78,82,2.8,22]);
    for(const px of [x-37,x+37])ledges.push([px,3,78,5.5,17.1,22]);
    trim.push([x,61,87.6,67,57,1.85]);
    wallWindows.push([x,61,86.51,59.5,49.4,.75]);
    dividers.push([x,61,85.9,2,50,1.2]);
    dividers.push([x,59,85.9,60,2,1.2]);
  }
  batch(rounded,furniture,ledges,true);
  batch(rounded,material({color:0xf8f0d5,roughness:.53}),trim);
  batch(rounded,material({color:0xcdefee,emissive:0x94d3dc,emissiveIntensity:.62,roughness:.46}),wallWindows);
  batch(rounded,material({color:0xfff1d2,roughness:.56}),dividers);

  const forms=[],pegs=[],triangle=[],counters=[];
  for(const [x,z,turn] of [[-43,11,.12],[-1,17,-.2],[31,17,.11],[75,24,.16],[104,15,-.09],[147,20,.20],[188,13,-.15],[226,23,.25]]){
    const y=-6;
    forms.push([x,y+2.3,z,13,4.6,7,turn,0,0,palette.yellow]);
    forms.push([x-3.1,y+5.9,z-.36,5.5,3.1,6.1,turn,0,0,palette.blue]);
    forms.push([x+3.5,y+5.25,z+.40,4.7,1.4,5.8,turn,0,0,palette.mint]);
    triangle.push([x-3.1,y+8.5,z-.36,3.15,3.0,7,turn,pi*.5,0,palette.red]);
    for(const dx of [-4.4,-1.5,1.5,4.4])for(const dz of [-1.9,1.9])
      pegs.push([x+dx,y+4.32,z+dz,.68,.63,.68,0,0,0,0xffd057]);
    for(let i=0;i<3;i++)counters.push([x+7.2+i*1.2,y+.88,z+4.3+i*.9,.81,1.75,.81,0,0,-.09*i,[0x59b89e,palette.red,0xf6a963][i]]);
  }
  const colorful=material({color:0xffffff,roughness:.44,metalness:.04});
  batch(rounded,colorful,forms,true).name='oversized-construction-blocks';
  batch(own(new THREE.CylinderGeometry(1,1,1,12)),colorful,[...pegs,...counters],true);
  batch(own(new THREE.CylinderGeometry(1,1,1,3)),colorful,triangle,true);
}

function toyCharacters(kit) {
  const {own,mesh,batch,material,group}=kit;
  const oval=own(new THREE.SphereGeometry(1,20,14));
  const plush=material({color:0xe7ac7d,roughness:1});
  const bunny=material({color:0xf2d4b1,roughness:1});
  const pink=material({color:0xf1a6a0,roughness:.94});
  const muzzle=material({color:0xffeacc,roughness:.97});
  const button=material({color:0x4a3f3e,roughness:.29,metalness:.08});
  const eyeShine=material({color:0xffeee2,roughness:.30});
  const ribbon=material({color:palette.mint,roughness:.50});
  const staticParts=new Map();
  function character(x,z,shortEars,theta,base=-6) {
    const toy=new THREE.Group();
    toy.name=shortEars?'plush-bear':'plush-rabbit';
    toy.position.set(x,base,z);toy.rotation.y=theta;
    group.add(toy);
    const bodyColor=shortEars?plush:bunny;
    const sin=Math.sin(theta),cos=Math.cos(theta);
    function part(finish,localX,y,localZ,sx,sy,sz,rotation=0) {
      if(!staticParts.has(finish))staticParts.set(finish,[]);
      staticParts.get(finish).push([x+localX*cos+localZ*sin,y+base,z+localZ*cos-localX*sin,
        sx,sy,sz,theta,0,rotation]);
    }
    part(bodyColor,0,3.02,0,3.6,3.2,2.7);
    part(muzzle,0,2.87,-1.9,2.43,2.50,1.14);
    part(bodyColor,0,7.02,-.45,3.35,2.96,2.78);
    for(const side of [-1,1]){
      part(bodyColor,side*2.42,1.08,-1.22,1.55,1.21,1.88);
      part(muzzle,side*2.43,.91,-2.68,1.03,.82,.63);
      part(bodyColor,side*2.77,shortEars?9.37:10.46,-.25,shortEars?1.26:1.01,shortEars?1.26:2.66,.77,-side*.25);
      part(pink,side*2.81,shortEars?9.36:10.51,-.89,shortEars?.79:.57,shortEars?.82:1.88,.32,-side*.25);
      part(button,side*1.20,7.34,-2.98,.37,.43,.28);
      part(eyeShine,side*1.20-.082,7.48,-3.225,.105,.115,.056);
      part(pink,side*2.1,6.62,-2.64,.55,.31,.21,-side*.17);
      part(ribbon,side*.67,4.84,-2.54,1.03,.49,.35,side*.29);
    }
    part(muzzle,0,6.41,-2.98,1.49,1.02,.66);
    part(button,0,6.79,-3.585,.42,.28,.18);
    part(ribbon,0,4.83,-2.83,.39,.44,.27);
    part(bodyColor,-3.12,2.86,-.04,1.13,2.24,1.15,-.59);
    const arm=mesh(oval,bodyColor,3.07,4.03,.06,1.04,2.66,1.02);
    arm.castShadow=true;toy.add(arm);
    return arm;
  }
  const seats=kit.own(mouldedBox(.085));
  const cushions=material({color:0xf3ac8b,roughness:.96});
  batch(seats,cushions,[[-32,-4.7,9.8,8.7,2.6,7.4,-.23],[147,-4.7,10,8.7,2.6,7.4,-.17]],true);
  const arms=[character(-32,9.8,false,-.27,-3.4),character(35,11.6,true,-.23),character(147,10.0,false,-.34,-3.4)];
  for(const [finish,parts] of staticParts)batch(oval,finish,parts,true);
  return arms;
}

function signalAndPinwheels(kit,rounded) {
  const {own,mesh,material,group}=kit;
  const pole=own(new THREE.CylinderGeometry(1,1,1,12));
  const post=material({color:palette.red,roughness:.43});
  const toyYellow=material({color:palette.yellow,roughness:.36});
  const lamp=material({color:0xffba64,emissive:0xf68743,emissiveIntensity:1.05,roughness:.29});
  const signalX=-20.7,signalZ=3.35;
  mesh(rounded,toyYellow,signalX,.30,signalZ,2.13,.64,1.38);
  mesh(rounded,post,signalX,2.26,signalZ,.43,3.7,.45);
  mesh(rounded,toyYellow,signalX,4.1,signalZ,1.20,1.48,.62);
  mesh(own(new THREE.SphereGeometry(1,16,12)),lamp,signalX+.64,4.19,signalZ-.22,.26,.43,.40);
  const blades=[];
  const petals=own(new THREE.SphereGeometry(1,16,10));
  const finishes=[0xef6d6f,0xf7bf44,0x59c2a5,0x5a88dc].map(color=>material({color,roughness:.34,metalness:.06}));
  for(const [x,z] of [[30,11.8],[127,12.2],[202,17.0]]){
    mesh(pole,toyYellow,x,.72,z,.21,13.46,.21);
    const rotor=new THREE.Group();
    rotor.position.set(x,7.1,z-.24);group.add(rotor);
    for(let i=0;i<4;i++){
      const angle=i*pi/2;
      const blade=mesh(petals,finishes[i],Math.sin(angle)*1.61,Math.cos(angle)*1.61,0,
        1.07,1.94,.25);
      blade.rotation.set(.23,0,-angle-.41);
      rotor.add(blade);
    }
    rotor.add(mesh(petals,toyYellow,0,0,-.22,.54,.54,.29));
    blades.push(rotor);
  }
  return {lamp,blades};
}

export function createPlayroomWorld(scene,{config,reduced=false}){
  const kit=scenery(scene,'toy-railway-playroom',16441);
  const rounded=kit.own(mouldedBox(.065));
  carpet(kit);
  snapTrack(kit,rounded,config.gauge??1.067);
  trussBridge(kit,rounded);
  blocksAndRoom(kit,rounded);
  const arms=toyCharacters(kit);
  const {lamp,blades}=signalAndPinwheels(kit,rounded);
  const green=new THREE.Color(0x7ded9e);
  function update(time){
    const launch=ramp(.62,1.12,time);
    lamp.color.set(0xffbc61).lerp(green,launch);
    lamp.emissive.copy(lamp.color);
    for(const [index,rotor] of blades.entries())rotor.rotation.z=index*.72+(reduced?0:time*(1.12+index*.19));
    for(const [index,arm] of arms.entries())arm.rotation.z=.78+(reduced?0:Math.sin(time*6-index*1.6)*.23*ramp(1,2,time));
  }
  update(0);
  return {group:kit.group,update,dispose:kit.dispose};
}
