// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { LineLoop, Vector3 } from "three";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_CIRCUMFERENCE, EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT } from "./Constants.js";

import GUI from 'lil-gui';
const gui = new GUI();

const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const textureLoader = new THREE.TextureLoader();

// Earth
const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(earthTexture),
  // wireframe: true,
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
satelliteFolder.add(satellite.position, 'x').min(-7653600).max(7653600).step(10).name('satelite position x');
satelliteFolder.add(satellite.position, 'y').min(-7653600).max(7653600).step(10).name('satelite position y');
satelliteFolder.add(satellite.position, 'z').min(-7653600).max(7653600).step(10).name('satelite position z');

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
    gui.load(satelliteGuiValues);
    let satellite = new THREE.Object3D();
    gltfLoader.load("./assets/satellite.gltf", (gltf) => {
      satellite.add(gltf.scene);
      gltf.scene.position.y = -40;              //TODO: ask hamsho if this line is important
      satellite.scale.multiplyScalar(1e4 + 30000); //TODO delete 2000 later
      //satellite.lookAt(earth.position);           is not working (dunno why)
      satellite.position.set(this.x, this.y, this.z);
    });
    scene.add(satellite);
    satellites.push(satellite);
  }
}
AddSatelliteFolder.add(satGui, 'x').min(-7653600).max(7653600).step(10).name('satelite position x');
AddSatelliteFolder.add(satGui, 'y').min(-7653600).max(7653600).step(10).name('satelite position y');
AddSatelliteFolder.add(satGui, 'z').min(-7653600).max(7653600).step(10).name('satelite position z');
AddSatelliteFolder.add(satGui, 'saveSatellite');
const loadButton = AddSatelliteFolder.add(satGui, 'AddSatellite').disable();

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

const satelliteA = new Vector3();
const satelliteV = new Vector3();
const satelliteX = new Vector3();

function initSpeed(satellite, vec, V) {
  satelliteV.copy(vec.multiplyScalar(V));
  console.log(satelliteV);
}

const gravity1 = new Vector3();
const gravity = new Vector3();
const gravityD = new Vector3();
const deltaVelocity = new Vector3();
const displacement = new Vector3();
const satelliteMass = 10;
let prevTime = 0;

function applyGravity(satellite) {
  gravity1.copy(gravity);
  gravity.subVectors(earth.position, satellite.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS * satelliteMass) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);
  // satellite.position.add(displacement);
  satelliteA.copy(gravity);
  gravityD.subVectors(gravity, gravity1);
  // gravityD.normalize().multiplyScalar(deltaTime);

  //collision detection with Earth
  //delete collided satellite
  if (satellite.position.lengthSq() < EARTH_RADIUS_SQ) {
    const index = satellites.indexOf(satellite);
    if (index > -1) {
      satellites.splice(index, 1); // 2nd parameter means remove one item only
    }
    scene.remove(satellite);
    satellite.visible = false;
  }
}

// function height(){
//   let h = EARTH_RADIUS * (1 - ( Math.cos(360/EARTH_CIRCUMFERENCE * displacement.length) ));
// }

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {//W
    // initSpeed(satellite, new Vector3(1, 0, 0), 10);
  }
  if (keyCode == 81) {//Q
    // Dcof -= 100;
  }
  if (keyCode == 69) {//E

  }
};

let previousTime = Date.now();
const tempV = new Vector3();
const totalForce = new Vector3();
// addForce(satellite, new Vector3(1, 0, 0), 1e3);
initSpeed(satellite, new Vector3(1, 0, 1).normalize(), 20000);

function animate() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) / 10;
  previousTime = currentTime;

  applyGravity(satellite);

  if (satellite.visible) {
    tempV.copy(satelliteA).multiplyScalar(deltaTime)
    satelliteV.add(tempV);

    satelliteX.copy(satelliteV).multiplyScalar(deltaTime);
    satellite.position.add(satelliteX);
    console.log(satelliteV);
  }

  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
