import Experience from "../Experience";
import Environment from "./Environment";
import earthTexture from '../assets/earth.jpg'
import { EARTH_RADIUS } from "../Constants";
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
      wireframe: true,
    });
    const earth = new THREE.Mesh(geometry, material);
    this.scene.add(earth);
    this.scene.add(new THREE.AxesHelper(EARTH_RADIUS / 10));
    earth.position.set(0, 0, 0);

    // SetUp
    this.environment = new Environment();
    this.satellite = new Satellite();
  }
}
