import * as THREE from '../vendor/three/three.module.js';

// A single inexpensive finishing pass. The scene stays in linear HDR until
// soft highlight bloom, colour grading and the display transform are applied.
export function createFilmFinish(renderer){
  const type=renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
  const target=new THREE.WebGLRenderTarget(1,1,{type,depthBuffer:true,samples:Math.min(4,renderer.capabilities.maxSamples)});
  target.texture.name='reward-linear-film';
  const size=new THREE.Vector2(),scene=new THREE.Scene(),camera=new THREE.Camera();
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,
    uniforms:{image:{value:target.texture},pixel:{value:new THREE.Vector2(1,1)},bloom:{value:.12}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D image;uniform vec2 pixel;uniform float bloom;varying vec2 vUv;
      float contourLuma(vec3 c){float l=dot(c,vec3(.2126,.7152,.0722));return l/(1.+l);}
      vec3 bright(vec2 uv){vec3 c=texture2D(image,uv).rgb;return c*max(0.,max(c.r,max(c.g,c.b))-1.15)/(max(c.r,max(c.g,c.b))+.001);}
      vec3 smoothEdges(vec2 uv){
        vec3 centre=texture2D(image,uv).rgb;
        float l=contourLuma(centre);
        float n=contourLuma(texture2D(image,uv+vec2(0.,pixel.y)).rgb);
        float s=contourLuma(texture2D(image,uv-vec2(0.,pixel.y)).rgb);
        float e=contourLuma(texture2D(image,uv+vec2(pixel.x,0.)).rgb);
        float w=contourLuma(texture2D(image,uv-vec2(pixel.x,0.)).rgb);
        float contrast=max(max(n,s),max(e,w))-min(min(n,s),min(e,w));
        // Filter along the contour, not across it. Broad panels and printed
        // destinations retain their detail; subpixel wires get softer edges.
        vec2 tangent=vec2(n-s,w-e);float lengthSquared=dot(tangent,tangent);
        if(contrast<.045||lengthSquared<.00001)return centre;
        vec2 offset=normalize(tangent)*pixel*.65;
        vec3 neighbours=(texture2D(image,uv+offset).rgb+texture2D(image,uv-offset).rgb)*.5;
        float change=abs(contourLuma(neighbours)-l);
        return mix(centre,neighbours,.55*smoothstep(.045,.20,contrast)*(1.-smoothstep(.07,.22,change)));
      }
      void main(){vec3 color=smoothEdges(vUv);vec2 p=pixel*4.;
        vec3 halo=bright(vUv)*.24;
        halo+=(bright(vUv+vec2(p.x,0.))+bright(vUv-vec2(p.x,0.))+bright(vUv+vec2(0.,p.y))+bright(vUv-vec2(0.,p.y)))*.19;
        color+=halo*bloom;
        float luma=dot(color,vec3(.2126,.7152,.0722));color=mix(vec3(luma),color,1.10);
        vec2 edge=(vUv-.5)*2.;color*=1.-.075*pow(dot(edge,edge)*.5,1.4);
        gl_FragColor=vec4(max(color,vec3(0.)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        // Static, sub-code-value dither keeps blue skies smooth without grain
        // moving over the train or a temporal history buffer on mobile GPUs.
        float noise=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
        gl_FragColor.rgb+=(noise-.5)/255.;
      }`});
  const geometry=new THREE.PlaneGeometry(2,2);scene.add(new THREE.Mesh(geometry,material));
  let disposed=false;
  return {
    reduceQuality(){if(target.samples){target.samples=0;target.dispose();}},
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
