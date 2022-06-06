import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Clock, ClosedSplineCurve3, Vector3 } from "three.js";
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
const geometry = new THREE.SphereGeometry(6.378e6, 64, 64);
const material = new THREE.MeshBasicMaterial({
  map: textureLoader.load(earthTexture),
});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);

// Models
const gltfLoader = new GLTFLoader();
let satellite = new THREE.Object3D();

gltfLoader.load("./assets/satellite.gltf", (gltf) => {
  satellite = gltf.scene;
  satellite.scale.set(0.009, 0.009, 0.009);
  satellite.position.set(0, 6379000, 0);
  scene.add(satellite);
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
  1e7
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 1.2756e7;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio, 2);
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

//physics variables
let clock = new THREE.Clock();
let elapsedTime = 1;

function Vortex(satellite) {}

var G = 6.6743e-11;
var MEarth = 5.972e24;
var g;

function Gravity() {
  //g = G * m(earth) / r^2
  g =
    (G * MEarth) /
    Math.pow(distance(new Vector3(0, 0, 0), satellite.position), 2);
  //v = sqrt(G*m(earth)/r)

  //v = Math.sqrt((G * MEarth) / distance(new Vector3(0, 0, 0), satellite.position));

  //let newY = satellite.position.y - (0.5 * g * Math.pow(elapsedTime, 2));
  //console.log("newY: "+ newY)
  //satellite.position.set(
  //   new Vector3(satellite.position.x, newY, satellite.position.z)
  // );
}

function distance(vector1, vector2) {
  let xDist = vector2.x - vector1.x;
  let yDist = vector2.y - vector1.y;
  let zDist = vector2.z - vector1.z;
  let r = Math.sqrt(
    Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2)
  );
  console.log("distance " + r);
  return r;
}

function animate() {
  Gravity();
  elapsedTime = clock.getElapsedTime() + 1;
  var delta = clock.getDelta();
  // satellite.position.set(
  //   Math.sin(elapsedTime / 2) * 3,
  //   5,
  //   Math.cos(elapsedTime / 2) * 3
  // );
  // satellite.rotation.x += 0.4 * delta;
  // satellite.rotation.y += 0.2 * delta;
  earth.rotateY(0.004);
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
