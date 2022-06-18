// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT } from "./Experience/Constants";
import { Object3D, Vector3 } from "three";
import { cameraFunc, earthFunc, lights, misc, moonFunc, rendererFunc, sunFunc } from "./EnvironmentIyad";
import { destroyFolder, guiFunc } from "./GUIyad";

const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const earth = earthFunc(scene);
const moon = moonFunc(scene);
const sun = sunFunc(scene);

let time = { timeScale: 1 };

var satellites = new Array();

const satellitesFolders = guiFunc(satellites, time);

export function addSat(x, y, z) {
  const gltfLoader = new GLTFLoader();
  const satellite = new THREE.Object3D();

  gltfLoader.load("./assets/satellite.gltf", (gltf) => {
    satellite.add(gltf.scene);
    gltf.scene.position.y = -40;
    satellite.scale.multiplyScalar(1e4);

    //this one is at height 5,454 km from surface of earth
    satellite.position.set(x, y, z);
  });
  scene.add(satellite);
  satellites.push(satellite);
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = cameraFunc(sizes, sun);

const renderer = rendererFunc();

misc(scene, camera, renderer, sizes);

lights(scene, sun);

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);

const gravity = new Vector3();
const deltaVelocity = new Vector3();
const displacement = new Vector3();

const h = { height: 0 };
let distanceSq;
var index = 0;

/**
 * @param {number} [deltaTime]
 */
function applyGravity(satellite, deltaTime) {
  gravity.subVectors(earth.position, satellite.position);
  distanceSq = gravity.lengthSq();
  const gravityForce = (GRAVITY_CONSTANT * EARTH_MASS) / distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);

  deltaVelocity.copy(gravity).multiplyScalar(deltaTime);

  displacement.copy(deltaVelocity).multiplyScalar(deltaTime);
  satellite.position.add(displacement);

  index = satellites.indexOf(satellite);

  //collision detection with Earth
  //delete collided satellite
  if (satellite.position.lengthSq() < EARTH_RADIUS_SQ) {
    if (index > -1) {
      satellites.splice(index, 1);
      scene.remove(satellite);
      satellite.visible = false;
      console.log(index);
      destroyFolder(index);
    }
  }

  //calculate height of satellite from surface of earth
  h.height = Math.sqrt(distanceSq) - EARTH_RADIUS;
}

//gui satellite height
if (satellitesFolders.length >= 1)
  satellitesFolders[0].add(h, "height").min(0).max(10000000).listen(true);

let previousTime = Date.now();

const distanceVector = new Vector3();

function animate() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) * time.timeScale;
  previousTime = currentTime;

  //collision detection betweeen satallites
  //delete collided satellites
  for (let i = 0; i < satellites.length; i++) {
    const element = satellites[i];

    if (element.visible) 
      applyGravity(element, deltaTime);
    if (satellites.length > 1) {
      for (let j = i; j < satellites.length; j++) {
        if (i != j) {
          const element2 = satellites[j];
          distanceVector.subVectors(element.position, element2.position);
          const distance = distanceVector.lengthSq();
          if (distance < 810000000000) {
            scene.remove(element, element2);
            let i2 = satellites.indexOf(element);
            console.log("i2 "+i2);
            destroyFolder(i2);
            
            let j2 = satellites.indexOf(element2);
            console.log("j2 "+j2);
            destroyFolder(j2);
            
            satellites.splice(i, 1);
            satellites.splice(j, 1);
            element.visible = false;
            element2.visible = false;
          }
        }
      }
    }
  }

  earth.rotateY(1.2120351080246913580246913580247e-6 * time.timeScale);

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
