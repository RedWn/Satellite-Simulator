import Experience from "../Experience";
import * as THREE from "three";
import starsTexture from './assets/stars.jpg'

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    // Methods
    this.setSunLight();
    this.addBackground();
  }
  setSunLight() {
    const pointLight = new THREE.PointLight(0xffffff);
    const ambientLight = new THREE.AmbientLight(0x444444);
    pointLight.position.set(5, 5, 5);
    this.scene.add(ambientLight);
    this.scene.add(pointLight);
  }

  addBackground() {
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    this.scene.background = cubeTextureLoader.load([
      starsTexture,
      starsTexture,
      starsTexture,
      starsTexture,
      starsTexture,
      starsTexture,
    ]);
  }
}
