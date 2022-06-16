import Experience from "../Experience";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EARTH_RADIUS } from "../Constants";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// import satelliteModel from "../assets/satellite.gltf";
import * as THREE from "three";

export default class Satellite {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader)
    let satellite = new THREE.Object3D();
    gltfLoader.load('../assets/scene.gltf', ( gltf ) => {

      satellite = gltf.scene
    
    },);
    satellite.position.set(
      EARTH_RADIUS * 1.2,
      EARTH_RADIUS + 1e3,
      EARTH_RADIUS + 1e3
    );
    this.scene.add(satellite);
  }
}
