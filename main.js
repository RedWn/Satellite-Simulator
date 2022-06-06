import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Vector3 } from "three.js";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function createMoon(radius) {
  const geometry = new THREE.SphereGeometry(radius);
  const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

// Debug
const gui = new dat.GUI();

//Scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();

// Earth
const geometry = new THREE.SphereGeometry(5, 20, 20);
const material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(earthTexture),
});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);

// Models
const gltfLoader = new GLTFLoader();
let satellite;

gltfLoader.load("./assets/satellite.gltf", (gltf) => {
  satellite = gltf.scene;
  satellite.scale.set(0.009, 0.009, 0.009);
  satellite.position.set(5, 5, 5);
  scene.add(satellite);
});
gltfLoader.load("./assets/satellite.gltf", (gltf) => {
  let satellite1 = gltf.scene;
  satellite1.scale.set(0.009, 0.009, 0.009);
  satellite1.position.set(5, 0, 5);
  scene.add(satellite1);
});

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

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 20;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.setPixelRatio(window.devicePixelRatio, 2);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

//Lights
const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x444444);
pointLight.position.set(5, 5, 5);
scene.add(ambientLight);
scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);

//physics variables
let clock = new THREE.Clock();
let deltaTime = 1;

function Vortex(satellite) {}

function animate() {
  deltaTime = clock.getElapsedTime() + 1;
  console.log(deltaTime);
  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
