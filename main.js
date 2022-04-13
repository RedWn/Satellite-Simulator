import './style.css';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'

import * as dat from 'dat.gui'




function createMoon(radius){
      const geometry = new THREE.SphereGeometry(radius);
      const material = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      return mesh;
}

//parameters
const parameters = {
  stop: false,
}

// //Debug
const gui = new dat.GUI()

let stop = false;
gui.add(parameters, 'stop').onChange(function(value){
  if(value){
    stop=true;
  } else {
    stop=false;
  }
});



//Scene
const scene = new THREE.Scene();


//Objects
const geometry = new THREE.SphereGeometry(5);


//Materials
const material = new THREE.MeshStandardMaterial({
  color: 0xff6347
});



const earth = new THREE.Mesh(geometry, material);
scene.add(earth);
earth.position.set(0, 0, 0);
const moons = [createMoon(1),createMoon(1)];
moons[0].position.set(0,10,5);
moons[1].position.copy(new THREE.Vector3(2,2,-5).add(moons[0].position));

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
// camera.position.setZ(20);
camera.position.z = 20
scene.add(camera)
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// scene.add(camera)


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


//phisic functions
let a, v = 0,
  x, G, M, R;

G = 6.674e-11;
M = 1e6;

function Gravity(moon) {
  a = G * M / Math.sqrt(Math.pow(moon.position.y, 2) + Math.pow(moon.position.x, 2) + Math.pow(moon.position.z, 2));
  v += a;
  let dest = getSlope(moon.position, new THREE.Vector3(0, 0, 0));
  if (!(Math.sqrt(Math.pow(moon.position.y + v * dest[1], 2) + Math.pow(moon.position.x + v * dest[0], 2) + Math.pow(moon.position.z + v * dest[2], 2)) < 6)) {
    moon.position.x += v * dest[0];
    moon.position.y += v * dest[1];
    moon.position.z += v * dest[2];
  }
}

function Gravity2(moon){
  if(collision(moon.position))
    return ;
  let angles = getAngles(moon.position);

  
  let force = -1e4*G*M/Math.pow(getDistance(moon.position),2);

  moon.position.x += force*Math.cos(angles[1])*Math.cos(angles[0]);
  moon.position.y += force*Math.sin(angles[1])*Math.cos(angles[0]);
  moon.position.z += force*Math.sin(angles[0]);
  // let ac = force;
  // if(moon.position.x >= 0)
  //   return ac;
  // else
  //   return -ac;
}

function getDistance(pos){
  return Math.sqrt(Math.pow(pos.x,2)+Math.pow(pos.y,2)+Math.pow(pos.z,2));
}

function collision(pos){
  return getDistance(pos)<=6;
}

function getAngles(pos){
  let gama = Math.asin(pos.z/getDistance(pos));
  if (pos.x==0)
    return [gama,Math.sign(pos.y)*Math.PI/2];
  let theta = Math.atan(pos.y/pos.x);
  if(pos.x < 0)
    theta += Math.PI;
  return [gama,theta];
}

//calculate the projection of the moon on the axises
function getProjection(pos, axis){
  let proj = new THREE.Vector3();
  proj.copy(pos);
  proj.projectOnVector(axis);
  return proj;
}


function getSlope(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;

  const d = Math.sqrt(dx*dx + dy*dy + dz*dz);

  return [dx / d, dy / d, dz / d];
}

const controls = new OrbitControls(camera, renderer.domElement);

/**
 * Animate
 */
function animate() {
  requestAnimationFrame(animate);
  if(!stop)
    moons.forEach(Gravity2);

  controls.update();
  renderer.render(scene, camera);
}

animate();