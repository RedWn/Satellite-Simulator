import Experience from "../Experience";
import Environment from "./Environment";
import earthTexture from './assets/earth.jpg'
import sunTexture from "./assets/sun.png";
import moonTexture from "./assets/moon.jpg";
import { EARTH_RADIUS, MOON_RADIUS, MOON_TO_EARTH, SUN_RADIUS, SUN_TO_EARTH } from "../Constants";
import * as THREE from "three";
import Satellite from "./Satellite";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    const textureLoader = new THREE.TextureLoader();

    // Earth
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      map: textureLoader.load(earthTexture),
      wireframe: false,
    });
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
    this.scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));
    this.earth.position.set(0, 0, 0);

    // MOON
    const geometry1 = new THREE.SphereGeometry(MOON_RADIUS, 64, 64);
    const material1 = new THREE.MeshBasicMaterial({
      map: textureLoader.load(moonTexture),
      wireframe: false,
    });
    const moon = new THREE.Mesh(geometry1, material1);
    this.scene.add(moon);
    moon.position.set(MOON_TO_EARTH, MOON_TO_EARTH, MOON_TO_EARTH);

    // SUN
    const geometry2 = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
    const material2 = new THREE.MeshBasicMaterial({
      map: textureLoader.load(sunTexture),
      wireframe: false,
    });
    const sun = new THREE.Mesh(geometry2, material2);
    this.scene.add(sun);
    sun.position.set(SUN_TO_EARTH, SUN_TO_EARTH, SUN_TO_EARTH);

    // SetUp
    this.environment = new Environment();
    this.addSatellit(EARTH_RADIUS * 1.2, EARTH_RADIUS + 1e3, EARTH_RADIUS + 1e3);
  }
  addSatellit(x, y, z){
    this.satellite = new Satellite(x, y, z);
  }
  update(){
    this.earth.rotateY(1.2120351080246913580246913580247e-6);
  }
}
