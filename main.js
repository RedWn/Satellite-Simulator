// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LineLoop, Vector3 } from "three";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_CIRCUMFERENCE, EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT } from "./constants.js";

import GUI from 'lil-gui'; 
const gui = new GUI();

const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const textureLoader = new THREE.TextureLoader();

// Earth
const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(earthTexture),
  wireframe: true,
});

const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);

// Models
const gltfLoader = new GLTFLoader();

const satellite = new THREE.Object3D();

gltfLoader.load("./assets/satellite.gltf", (gltf) => {
  satellite.add(gltf.scene);
  gltf.scene.position.y = -40;
  satellite.scale.multiplyScalar(1e4);
  satellite.position.set(EARTH_RADIUS * 1.2, EARTH_RADIUS + 1e3, EARTH_RADIUS + 1e3);
});
// satellite.position.set(0, 6.378e7, 0)
scene.add(satellite);

var satellites = new Array();
satellites.push(satellite);

const satelliteFolder = gui.addFolder('satellite position');
satelliteFolder.add( satellite.position, 'x').min(-7653600).max(7653600).step(10).name('satelite position x');
satelliteFolder.add( satellite.position, 'y').min(-7653600).max(7653600).step(10).name('satelite position y');
satelliteFolder.add( satellite.position, 'z').min(-7653600).max(7653600).step(10).name('satelite position z');

const AddSatelliteFolder = gui.addFolder('Add Satellite');

let satelliteGuiValues = {};

const satGui = {
	x: 7653600, y: 7653600, z: 7653600,
	saveSatellite() {
		// save current values to an object
		satelliteGuiValues = gui.save();
		loadButton.enable();
	},
	AddSatellite() {
    gui.load( satelliteGuiValues );
    let satellite = new THREE.Object3D();
    gltfLoader.load("./assets/satellite.gltf", (gltf) => {
      satellite.add(gltf.scene);
      gltf.scene.position.y = -40;              //TODO: ask hamsho if this line is important
      satellite.scale.multiplyScalar(1e4 + 30000); //TODO delete 30000 later
      //satellite.lookAt(earth.position);           is not working (dunno why)
      satellite.position.set(this.x, this.y, this.z);
    });
    scene.add(satellite);
    satellites.push(satellite);
	}
}
AddSatelliteFolder.add( satGui, 'x').min(-7653600).max(7653600).step(10).name('satelite position x');
AddSatelliteFolder.add( satGui, 'y').min(-7653600).max(7653600).step(10).name('satelite position y');
AddSatelliteFolder.add( satGui, 'z').min(-7653600).max(7653600).step(10).name('satelite position z');
AddSatelliteFolder.add( satGui, 'saveSatellite' );
const loadButton = AddSatelliteFolder.add( satGui, 'AddSatellite' ).disable();

//Background
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1e9
);

camera.position.z = EARTH_RADIUS * 2;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg") ?? undefined,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

//Lights
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x444444);
pointLight.position.set(5, 5, 5);
//pointLight.power(1);
scene.add(ambientLight);
scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);

const gravity = new Vector3();
const deltaVelocity = new Vector3();
const displacement = new Vector3();

/**
 * @param {number} [deltaTime]
 */
function applyGravity(satellite, deltaTime) {
  gravity.subVectors(earth.position, satellite.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);  

  deltaVelocity.copy(gravity).multiplyScalar(deltaTime);
  
  displacement.copy(deltaVelocity).multiplyScalar(deltaTime);
  satellite.position.add(displacement);

  //collision detection with Earth
  //delete collided satellite
  if (satellite.position.lengthSq() < EARTH_RADIUS_SQ){
    const index = satellites.indexOf(satellite);
    if (index > -1) {
      satellites.splice(index, 1); // 2nd parameter means remove one item only
      scene.remove(satellite);
      satellite.visible = false;
    }
  }

  //calculate height of satellite from surface of earth
  let height = Math.sqrt(distanceSq) - EARTH_RADIUS
}

// function height(){
//   let h = EARTH_RADIUS * (1 - ( Math.cos(360/EARTH_CIRCUMFERENCE * displacement.length()) ));
// }

let clock = new THREE.Clock();
let previousTime = Date.now();
//let elapsedTime = 1;

let time = {timeScale : 1}

const distanceVector = new Vector3();
function animate() {
  //elapsedTime = clock.getElapsedTime() + 1;
  //delta = clock.getDelta();
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) * time.timeScale;
  previousTime = currentTime;

  //collision detection betweeen satallites
  //delete collided satellites
  for (let i = 0; i < satellites.length; i++) {
    const element = satellites[i];
    if(element.visible)
      applyGravity(element, deltaTime);
    if(satellites.length > 1){
      for (let j = i; j < satellites.length; j++) {
        if(i != j){
          const element2 = satellites[j];
          distanceVector.subVectors(element.position, element2.position)
          const distance = distanceVector.lengthSq()
          if(distance < 810000000000){
            scene.remove(element, element2);
            satellites.splice(i, 1)
            satellites.splice(j, 1)
            element.visible = false;
            element2.visible = false;
          }
        }
      }
    }
  }
  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
gui.add(time, 'timeScale').min(0).max(5).step(0.2).name("Time Scale")

animate();
