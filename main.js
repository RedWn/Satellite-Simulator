// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AREA, DRAG_COEFFICIENT, EARTH_CIRCUMFERENCE, EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT, VOLUMEETRIC_DENSITY } from "./Constants.js";
// @ts-ignore
import GUI from "lil-gui";

const gui = new GUI();


const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const textureLoader = new THREE.TextureLoader();

// Earth         
const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const material = new THREE.MeshStandardMaterial({
  map: textureLoader.load(earthTexture),
  // wireframe: true, 
});

const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);

// Models
const gltfLoader = new GLTFLoader();
const satellite = new THREE.Object3D();

gltfLoader.load("./assets/sputnik.gltf", (gltf) => {
  satellite.add(gltf.scene);
  // gltf.scene.position.y = -40;
  satellite.scale.multiplyScalar(1e5 * 2);

});
// satellite.position.set(0, 6.378e7, 0)
satellite.position.set(0, EARTH_RADIUS * 1.5, 0);
scene.add(satellite);




const satelliteFolder = gui.addFolder("satellite position");
satelliteFolder
  .add(satellite.position, "x")
  .min(-20000000)
  .max(20000000)
  .step(100)
  .name("                       x");
satelliteFolder
  .add(satellite.position, "y")
  .min(-20000000)
  .max(20000000)
  .step(100)
  .name("                       y");
satelliteFolder
  .add(satellite.position, "z")
  .min(-20000000)
  .max(20000000)
  .step(100)
  .name("                       z");

  const editSpeedGui = {
    W(){
      const temp = new Vector3();
      initSpeed(satellite, temp.copy(satelliteV).normalize(), 1000);
    },
    S(){
      const temp = new Vector3();
      initSpeed(satellite, temp.copy(satelliteV).normalize().multiplyScalar(-1), 1000);
    }
  }
  gui.add(editSpeedGui, "W");
  gui.add(editSpeedGui, "S");


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
const ambientLight = new THREE.AmbientLight(0x555555);
pointLight.position.set(EARTH_RADIUS * 3, 0, 0);
scene.add(ambientLight);
scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);

const satelliteA = new Vector3();
const satelliteV = new Vector3();
const satelliteX = new Vector3();

function initSpeed(satellite, vec, V) {
  satelliteV.add(vec.multiplyScalar(V));
  // console.log(satelliteV);                             
}

const gravity = new Vector3();
const satelliteMass = 10;
let prevTime = 0;

function applyGravity(satellite) {
  gravity.subVectors(earth.position, satellite.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS * satelliteMass) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);

  //collision detection with Earth
  if (satellite.position.lengthSq() < EARTH_RADIUS_SQ) {
    scene.remove(satellite);
    satellite.visible = false;
  }
}

const DF = new Vector3();
function dragForce(satellite) {
  const DForce = 0.5 *VOLUMEETRIC_DENSITY*AREA* satelliteV.lengthSq() * DRAG_COEFFICIENT ;// Tareq Drag Force equation
  //const DForce = 0.5 * 1e-3 * satelliteV.lengthSq() * 0.47 * Math.PI * 1;
  const temp = new Vector3();
  temp.copy(satelliteA).normalize().multiplyScalar(-1);
  DF.copy(temp).multiplyScalar(DForce);
}

// function height(){
//   let h = EARTH_RADIUS * (1 - ( Math.cos(360/EARTH_CIRCUMFERENCE * displacement.length) ));
// }

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {//W
    const temp = new Vector3();
    initSpeed(satellite, temp.copy(satelliteV).normalize(), 1000);
  }
  if (keyCode == 83) {//S
    const temp = new Vector3();
    initSpeed(satellite, temp.copy(satelliteV).normalize().multiplyScalar(-1), 1000);
  }

};

let previousTime = Date.now();

initSpeed(satellite, new Vector3(1, 0, 0).normalize(), 20000);

let time = { timeScale: 1 };

function animate() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) * time.timeScale / 10;
  previousTime = currentTime;

  applyGravity(satellite);

  if (satellite.visible) {
    if ((satellite.position.lengthSq() < EARTH_RADIUS_SQ * 1.2)) {
      dragForce(satellite);
      console.log("Hi");
    }
    const tempV = new Vector3();
    tempV.copy(gravity).multiplyScalar(deltaTime)
    satelliteV.add(tempV);

    const tempV2 = new Vector3();
    tempV2.copy(DF).multiplyScalar(deltaTime)
    satelliteV.add(tempV2);

    satelliteX.copy(satelliteV).multiplyScalar(deltaTime);
    satellite.position.add(satelliteX);
    // console.log(satelliteV);
  }

  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}


gui.add(time, "timeScale").min(0).max(20).step(0.1).name("Time Scale");

animate();
