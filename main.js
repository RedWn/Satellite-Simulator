import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Vector3 } from "three.js";
import starsTexture from "./assets/stars.jpg";
import earthTexture from "./assets/earth.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
let satellite = new THREE.Object3D();

gltfLoader.load("./assets/satellite.gltf",
(gltf) => {
  satellite = gltf.scene
  satellite.scale.set(0.009, 0.009, 0.009);
  satellite.position.set(5,0,5)
  scene.add(satellite);
},);


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
let elapsedTime = 1;

function Vortex(satellite) {}

function animate() {
  elapsedTime = clock.getElapsedTime() + 1;
  var delta = clock.getDelta();
  // Satllite position
  satellite.position.set(Math.sin(elapsedTime/2) * 3, 5, Math.cos(elapsedTime/2) * 3)
  // satellite.rotation.x += 0.4 * delta;
  // satellite.rotation.y += 0.2 * delta;
  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
