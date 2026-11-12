// Authoring only. Start npm run dev on 4180, then run this with Playwright.
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
  fs.mkdirSync('.tools/reward-source',{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({serviceWorkers:'block'});
    page.on('console',msg=>{if(msg.type()==='error')console.error(msg.text());});
    await page.goto(process.env.TEST_URL||'http://127.0.0.1:4180/');
    for(const id of (process.argv.length>2?process.argv.slice(2):['yokosuka','shonan-shinjuku','saikyo','toyoko'])){
      const base64=await page.evaluate(async id=>{
        const THREE=await import('./vendor/three/three.module.js');
        const {GLTFExporter}=await import('./vendor/three/addons/exporters/GLTFExporter.js');
        const {mergeGeometries}=await import('./vendor/three/addons/utils/BufferGeometryUtils.js');
        const {createTrainModel}=await import('./src/reward3d-trains.js');
        const model=createTrainModel(id),cfg=model.config,root=new THREE.Group();root.name=id;
        const standardIndex=Array.from({length:cfg.cars},(_,i)=>i).find(i=>i>0&&i<cfg.cars-1&&!cfg.greenCars.includes(i)&&!cfg.pantographCars.includes(i));
        const prototypes=[['CAB',0],['STANDARD',standardIndex],['PANTOGRAPH',cfg.pantographCars[0]]];
        if(cfg.greenCars.length)prototypes.push(['GREEN',cfg.greenCars[0]]);
        const original=new THREE.Matrix4(),translation=new THREE.Matrix4();
        for(const [name,index] of prototypes){
          const group=new THREE.Group();group.name=name;root.add(group);const batches=new Map();
          for(const source of model.group.children){
            if(!source.isInstancedMesh)continue;
            for(let j=0;j<source.count;j++){
              source.getMatrixAt(j,original);
              const car=Math.max(0,Math.min(cfg.cars-1,Math.round(-original.elements[12]/20.6)));
              if(car!==index)continue;
              const x=original.elements[12]+index*20.6,y=original.elements[13],z=original.elements[14];
              const panto=x>-7.3&&x<-4.7&&y>=4.04&&Math.abs(z)<.86;
              if((name==='PANTOGRAPH')!==panto)continue;
              let role=source.geometry.name||'body';
              const scale=new THREE.Vector3().setFromMatrixScale(original);
              if(role==='body'&&Math.min(...scale)>.15&&Math.max(...scale)>1&&y>4.04)role='roof-housing';
              if(role==='body'&&Math.min(...scale)>.15&&Math.max(...scale)>1&&y<1.25)role='underfloor-housing';
              if(source.userData.groundEffect)role='contact-shadow';
              const key=`${role}/${source.material.uuid}`;
              if(!batches.has(key))batches.set(key,{role,material:source.material,parts:[]});
              translation.makeTranslation(index*20.6,0,0).multiply(original);
              let geometry=source.geometry.clone().applyMatrix4(translation);
              if(geometry.index){const expanded=geometry.toNonIndexed();geometry.dispose();geometry=expanded;}
              batches.get(key).parts.push(geometry);
            }
          }
          for(const batch of batches.values()){
            const geometry=mergeGeometries(batch.parts,false);
            if(!geometry)throw Error(`Cannot merge ${name}/${batch.role}`);
            const mesh=new THREE.Mesh(geometry,batch.material);mesh.name=`${batch.role}__${batch.material.name||'finish'}`;group.add(mesh);
            batch.parts.forEach(g=>g.dispose());
          }
        }
        const axle=new THREE.Group();axle.name='AXLE';root.add(axle);
        const wheel=model.wheels[0].children[0].clone();wheel.geometry=wheel.geometry.clone();wheel.name='wheel-axle';axle.add(wheel);
        // Exporter's packed metal/roughness path expects drawable image sources.
        const converted=new Map();
        root.traverse(object=>{
          if(!object.material)return;
          for(const key of Object.keys(object.material)){
            const map=object.material[key];if(!map?.isDataTexture)continue;
            if(!converted.has(map)){
              const canvas=document.createElement('canvas');canvas.width=map.image.width;canvas.height=map.image.height;
              canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(map.image.data),canvas.width,canvas.height),0,0);
              const texture=new THREE.CanvasTexture(canvas);
              for(const field of ['wrapS','wrapT','minFilter','magFilter','colorSpace','flipY','generateMipmaps','anisotropy'])texture[field]=map[field];
              texture.repeat.copy(map.repeat);texture.offset.copy(map.offset);converted.set(map,texture);
            }
            object.material[key]=converted.get(map);
          }
        });
        const result=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
        const bytes=new Uint8Array(result);let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));
        model.dispose();converted.forEach(t=>t.dispose());root.traverse(o=>{if(o.geometry)o.geometry.dispose();});return btoa(text);
      },id);
      const data=Buffer.from(base64,'base64');fs.writeFileSync(`.tools/reward-source/${id}.glb`,data);console.log(`${id}: ${data.length} bytes`);
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
