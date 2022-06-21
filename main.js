// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  DRAG_COEFFICIENT, earth_mass_object, EARTH_RADIUS, GRAVITY_CONSTANT, VOLUMEETRIC_DENSITY,
} from "./Constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Object3D, Vector3 } from "three";
import { cameraFunc, earthFunc, lights, misc, moonFunc, rendererFunc, sunFunc } from "./Environment";
import { destroyFolder, guiFunc, satelliteFolderFunc, satellitesFolders, updatePrototype } from "./GUI";
import { addArrows, drawTrail, drawVector } from "./ArrowsAndTrails";

export const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));

const earth = earthFunc(scene);
moonFunc(scene);
sunFunc(scene);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = cameraFunc(sizes);

const renderer = rendererFunc();

misc(scene, camera, renderer, sizes);

lights(scene);

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);

const gltfLoader = new GLTFLoader();

export var satellites = new Array();

export let time = { timeScale: 1 };

guiFunc(satellites);

export function addSatellite(pos, mass, radius, initialSpeed, initialSpeedVector) {
  let satellite = {
    object: new Object3D(),
    displacement: new Vector3(0, 0, 0),
    velocityVector: new Vector3(0, 0, 0),
    arrows: new Array(),
    height: 0,
    mass: 0,
    radius: 0,
    satelliteFolder: null
  };
  satellite.object.position.set(pos.x, pos.y, pos.z);
  satellite.height = satellite.object.position.length() - EARTH_RADIUS;
  satellite.mass = mass;
  satellite.radius = radius;

  gltfLoader.load("./assets/sputnik2.gltf", (gltf) => {
    satellite.object.add(gltf.scene);
    satellite.object.scale.multiplyScalar(1e5);
  });

  satellite.velocityVector.add(initialSpeedVector.normalize().multiplyScalar(initialSpeed))

  scene.add(satellite.object);
  satellites.push(satellite);

  satellite.satelliteFolder = satelliteFolderFunc(satellites.indexOf(satellite))
  satellitesFolders.push(satellite.satelliteFolder);

  addArrows(satellite)
}

let previousTime = Date.now();
let deltaTime

function animate() {
  const currentTime = Date.now();
  deltaTime = ((currentTime - previousTime) * time.timeScale) / 1000;
  previousTime = currentTime;

  satellites.forEach((satellite) => {

    gravityForce(satellite);

    satellite.height = satellite.object.position.length() - EARTH_RADIUS;

    if (satellite.height < 6e5) {//600 km
      dragForce(satellite);
    }

    scientificCalculations(satellite);

    collisionWithEarth(satellite);

    perfectInelasticCollision(satellite)

    drawVector(satellite, new Vector3().copy(satellite.velocityVector).normalize(), 0);
    drawVector(satellite, gravity, 1);
    drawVector(satellite, dragAcceleration, 2);
    drawTrail(satellite);
  });

  earth.rotateY(1.2120351080246913580246913580247e-6 * time.timeScale);

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updatePrototype();
}
animate();

const gravity = new Vector3();

function gravityForce(satellite) {
  gravity.subVectors(earth.position, satellite.object.position);
  const distanceSq = gravity.lengthSq();
  const gravityForce =
    (GRAVITY_CONSTANT * earth_mass_object.EARTH_MASS * satellite.mass) /
    distanceSq;
  gravity.normalize().multiplyScalar(gravityForce);

  gravity.divideScalar(satellite.mass);
}

const dragAcceleration = new Vector3();
function dragForce(satellite) {
  const DForce = 0.5 * VOLUMEETRIC_DENSITY * Math.PI * satellite.radius * satellite.radius *
    satellite.velocityVector.lengthSq() * DRAG_COEFFICIENT;
  const temp = new Vector3();
  temp.copy(satellite.velocityVector).normalize().multiplyScalar(-1);
  dragAcceleration.copy(temp).multiplyScalar(DForce);
  dragAcceleration.divideScalar(satellite.mass);
}

function scientificCalculations(satellite) {
  const tempV = new Vector3();
  tempV.copy(gravity).multiplyScalar(deltaTime);
  satellite.velocityVector.add(tempV);

  const tempV2 = new Vector3();
  tempV2.copy(dragAcceleration).multiplyScalar(deltaTime);
  satellite.velocityVector.add(tempV2);

  satellite.displacement.copy(satellite.velocityVector).multiplyScalar(deltaTime);
  satellite.object.position.add(satellite.displacement);
}

function collisionWithEarth(satellite) {
  if (satellite.height < 0) {
    //delete collided satellite
    let index = satellites.indexOf(satellite);
    removeSatelliteFromScene(index)
    destroyFolder(index)
  }
}

const distanceVector = new Vector3();
function perfectInelasticCollision(sat1) {
  const i = satellites.indexOf(sat1)
  for (let j = i + 1; j < satellites.length; j++) {
    if (i != j) {
      const sat2 = satellites[j];
      distanceVector.subVectors(sat1.object.position, sat2.object.position);
      if (distanceVector.lengthSq() < 70000000000) {
        let newVelocity = sat1.velocityVector.multiplyScalar(sat1.mass)
          .add(sat2.velocityVector.multiplyScalar(sat2.mass))
          .divideScalar(sat1.mass + sat2.mass);
        let mTotal = sat1.mass + sat2.mass;
        sat1.mass = mTotal;

        let index = satellites.indexOf(sat2)
        removeSatelliteFromScene(index)
        destroyFolder(index);

        sat1.object.scale.multiplyScalar(2);
        sat1.velocityVector.copy(newVelocity);
      }
    }
  }
}

export function removeSatelliteFromScene(index) {
  let satToBeDeleted = satellites.at(index);
  satToBeDeleted.arrows.forEach((arrow) => {
    scene.remove(arrow);
  });
  satellites.splice(index, 1)
  scene.remove(satToBeDeleted.object);
}
