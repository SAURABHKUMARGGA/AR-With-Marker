// import './style.css'

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {ARButton} from 'three/addons/webxr/ARButton.js'
// import trackImage from '../images/track-image.jpeg'



let scene =new THREE.Scene();
let camera =new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.z = 5;
let app = document.getElementById("app");
let renderer =new THREE.WebGLRenderer();
renderer.xr.enabled = true;
renderer.setSize(window.innerWidth,window.innerHeight);
app.appendChild(renderer.domElement);
let controls =new OrbitControls(camera,renderer.domElement);


//add light
let ambinetLight =new THREE.AmbientLight(0xffffff,1);
scene.add(ambinetLight);

let directionalLight = new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(3,3,3);
scene.add(directionalLight);

let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight,2);

scene.add(directionalLightHelper);

//create bitmap image
// let TrackImageBitMap = await createImageBitmap(trackImage);
// console.log(TrackImageBitMap);

//loader 
let loader = new GLTFLoader();
let houseModel ;
loader.load("house.glb",(gltf)=>{
    let model = gltf.scene;
    model.scale.set(0.02, 0.02, 0.02);
    // camera.position.set(0,-55, -10);
    // model.position.set(0,-40,-20);
    // model.matrixAutoUpdate=false;
    scene.add(model);
    houseModel = model;
    model.visible = false;
})
// houseModel.visible = false;
let boxGeomatery =new THREE.BoxGeometry(0.1,0.1,0.1);
boxGeomatery.translate(0,-0.2,0);
let boxMaterial =new THREE.MeshStandardMaterial({color:"red",side:THREE.DoubleSide})
let box =new THREE.Mesh(boxGeomatery,boxMaterial);
box.position.set(0,0,0)
// box.scale.set(20,20,20)
box.visible = false;
box.matrixAutoUpdate=false;
scene.add(box);

window.addEventListener("resize",()=>{
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
})

async function loadAR(){
// let TrackImageBitMap;
let trackImage = document.getElementById("labimage");
// await fetch(trackImage).then(response=>response.blob()).then(blob=>createImageBitmap(blob)).then(bitmap=>{
//   TrackImageBitMap = bitmap;
// })
let TrackImageBitMap = await createImageBitmap(trackImage);
console.log("image loaded succefully")
//AR button

const arButton = ARButton.createButton(renderer, {
  requiredFeatures:['image-tracking'],
  trackedImages:[
    {
      image:TrackImageBitMap,
      widthInMeters:0.5,
    }
  ],
  optionalFeatures: ['dom-overlay'],
  domOverlay: { root: document.body }
});
document.body.appendChild(arButton);
}
loadAR();
function animate(){
  // window.requestAnimationFrame(animate);
  // controls.update();
  // renderer.render(scene,camera);
  renderer.setAnimationLoop((timestamp,frame)=>{
    if(frame){
      const results = frame.getImageTrackingResults();
      if (results.length > 0) {
        const result = results[0];
        const state = result.trackingState;
        const referenceSpace = renderer.xr.getReferenceSpace();
        const pose = frame.getPose(result.imageSpace,referenceSpace);
        if (state === 'tracked') {
          // houseModel.matrixAutoUpdate = true;
          // model.scale.set(0.02, 0.02, 0.02);
          box.visible = true;
          box.matrix.fromArray(pose.transform.matrix);
          // houseModel.updateMatrixWorld(true);
        } else {
          box.visible = false;
        }
      }
      // for(const result of results){
      //   const pose = result.pose;
      //   const state =result.trackingState;
      //   const imageIndex = result.index;
      //   if(state==='tracked'){
      //     box.visible = true;
      //     box.matrix.fromArray(pose.transform.matrix);
      //     box.updateMatrixWorld(true);
      //   }else if(state==='emulated'){
      //     box.visible = false;
      //   }
      // }
    }
    controls.update();
    renderer.render(scene,camera);
  })
}

renderer.xr.addEventListener("sessionstart",()=>{
  // camera.position.z = 80;
  // box.position.set(0,0,0);
  // box.scale.set(0.1,0.1,0.1);
})
renderer.xr.addEventListener("sessionend",()=>{
  // camera.position.z = 5;
  // box.position.set(0,0,0);
})
animate();