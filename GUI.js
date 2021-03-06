import { earth_mass_object, EARTH_RADIUS } from "./Constants";
import GUI from "lil-gui";
import * as THREE from "three";
import { Vector3 } from "three";
import { addSatellite, removeSatelliteFromScene, satellites, scene, time } from "./main";

var allSatellitesFolder
export var satellitesFolders = new Array()
var gui

export function satelliteFolderFunc(i) {

  const satelliteFolder = allSatellitesFolder.addFolder(
    "satellite no. " + i
  );

  satelliteFolder.add(satellites[i].object.position, "x").min(-20000000).max(20000000).listen(true).step(10000).name("                x");
  satelliteFolder.add(satellites[i].object.position, "y").min(-20000000).max(20000000).listen(true).step(10000).name("                y");
  satelliteFolder.add(satellites[i].object.position, "z").min(-20000000).max(20000000).listen(true).step(10000).name("                z");
  satelliteFolder.add(satellites[i], "mass").min(1).max(5000).step(5).listen(true).name("             mass");
  satelliteFolder.add(satellites[i], "radius").min(0).max(20).step(1).listen(true).name("            radius");
  satelliteFolder.add(satellites[i], "height").min(0).max(30000000).step(100).listen(true).name("            height");
  satelliteFolder.add(satellites[i].velocityVector, "x").min(-10000).max(10000).step(100).listen(true).name("            Vx");
  satelliteFolder.add(satellites[i].velocityVector, "y").min(-10000).max(10000).step(100).listen(true).name("            Vy");
  satelliteFolder.add(satellites[i].velocityVector, "z").min(-10000).max(10000).step(100).listen(true).name("            Vz");

  const satelliteFunctions = {
    deleteSatellite() {
      removeSatelliteFromScene(i)
      destroyFolder(i)
      
    },
  }

  satelliteFolder.add(satelliteFunctions, "deleteSatellite");
  return satelliteFolder;
}

let prototype, satGui, arrowHelper

export function guiFunc() {

  gui = new GUI({ width: 320 });
  gui.title("Simulation Controls")

  gui.add(time, "timeScale").min(0).max(1000).step(0.5).name("Time Scale").onFinishChange(SaveValues)

  gui.add(earth_mass_object, "EARTH_MASS").min(0).max(5.972e24 * 10).listen(true).name("Earth Mass").onFinishChange(SaveValues)

  allSatellitesFolder = gui.addFolder("All Satellites");

  const AddSatelliteFolder = gui.addFolder("Add Satellite");

  satGui = {
    x: 0, y: 8000000, z: 0, mass: 10, radius: 1, speed: 7000, Vx: 1, Vy: 0, Vz: 0, height: 0,
    //at pos (8.5 million, 8.5 million, 8.5 million) the height
    // of satellite will be 8,351 km from surface of earth
    AddSatellite() {
      addSatellite(new Vector3(this.x, this.y, this.z), this.mass, this.radius, this.speed, new Vector3(this.Vx, this.Vy, this.Vz))
    },
  };
  //at pos (20 million, 20 million, 20 million) the height of satellite will be 28,270 km
  AddSatelliteFolder.add(satGui, "x").min(-20000000).max(20000000).step(10000).name("                x").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "y").min(-20000000).max(20000000).step(10000).name("                y").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "z").min(-20000000).max(20000000).step(10000).name("                z").onFinishChange(SaveValues);

  AddSatelliteFolder.add(satGui, "height").min(0).max(30000000).step(100).listen(true).name("                height");
  AddSatelliteFolder.add(satGui, "mass").min(0).max(5000).step(5).name("             mass").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "radius").min(0).max(20).step(1).name("            radius").onFinishChange(SaveValues);

  AddSatelliteFolder.add(satGui, "Vx").min(-1).max(1).step(0.1).name("                Vx").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "Vy").min(-1).max(1).step(0.1).name("                Vy").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "Vz").min(-1).max(1).step(0.1).name("                Vz").onFinishChange(SaveValues);
  AddSatelliteFolder.add(satGui, "speed").min(0).max(12000).step(100).name("            speed").onFinishChange(SaveValues);
  
  AddSatelliteFolder.add(satGui, "AddSatellite");

  function SaveValues() {
    gui.save();
  }
  prototype = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xffa0f0 }));
  prototype.scale.multiplyScalar(10000);

  arrowHelper = new THREE.ArrowHelper(new Vector3(), prototype.position, 1, 0xffa0f0);
  scene.add(prototype);
  scene.add(arrowHelper);

}

export function destroyFolder(index) {
  satellitesFolders[index].destroy()
  satellitesFolders.splice(index, 1)
}

export function updatePrototype() {
  prototype.position.set(satGui.x, satGui.y, satGui.z)
  satGui.height = ((prototype.position.length()) - EARTH_RADIUS);
  arrowHelper.position.set(satGui.x, satGui.y, satGui.z);
  arrowHelper.setDirection(new Vector3(satGui.Vx, satGui.Vy, satGui.Vz).normalize());
  arrowHelper.setLength(satGui.speed * 1e2);
}