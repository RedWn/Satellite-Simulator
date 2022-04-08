import './style.css';

import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#bg')});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth , window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.SphereGeometry(5);
const material = new THREE.MeshStandardMaterial({color: 0xff6347});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0,0,0);

const pointLight = new THREE.PointLight(0xffffff);
const ambientLight = new THREE.AmbientLight(0x444444);
pointLight.position.set(5,5,5);
scene.add(ambientLight);
scene.add(pointLight);

  const geometry2 = new THREE.SphereGeometry(1);
  const material2 = new THREE.MeshStandardMaterial({color: 0xff6347});
  const moon = new THREE.Mesh(geometry2, material2);
  moon.position.set(0,7,0);
  scene.add(moon);

let a,v=0,x,G,M,R;

// function getSlope(p1, p2){
//   let d, dx, dy;
// 	d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
// 	dx = p2.x - p1.x;
// 	dy = p2.y - p1.y;
// 	return [ dx / d, dy / d , 0];
// }

function Gravity(v){
  let dest = getSlope(moon.position, new THREE.Vector3(0,0,0));
  if (!(Math.sqrt(Math.pow(moon.position.y + v*dest[1], 2) + Math.pow(moon.position.x + v*dest[0], 2)) < 6)){
  moon.position.x += v*dest[0];
  moon.position.y += v*dest[1];
  moon.position.z += v*dest[2];
	}
}

function moonMove(v){
  let dest = getSlope(moon.position, new THREE.Vector3(0,0,0));
  if (!(Math.sqrt(Math.pow(moon.position.y + v*dest[1], 2) + Math.pow(moon.position.x + v*dest[0], 2)) < 6)){
  moon.position.x += v*dest[1];
  moon.position.y += -v*dest[0];
  moon.position.z += v*dest[2];
	}
}
function getSlope(p1, p2){
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  return [ dx / d, dy / d , 0];
}

function animate(){
  requestAnimationFrame(animate);
  G = 6.674e-11;
  M = 1e6;
  a = G * M / Math.sqrt(Math.pow(moon.position.y,2)+Math.pow(moon.position.x,2));
  v += a;
  Gravity(v);
  moonMove(25*v);


  renderer.render(scene, camera);
}


animate();