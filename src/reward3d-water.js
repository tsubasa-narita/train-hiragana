import * as THREE from '../vendor/three/three.module.js';

// A fixed skyline reflection atlas, assembled from the same windows and
// buildings as the city. It needs no extra scene render or remote texture.
// The reflection plane is approximate; this is scenery, not a planar mirror.
export function createCityWater(buildings, keep, {lampStart,lampSpacing,lampZ,lampHeight,deckLampZ,deckLampY}) {
  const width=1024,height=256,left=-450,span=1100,base=-6.55,top=82;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#050b14';ctx.fillRect(0,0,width,height);
  const px=x=>(x-left)/span*width,py=y=>(1-(y-base)/(top-base))*height;
  for(const b of [...buildings].sort((a,b)=>b.z-a.z)){
    const x=px(b.x-b.w/2),y=py(base+b.h),w=b.w/span*width,h=b.h/(top-base)*height;
    ctx.globalAlpha=1;ctx.fillStyle=['#07111b','#0b131c','#06111c','#0c121a'][b.style];ctx.fillRect(x,y,w,h);
    for(const win of b.windows)if(win.lit){
      ctx.globalAlpha=win.brightness;ctx.fillStyle=win.color;
      // Canvas facade rows start at the roof, matching the actual UV atlas.
      ctx.fillRect(x+win.x/256*w,y+win.y/512*h,win.w/256*w,win.h/512*h);
    }
  }
  ctx.globalAlpha=1;
  const skyline=keep(new THREE.CanvasTexture(canvas));skyline.colorSpace=THREE.SRGBColorSpace;
  const material=keep(new THREE.ShaderMaterial({
    uniforms:{time:{value:0},skyline:{value:skyline},
      lamps:{value:new THREE.Vector4(lampStart,lampSpacing,lampZ,lampHeight)},
      deck:{value:new THREE.Vector2(deckLampZ,deckLampY)}},
    vertexShader:`varying vec3 vWorld;
      void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 vWorld;uniform float time;uniform sampler2D skyline;
      uniform vec4 lamps;uniform vec2 deck;
      float lampDistance(float x){
        return abs(mod(x-lamps.x+lamps.y*.5,lamps.y)-lamps.y*.5);
      }
      void main(){
        vec2 p=vWorld.xz;
        float a=dot(p,vec2(.73,.38))-time*.65,b=dot(p,vec2(-.24,1.14))+time*.48;
        float c=dot(p,vec2(2.7,.8))+time*.8;
        // Analytic wave slopes, with pixel-footprint attenuation on the tiny
        // ripple. Avoid shimmering white pixels as the camera pulls away.
        float fine=1.-smoothstep(.5,2.,fwidth(c));
        float d=dot(p,vec2(.13,2.27))-time*.77;
        vec3 normal=normalize(vec3(.013*cos(a)-.005*cos(b)+.005*cos(c)*fine,1.,
          .006*cos(a)+.012*cos(b)+.005*cos(d)*(1.-smoothstep(.45,2.,fwidth(d)))));
        vec3 view=normalize(cameraPosition-vWorld),ray=reflect(-view,normal);
        float fresnel=.04+.96*pow(1.-max(0.,dot(view,normal)),5.);
        vec3 color=mix(vec3(.006,.020,.033),vec3(.055,.11,.19),fresnel);
        if(ray.z>.01){
          vec3 hit=vWorld+ray*((62.-vWorld.z)/ray.z);
          vec2 uv=vec2((hit.x+450.)/1100.,(hit.y+6.55)/88.55);
          if(uv.x>0.&&uv.x<1.&&uv.y>0.&&uv.y<1.){
            vec3 reflection=texture2D(skyline,uv).rgb*.5;
            reflection+=(texture2D(skyline,uv+vec2(.0006,0.)).rgb+texture2D(skyline,uv-vec2(.0006,0.)).rgb)*.25;
            color+=reflection*(.42+fresnel*.75)*1.35;
          }
          // The lamps live on the same promenade as their reflections.
          // The wave normal breaks each amber trail into short, moving bands.
          vec3 quay=vWorld+ray*((lamps.z-vWorld.z)/ray.z);
          float column=lampDistance(quay.x);
          float row=quay.y-lamps.w;
          float streak=exp(-column*column*.48-row*row*.25);
          float strips=.24+.76*smoothstep(-.40,.94,cos(d+.75*sin(a)));
          color+=vec3(.45,.21,.07)*streak*strips*(.25+fresnel*.66)
            *(1.-smoothstep(100.,420.,length(cameraPosition-vWorld)));
        }
        if(abs(ray.z)>.014){
          float distanceToDeck=(deck.x-vWorld.z)/ray.z;
          vec3 girder=vWorld+ray*distanceToDeck;
          float column=lampDistance(girder.x), row=girder.y-deck.y;
          float falloff=1.-smoothstep(27.,130.,distanceToDeck);
          float light=exp(-column*column*.64-row*row*.20)
            *smoothstep(0.,3.,distanceToDeck)*falloff;
          float gaps=.21+.79*smoothstep(-.57,.83,cos(d+.89*sin(b)));
          float inFrame=smoothstep(-334.,-330.,girder.x)*(1.-smoothstep(326.,332.,girder.x));
          color+=vec3(.61,.29,.085)*light*gaps*inFrame*(.31+.52*fresnel);
        }
        float shimmer=pow(max(0.,dot(reflect(-normalize(vec3(.6,.4,.5)),normal),view)),90.);
        color+=vec3(.25,.38,.5)*shimmer*.25;
        float haze=smoothstep(150.,650.,length(cameraPosition-vWorld));
        color=mix(color,vec3(.014,.034,.065),haze*.7);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  material.name='rippling-city-reflections';
  return material;
}
