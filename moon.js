import { Object3D } from "three.js";

class Moon extends Object3D{

    constructor(radius){
        super();
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshStandardMaterial({color: 0xaaaaaa});
        const moon = new THREE.Mesh(geometry, material);
        this.position.set(0, 10, 0);
    }
}