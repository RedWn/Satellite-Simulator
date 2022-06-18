import * as THREE from "three";

import {
  EARTH_MASS,
  EARTH_RADIUS,
  EARTH_RADIUS_SQ,
  GRAVITY_CONSTANT,
  MOON_RADIUS,
  MOON_TO_EARTH,
  SUN_RADIUS,
  SUN_TO_EARTH,
} from "./Experience/Constants";

import earthTexture from "./assets/earth.jpg";
import moonTexture from "./assets/moon.jpg";
import sunTexture from "./assets/sun.png";
import starsTexture from "./assets/stars.jpg";

const textureLoader = new THREE.TextureLoader();

// Earth
export function earthFunc(scene) {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(earthTexture),
    wireframe: false,
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.position.set(0, 0, 0);
  scene.add(earth);
  return earth;
}

// MOON
export function moonFunc(scene) {
  const geometry1 = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
  const material1 = new THREE.MeshBasicMaterial({
    map: textureLoader.load(moonTexture),
    wireframe: false,
  });
  const moon = new THREE.Mesh(geometry1, material1);
  scene.add(moon);
  moon.position.set(MOON_TO_EARTH, MOON_TO_EARTH, MOON_TO_EARTH);
  return moon;
}

// SUN
export function sunFunc(scene) {
  const geometry2 = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
  const material2 = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture),
    wireframe: false,
  });
  const sun = new THREE.Mesh(geometry2, material2);
  scene.add(sun);
  sun.position.set(SUN_TO_EARTH, SUN_TO_EARTH, SUN_TO_EARTH);
  return sun;
}

export function misc(scene, camera, renderer, sizes) {
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
}

//Lights
export function lights(scene, sun) {
  const pointLight = new THREE.PointLight(0xffffff);
  const ambientLight = new THREE.AmbientLight(0x444444);
  pointLight.position.set(sun.position.x, sun.position.y, sun.position.z);
  scene.add(ambientLight);
  scene.add(pointLight);
  pointLight.power;
}

export function cameraFunc(sizes, sun) {
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1e13
  );
  camera.position.z = EARTH_RADIUS * 2;
  camera.lookAt(sun.position);
  return camera;
}

export function rendererFunc() {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg") ?? undefined,
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}
