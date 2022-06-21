import { scene } from "./main";
import * as THREE from "three";
import { Vector3 } from "three";


export function addArrows(satellite) {
    const arrowHelper = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0xff0000);
    scene.add(arrowHelper);
    satellite.arrows.push(arrowHelper);

    const arrowHelper1 = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0x0000ff);
    scene.add(arrowHelper1);
    satellite.arrows.push(arrowHelper1);

    const arrowHelper2 = new THREE.ArrowHelper(new Vector3(), satellite.object.position, 1, 0x00ff00);
    scene.add(arrowHelper2);
    satellite.arrows.push(arrowHelper2);
}

export function drawTrail(satellite) {
    const origin = satellite.object.position;
    const length = 1e6;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper(new Vector3(), origin, length, hex);
    scene.add(arrowHelper);
    const temp = new Vector3().copy(satellite.velocityVector);
    temp.normalize();
    const newSourcePos = satellite.object.position;
    var newTargetPos = temp;
    arrowHelper.position.set(newSourcePos.x, newSourcePos.y, newSourcePos.z);
    const direction = new THREE.Vector3().copy(newTargetPos);
    arrowHelper.setDirection(direction.normalize());
    arrowHelper.setLength(temp.length() * 1e5);

    setTimeout(removeTrail, 6e4, arrowHelper);
}

export function removeTrail(arrowHelper) {
    scene.remove(arrowHelper);
}

export function drawVector(satellite, vector, index) {
    const temp = new Vector3().copy(vector);
    temp.normalize();
    const newSourcePos = satellite.object.position;
    var newTargetPos = temp;
    satellite.arrows[index].position.set(
        newSourcePos.x,
        newSourcePos.y,
        newSourcePos.z
    );
    const direction = new THREE.Vector3().copy(newTargetPos);
    satellite.arrows[index].setDirection(direction.normalize());
    satellite.arrows[index].setLength(vector.length() * 1e6);
}