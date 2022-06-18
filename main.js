// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { AREA, DRAG_COEFFICIENT, EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT, VOLUMEETRIC_DENSITY } from "./Constants";

import GUI from "lil-gui";

const gui = new GUI();
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Object3D, Vector3 } from "three";
import { cameraFunc, earthFunc, lights, misc, moonFunc, rendererFunc, sunFunc } from "./EnvironmentIyad";
import { destroyFolder, guiFunc } from "./GUIyad";


const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const earth = earthFunc(scene);
const moon = moonFunc(scene);
const sun = sunFunc(scene);

// const textureLoader = new THREE.TextureLoader();

// // Earth         
// const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
// const material = new THREE.MeshStandardMaterial({
//   map: textureLoader.load(earthTexture),
//   // wireframe: true, 
// });

const gltfLoader = new GLTFLoader();
let satellites = new Array();

function calculate_height(V) {
  let height = ((V.length()) - EARTH_RADIUS);
  return height;
}

let time = { timeScale: 1 };



export function addSatellite(pos, m, r, s) {
  console.log("HI");
  let satellite = {
    object: new Object3D(),
    X: new Vector3(0, 0, 0),
    V: new Vector3(0, 0, 0),
    arrows: new Array(),
    height: 0,
    mass: 0,
    radius: 0,
    speed: 0
  }
  satellite.object.position.set(pos.x, pos.y, pos.z);
  satellite.height = calculate_height(pos);
  satellite.mass = m;
  satellite.raduis = r;
  satellite.speed = s;

  gltfLoader.load("./assets/sputnik.gltf", (gltf) => {
    satellite.object.add(gltf.scene);
    // gltf.scene.position.y = -40;
    satellite.object.scale.multiplyScalar(1e5 * 2);

  });

  scene.add(satellite.object);
  satellites.push(satellite);

  initSpeed(satellite, new Vector3(0, 0, 1).normalize(), satellite.speed);

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

// addSatellite(new Vector3(EARTH_RADIUS * 1.25, 0, 0), 10, 1, 7000);

// export function addSat(x, y, z) {
//   const gltfLoader = new GLTFLoader();
//   const satellite = new THREE.Object3D();

//   gltfLoader.load("./assets/satellite.gltf", (gltf) => {
//     satellite.add(gltf.scene);
//     gltf.scene.position.y = -40;
//     satellite.scale.multiplyScalar(1e4);

//     //this one is at height 5,454 km from surface of earth
//     satellite.position.set(x, y, z);
//   });
//   scene.add(satellite);
//   satellites.push(satellite);
// }

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = cameraFunc(sizes, sun);

const renderer = rendererFunc();

misc(scene, camera, renderer, sizes);

lights(scene, sun);

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

let satellitesFolders = guiFunc(satellites, time);

function applyGravity(satellite) {
  gravity.subVectors(earth.position, satellite.object.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS * satellite.mass) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);
  console.log(satellite.mass);

  gravity.divideScalar(satellite.mass);
  var index = 0;

  //collision detection with Earth
  //delete collided satellite
  if (satellite.object.position.lengthSq() < EARTH_RADIUS_SQ) {
    if (index > -1) {
      satellites.splice(index, 1);
      scene.remove(satellite);
      satellite.object.visible = false;
      // console.log(index - 1);
      destroyFolder(satellitesFolders, index - 1);
    }
  }
}

const DA = new Vector3();
function dragForce(satellite) {
  const DForce = 0.5 * VOLUMEETRIC_DENSITY * AREA * satellite.V.lengthSq() * DRAG_COEFFICIENT;// Tareq Drag Force equation
  const temp = new Vector3();
  temp.copy(satellite.V).normalize().multiplyScalar(-1);
  DA.copy(temp).multiplyScalar(DForce);
  DA.divideScalar(satellite.mass);
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 87) {//W
    // const temp = new Vector3();
    // initSpeed(satellite, temp.copy(satelliteV).normalize(), 1000);

    addSatellite(new Vector3(0, 8000000, 0), 1000, 1, 7000);
  }
  if (keyCode == 83) {//S
    // const temp = new Vector3();
    // initSpeed(satellite, temp.copy(satelliteV).normalize().multiplyScalar(-1), 1000);
  }

};

let previousTime = Date.now();

const distanceVector = new Vector3();

function animate() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) * time.timeScale / 10;
  previousTime = currentTime;

  satellites.forEach(satellite => {
    // console.log("HI");
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
      // console.log(satellite.X);
      satellite.object.position.add(satellite.X);

      drawVector(satellite, satellite.V, 0);
      drawVector(satellite, gravity, 1);
      drawVector(satellite, DA, 2);
      drawTrail(satellite, satellite.V);

    }
  });

  for (let i = 0; i < satellites.length; i++) {
    const element = satellites[i];
    //   if (satellites.length > 1) {
    //     for (let j = i; j < satellites.length; j++) {
    //       if (i != j) {
    //         const element2 = satellites[j];
    //         distanceVector.subVectors(element.position, element2.position);
    //         const distance = distanceVector.lengthSq();
    //         if (distance < 810000000000) {
    //           scene.remove(element, element2);
    //           satellites.splice(i, 1);
    //           satellites.splice(j, 1);
    //           element.visible = false;
    //           element2.visible = false;
    //           destroyFolder(satellitesFolders, i);
    //           destroyFolder(satellitesFolders, j);
    //         }
    //       }
    //     }
    //   }
  }

  earth.rotateY(1.2120351080246913580246913580247e-6 * time.timeScale);

  requestAnimationFrame(animate);
  //
  // calculate_height(satellite);
  //
  controls.update();
  renderer.render(scene, camera);
}
//gui satellite height
// if (satellitesFolders.length >= 1)
//   satellitesFolders[0].add(h, "height").min(0).max(10000000).listen(true);

gui.add(time, "timeScale").min(0).max(20).step(0.1).name("Time Scale");

animate();
