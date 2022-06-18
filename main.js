// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";
import { Object3D } from "three";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AREA, DRAG_COEFFICIENT, EARTH_CIRCUMFERENCE, EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT, VOLUMEETRIC_DENSITY } from "./Constants.js";

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




// satsArray[0].pos.x = 1
// console.log(satsArray[0].pos.x)


const gltfLoader = new GLTFLoader();
let satellites = new Array();

function calculate_height(V) {
  let height = ((V.length()) - EARTH_RADIUS);
  return height;
}

function addSatellite(pos, m, r, s) {
  let satellite = {
    object: new Object3D(),
    X: new Vector3(0, 0, 0),
    V: new Vector3(0, 0, 0),
    arrows: new Array(),
    height: 0,
    mass: 0,
    radius: 0
  }
  satellite.object.position.set(pos.x, pos.y, pos.z);
  satellite.height = calculate_height(pos);
  satellite.mass = m;
  satellite.raduis = r;

  gltfLoader.load("./assets/sputnik.gltf", (gltf) => {
    satellite.object.add(gltf.scene);
    // gltf.scene.position.y = -40;
    satellite.object.scale.multiplyScalar(1e5 * 2);

  });

  scene.add(satellite.object);
  satellites.push(satellite);

  initSpeed(satellite, new Vector3(0, 0, 1).normalize(), s);

  const arrowHelper = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0xff0000);
  scene.add(arrowHelper);
  satellite.arrows.push(arrowHelper);

  const arrowHelper1 = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0x0000ff);
  scene.add(arrowHelper1);
  satellite.arrows.push(arrowHelper1);

  const arrowHelper2 = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0x0000ff);
  scene.add(arrowHelper2);
  satellite.arrows.push(arrowHelper2);
}

addSatellite(new Vector3(EARTH_RADIUS * 1.25, 0, 0), 10, 1, 7000);


// const satelliteFolder = gui.addFolder("satellite position");
// satelliteFolder
//   .add(satellite.position, "x")
//   .min(-20000000)
//   .max(20000000)
//   .step(100)
//   .name("                       x");
// satelliteFolder
//   .add(satellite.position, "y")
//   .min(-20000000)
//   .max(20000000)
//   .step(100)
//   .name("                       y");
// satelliteFolder
//   .add(satellite.position, "z")
//   .min(-20000000)
//   .max(20000000)
//   .step(100)
//   .name("                       z");

// const editSpeedGui = {
//   W() {
//     const temp = new Vector3();
//     initSpeed(satellite, temp.copy(satelliteV).normalize(), 1000);
//   },
//   S() {
//     const temp = new Vector3();
//     initSpeed(satellite, temp.copy(satelliteV).normalize().multiplyScalar(-1), 1000);
//   }
// }
// gui.add(editSpeedGui, "W");
// gui.add(editSpeedGui, "S");


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

function initSpeed(satellite, vec, V) {
  satellite.V.add(vec.multiplyScalar(V));
  // console.log(satelliteV);                             
}

function drawTrail(satellite, V) {
  const origin = satellite.object.position;
  const length = 1e6;
  const hex = 0xffff00;

  const arrowHelper = new THREE.ArrowHelper(new Vector3(), origin, length, hex);
  scene.add(arrowHelper);
  const temp = new Vector3().copy(V);
  temp.normalize();
  const newSourcePos = satellite.object.position;
  var newTargetPos = temp;
  arrowHelper.position.set(newSourcePos.x, newSourcePos.y, newSourcePos.z);
  const direction = new THREE.Vector3().copy(newTargetPos);
  arrowHelper.setDirection(direction.normalize());
  arrowHelper.setLength(temp.length() * 1e4);

  setTimeout(removeTrail, 7e4, arrowHelper);
}

function removeTrail(arrowHelper) {
  scene.remove(arrowHelper);
}

function drawVector(satellite, V, i) {

  const temp = new Vector3().copy(V);
  temp.normalize();
  const newSourcePos = satellite.object.position;
  var newTargetPos = temp;
  satellite.arrows[i].position.set(newSourcePos.x, newSourcePos.y, newSourcePos.z);
  const direction = new THREE.Vector3().copy(newTargetPos);
  satellite.arrows[i].setDirection(direction.normalize());
  satellite.arrows[i].setLength(temp.length() * 1e6);
}

const gravity = new Vector3();
const satelliteMass = 10;

function applyGravity(satellite) {
  gravity.subVectors(earth.position, satellite.object.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS * satelliteMass) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);
  gravity.divideScalar(satelliteMass);
  // console.log(gravity);

  //collision detection with Earth
  if (satellite.object.position.lengthSq() < EARTH_RADIUS_SQ) {
    scene.remove(satellite);
    satellite.object.visible = false;
  }
}

const DA = new Vector3();
function dragForce(satellite) {
  const DForce = 0.5 * VOLUMEETRIC_DENSITY * AREA * satellite.V.lengthSq() * DRAG_COEFFICIENT;// Tareq Drag Force equation
  const temp = new Vector3();
  temp.copy(satellite.V).normalize().multiplyScalar(-1);
  DA.copy(temp).multiplyScalar(DForce);
  DA.divideScalar(satelliteMass);
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {//W
    // const temp = new Vector3();
    // initSpeed(satellite, temp.copy(satelliteV).normalize(), 1000);

    addSatellite(new Vector3(0, EARTH_RADIUS * 1.25, 0), 10, 1, 7000);
  }
  if (keyCode == 83) {//S
    // const temp = new Vector3();
    // initSpeed(satellite, temp.copy(satelliteV).normalize().multiplyScalar(-1), 1000);
  }

};

let previousTime = Date.now();

let time = { timeScale: 1 };

function animate() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) * time.timeScale / 10;
  previousTime = currentTime;

  satellites.forEach(satellite => {
    console.log("HI");
    applyGravity(satellite);

    if (satellite.object.visible) {
      if (calculate_height(satellite.object.position) < 6e5) {
        dragForce(satellite);
      }

      const tempV = new Vector3();
      tempV.copy(gravity).multiplyScalar(deltaTime)
      satellite.V.add(tempV);

      const tempV2 = new Vector3();
      tempV2.copy(DA).multiplyScalar(deltaTime);
      satellite.V.add(tempV2);

      satellite.X.copy(satellite.V).multiplyScalar(deltaTime);
      console.log(satellite.X);
      satellite.object.position.add(satellite.X);

      drawVector(satellite, satellite.V, 0);
      drawVector(satellite, gravity, 1);
      drawVector(satellite, DA, 2);
      drawTrail(satellite, satellite.V);

    }
  });

  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  //
  // calculate_height(satellite);
  //
  controls.update();
  renderer.render(scene, camera);
}


gui.add(time, "timeScale").min(0).max(20).step(0.1).name("Time Scale");

animate();
