import './style.css';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'

import * as dat from 'dat.gui'
import { Vector3 } from 'three.js';




function createMoon(radius){
      const geometry = new THREE.SphereGeometry(radius);
      const material = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
}

// //Debug
const gui = new dat.GUI()

//Scene
const scene = new THREE.Scene();

const geometry = new THREE.SphereGeometry(5);
const material = new THREE.MeshStandardMaterial({color: 0x4763ff});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);

const moons = [createMoon(1),createMoon(1),createMoon(1)];
moons[0].position.set(0,10,0);
moons[1].position.copy(new THREE.Vector3(3,3,0).add(moons[0].position));
moons[2].position.set(0,0,10);
let testMoonDest = new THREE.Vector3(0,0,0);
testMoonDest.add(moons[1].position);
// moons.push(createMoon(1));


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * 
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 20
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
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
let a, v = 0,
  G, M, R,s=0.1,dt=1;

  document.addEventListener("keydown", onDocumentKeyDown, false);
  function onDocumentKeyDown(event) {
      var keyCode = event.which;
      if (keyCode == 87) {
          s += 0.1;
      } else if (keyCode == 83) {
          s -= 0.1;
      } else if (keyCode == 65) {
          moons[0].position.x -= s;
      } else if (keyCode == 68) {
          moons[0].position.x += s;
      } else if (keyCode == 32) {
          moons[0].position.set(0, 0, 0);
      }
  };

function Gravity(moon) {
  G = 6.674e-11;
  M = 1e6 ;
  a = G * M / Math.sqrt(Math.pow(moon.position.y, 2) + Math.pow(moon.position.x, 2) + Math.pow(moon.position.z, 2));
  v = a / dt;
  let dest = getSlope(moon.position, new THREE.Vector3(0, 0, 0));
  if (!(Math.sqrt(Math.pow(moon.position.y + v * dest[1], 2) + Math.pow(moon.position.x + v * dest[0], 2) + Math.pow(moon.position.z + v * dest[2], 2)) < 6)) {
    moon.position.x = v * dest[0] / dt;
    moon.position.y = v * dest[1] / dt;
    moon.position.z = v * dest[2] / dt;
  }
}

function Force(moon,destination) {
  v = 0.005;
  let dest = getSlopeVector(destination.sub(moon.position));
  const X = new THREE.Vector3(0,0,0).copy(moon.position);
  if (!(Math.sqrt(Math.pow(moon.position.y + v * dest[1], 2) + Math.pow(moon.position.x + v * dest[0], 2) + Math.pow(moon.position.z + v * dest[2], 2)) < 6)) {
    moon.position.x = v * dest[0] / dt;
    moon.position.y = v * dest[1] / dt;
    moon.position.z = v * dest[2] / dt;
  }
  return X;
}

function getSlope(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;

  const d = Math.sqrt(dx*dx + dy*dy + dz*dz);

  return [dx / d, dy / d, dz / d];
}

function getSlopeVector(p) {
  const d = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
  return [p.x / d, p.y / d, p.z / d];
}


function animate() {
  requestAnimationFrame(animate);
  for (const moon of moons){
  Gravity(moon);
  }
  testMoonDest = Force(moons[1],testMoonDest);
  controls.update();
  dt+=0.001;
  renderer.render(scene, camera);
}

animate();