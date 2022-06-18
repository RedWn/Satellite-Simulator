import Experience from "../Experience";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_RADIUS, MOON_RADIUS } from "../Constants";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import satelliteModel from "./assets/scene.gltf";
import * as THREE from "three";

export default class Satellite {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    // const dracoLoader = new DRACOLoader()
    // dracoLoader.setDecoderPath('/draco/')
    // gltfLoader.setDRACOLoader(dracoLoader)
    // const gltfLoader = new GLTFLoader();
    // let satellite = new THREE.Object3D();
    // gltfLoader.load("./assets/scene.gltf", ( gltf ) => {

    //   satellite = gltf.scene
    //   satellite.scale.multiplyScalar(1e4);
    //   satellite.position.set(EARTH_RADIUS * 1.2, EARTH_RADIUS + 1e3, EARTH_RADIUS + 1e3);
    
    // },);
    // satellite.position.set(
    //   EARTH_RADIUS * 1.2,
    //   EARTH_RADIUS + 1e3,
    //   EARTH_RADIUS + 1e3
    // );
    const satellite = new THREE.Mesh(
      new THREE.BoxGeometry(MOON_RADIUS, MOON_RADIUS, MOON_RADIUS),
      new THREE.MeshBasicMaterial({wireframe: true})
    )
    this.scene.add(satellite);
  }
}
