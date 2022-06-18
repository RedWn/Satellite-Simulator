import Experience from "./Experience";
import * as THREE from "three";
export default class Renderer {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.canvas = this.experience.canvas;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.setInstance();
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.setSize(this.sizes.width, this.sizes.height);
    //
  }

  resize() {
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.setSize(this.sizes.width, this.sizes.height);
  }
  update() {
    this.instance.render(this.scene, this.camera.instance);
  }
}
