import './style.css';
import * as THREE from 'three'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'

import * as dat from 'dat.gui'




function createMoon(radius,color=0xaaaaaa){
      const geometry = new THREE.SphereGeometry(radius);
      const material = new THREE.MeshStandardMaterial({color: color});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      return mesh;
}

//parameters
const parameters = {
  stop: false,
  reset: false,
}

// //Debug
const gui = new dat.GUI()

let stop = false;
gui.add(parameters, 'stop').onChange(function(value){stop=value;});





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


const moons = [createMoon(1),createMoon(1,0xffff00)];
moons[0].position.set(0,10,0);
moons[1].position.copy(moons[0].position);

gui.add(parameters, 'reset').onChange(function(value){
  stop=value;
  if(value){
    moons[0].position.set(0,10,0);
    moons[1].position.copy(moons[0].position);
  }
});

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
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0,0,20);
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


//phisic functions
let a, v,G, M;

G = 6.674e-11;
M = 1e6;

function formate_num(num){
  return Number(num.toFixed(places));
}

function Gravity(moon){
  let a = [0,0,0];
  if(collision(moon.position)){
    v=0;
    return ;
  }

  let angles = getAngles(moon.position);
  let force = -1e4*G*M/Math.pow(getDistance(moon.position),2);


  moon.position.x += (force*Math.cos(angles[1])*Math.cos(angles[0]));
  moon.position.y += (force*Math.sin(angles[1])*Math.cos(angles[0]));
  moon.position.z += (force*Math.sin(angles[0]));

  return a;
}

function Centrifugal(moon,v){
  let a = [0,0,0];

  let angles = getAngles(moon.position);
  let force = 1e4*Math.pow(v,2)/getDistance(moon.position);

  moon.position.x += (force*Math.cos(angles[1])*Math.cos(angles[0]));
  moon.position.y += (force*Math.sin(angles[1])*Math.cos(angles[0]));
  moon.position.z += (force*Math.sin(angles[0]));

  return a;
}

function moonMove(moon){
  if(collision(moon.position))
    return 0;
  v = Math.sqrt(G*M/getDistance(moon.position));
  let angles = getAngles(moon.position);
  let force = 100*v;
  moon.position.x += force*Math.sin(angles[1])*Math.cos(angles[0]);
  moon.position.y += -force*Math.cos(angles[1])*Math.cos(angles[0]);
  moon.position.z += force*Math.sin(angles[0]);
  return v;
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

const controls = new OrbitControls(camera, renderer.domElement);

/**
 * Animate
 */
function animate() {
  requestAnimationFrame(animate);
  if(!stop){
    for(let i=0;i<moons.length;i++){
      Gravity(moons[i]);
      Centrifugal(moons[i],moonMove(moons[i]));
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();