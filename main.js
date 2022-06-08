// @ts-check

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_MASS, EARTH_RADIUS, EARTH_RADIUS_SQ, GRAVITY_CONSTANT } from "./constants.js";

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
});
// satellite.scale.multiplyScalar(100000)
// satellite.position.set(0, 6.378e7, 0)
satellite.position.set(EARTH_RADIUS * 1.2, EARTH_RADIUS + 1e3, EARTH_RADIUS + 1e3);
scene.add(satellite);

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
  console.log(deltaVelocity);

  
  displacement.copy(deltaVelocity).multiplyScalar(deltaTime);

  satellite.position.add(displacement);

  if (satellite.position.lengthSq() < EARTH_RADIUS_SQ){
    scene.remove(satellite);
    satellite.visible = false;
  }
  
}

let clock = new THREE.Clock();
let previousTime = Date.now();
let elapsedTime = 1;

function animate() {
  elapsedTime = clock.getElapsedTime() + 1;
  //delta = clock.getDelta();
  const currentTime = Date.now();
  const deltaTime = (currentTime - previousTime) / 1000;
  previousTime = currentTime;

  if(satellite.visible)
    applyGravity(satellite, deltaTime * 1e3);

  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
