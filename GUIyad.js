import { earth_mass_object } from "./Constants";
import GUI from "lil-gui";
import * as THREE from "three";
import { Vector3 } from "three";
import { addSatellite, removeSatelliteFromScene, scene } from "./main";

var allSatellitesFolder
export var satellitesFolders = new Array()
var gui

function satelliteFolderFunc(satellites) {

  let i = satellites.length - 1

  const satelliteFolder = allSatellitesFolder.addFolder(
    "satellite no. " + i
  );

  satelliteFolder.add(satellites[i].object.position, "x").min(-20000000).max(20000000).listen(true).step(100).name("                x");
  satelliteFolder.add(satellites[i].object.position, "y").min(-20000000).max(20000000).listen(true).step(100).name("                y");
  satelliteFolder.add(satellites[i].object.position, "z").min(-20000000).max(20000000).listen(true).step(100).name("                z");
  satelliteFolder.add(satellites[i], "mass").min(1).max(5000).step(5).listen(true).name("             mass");
  satelliteFolder.add(satellites[i], "radius").min(0).max(20).step(1).listen(true).name("            radius");
  satelliteFolder.add(satellites[i], "height").min(0).max(30000000).step(100).listen(true).name("            height");
  satelliteFolder.add(satellites[i].V, "x").min(-10000).max(10000).step(100).listen(true).name("            Vx");
  satelliteFolder.add(satellites[i].V, "y").min(-10000).max(10000).step(100).listen(true).name("            Vy");
  satelliteFolder.add(satellites[i].V, "z").min(-10000).max(10000).step(100).listen(true).name("            Vz");

  const satelliteFunctions = {
    deleteSatellite() {
      destroyFolder(i)
      removeSatelliteFromScene(i)
      satellites.splice(i, 1)
    },
  }

  satelliteFolder.add(satelliteFunctions, "deleteSatellite");
  return satelliteFolder;
}

let prototype, satGui

export function guiFunc(satellites, time) {

  gui = new GUI({ width: 320 });
  gui.title("Simulation Controls")

  gui.add(time, "timeScale").min(0).max(100).step(0.1).name("Time Scale");

  gui.add(earth_mass_object, "EARTH_MASS").min(1000).max(5.972e24 * 10).listen(true).name("Earth Mass")

  allSatellitesFolder = gui.addFolder("All Satellites");

  const AddSatelliteFolder = gui.addFolder("Add Satellite");

  let satelliteGuiValues = {};

  satGui = {
    x: 7000000, y: 7000000, z: 7000000, mass: 10, radius: 1, speed: 7000, Vx: 0, Vy: 0, Vz: 0,
    //at pos (8.5 million, 8.5 million, 8.5 million) the height
    // of satellite will be 8,351 km from surface of earth
    SaveSatellite() {
      satelliteGuiValues = gui.save();
      loadButton.enable();
    },
    AddSatellite() {
      gui.load(satelliteGuiValues);
      addSatellite(new Vector3(this.x, this.y, this.z), this.mass, this.radius, this.speed, new Vector3(this.Vx, this.Vy, this.Vz))

      const satelliteFolder = satelliteFolderFunc(satellites)

      satellitesFolders.push(satelliteFolder);
    },
  };
  //at pos (20 million, 20 million, 20 million) the height of satellite will be 28,270 km
  AddSatelliteFolder.add(satGui, "x").min(-20000000).max(20000000).step(1000).listen(true).name("                x");
  AddSatelliteFolder.add(satGui, "y").min(-20000000).max(20000000).step(100).listen(true).name("                y");
  AddSatelliteFolder.add(satGui, "z").min(-20000000).max(20000000).step(1000).listen(true).name("                z");
  AddSatelliteFolder.add(satGui, "mass").min(0).max(5000).step(5).listen(true).name("             mass");
  AddSatelliteFolder.add(satGui, "radius").min(0).max(20).step(1).listen(true).name("            radius");
  AddSatelliteFolder.add(satGui, "Vx").min(-1).max(1).step(0.1).listen(true).name("                Vx");
  AddSatelliteFolder.add(satGui, "Vy").min(-1).max(1).step(0.1).listen(true).name("                Vy");
  AddSatelliteFolder.add(satGui, "Vz").min(-1).max(1).step(0.1).listen(true).name("                Vz");
  AddSatelliteFolder.add(satGui, "speed").min(0).max(10000).step(100).listen(true).name("            speed");
  AddSatelliteFolder.add(satGui, "SaveSatellite");
  const loadButton = AddSatelliteFolder.add(satGui, "AddSatellite").disable();

  prototype = new THREE.Mesh( new THREE.SphereGeometry( 15, 32, 16 ),
               new THREE.MeshBasicMaterial( { color: 0xffa0f0 } ) );
  prototype.scale.multiplyScalar(10000)
  scene.add( prototype );

}

export function destroyFolder(index) {
  satellitesFolders[index].destroy()
  satellitesFolders.splice(index, 1)
}

export function updatePrototype(){
  prototype.position.set(satGui.x, satGui.y, satGui.z)
}