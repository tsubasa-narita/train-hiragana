import * as THREE from '../vendor/three/three.module.js';

// A single inexpensive finishing pass. The scene stays in linear HDR until
// soft highlight bloom, colour grading and the display transform are applied.
export function createFilmFinish(renderer){
  const type=renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
  const target=new THREE.WebGLRenderTarget(1,1,{type,depthBuffer:true,samples:2});
  target.texture.name='reward-linear-film';
  const size=new THREE.Vector2(),scene=new THREE.Scene(),camera=new THREE.Camera();
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
    uniforms:{image:{value:target.texture},pixel:{value:new THREE.Vector2(1,1)},bloom:{value:.12}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D image;uniform vec2 pixel;uniform float bloom;varying vec2 vUv;
      vec3 bright(vec2 uv){vec3 c=texture2D(image,uv).rgb;return c*max(0.,max(c.r,max(c.g,c.b))-1.15)/(max(c.r,max(c.g,c.b))+.001);}
      void main(){vec3 color=texture2D(image,vUv).rgb;vec2 p=pixel*4.;
        vec3 halo=bright(vUv)*.24;
        halo+=(bright(vUv+vec2(p.x,0.))+bright(vUv-vec2(p.x,0.))+bright(vUv+vec2(0.,p.y))+bright(vUv-vec2(0.,p.y)))*.19;
        color+=halo*bloom;
        float luma=dot(color,vec3(.2126,.7152,.0722));color=mix(vec3(luma),color,1.10);
        vec2 edge=(vUv-.5)*2.;color*=1.-.075*pow(dot(edge,edge)*.5,1.4);
        gl_FragColor=vec4(max(color,vec3(0.)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
  let disposed=false;
  return {
    render(world,view,moment){
      renderer.getDrawingBufferSize(size);
      if(size.x!==target.width||size.y!==target.height){target.setSize(size.x,size.y);material.uniforms.pixel.value.set(1/size.x,1/size.y);}
      renderer.setRenderTarget(target);renderer.render(world,view);
      const stats={calls:renderer.info.render.calls+1,triangles:renderer.info.render.triangles+2};
      material.uniforms.bloom.value=.10+moment.reveal*.12+moment.finale*.08;
      renderer.setRenderTarget(null);renderer.render(scene,camera);return stats;
    },
    dispose(){if(disposed)return;disposed=true;target.dispose();geometry.dispose();material.dispose();scene.clear();},
  };
}
