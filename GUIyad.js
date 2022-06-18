import GUI from "lil-gui";
import { Vector3 } from "three";
import { addSatellite } from "./main";

var satellitesFolders = new Array()

function satelliteFolderFunc(allSatellitesFolder, satellites) {
  const satelliteFolder = allSatellitesFolder.addFolder(
    "satellite no. " + (satellites.length - 1)
  );

  satelliteFolder.add(satellites[satellites.length - 1].object.position, "x").min(-20000000).max(20000000).listen(true).step(100).name("                x");
  satelliteFolder.add(satellites[satellites.length - 1].object.position, "y").min(-20000000).max(20000000).listen(true).step(100).name("                y");
  satelliteFolder.add(satellites[satellites.length - 1].object.position, "z").min(-20000000).max(20000000).listen(true).step(100).name("                z");
  satelliteFolder.add(satellites[satellites.length - 1], "mass").min(1).max(5000).step(5).listen(true).name("             mass");
  satelliteFolder.add(satellites[satellites.length - 1], "radius").min(0).max(20).step(1).listen(true).name("            radius");
  satelliteFolder.add(satellites[satellites.length - 1], "speed").min(0).max(100000).step(10).listen(true).name("            speed");
  return satelliteFolder;
}

export function guiFunc(satellites, time) {

  const gui = new GUI({ width: 320 });

  gui.add(time, "timeScale").min(0).max(100).step(0.1).name("Time Scale");

  const allSatellitesFolder = gui.addFolder("All Satellites");

  const AddSatelliteFolder = gui.addFolder("Add Satellite");

  let satelliteGuiValues = {};

  const satGui = {
    x: 7000000, y: 7000000, z: 7000000, mass: 10, radius: 1, speed: 7000,
    //at pos (8.5 million, 8.5 million, 8.5 million) the height
    // of satellite will be 8,351 km from surface of earth
    SaveSatellite() {
      satelliteGuiValues = gui.save();
      loadButton.enable();
    },
    AddSatellite() {
      gui.load(satelliteGuiValues);
      addSatellite(new Vector3(this.x, this.y, this.z), this.mass, this.radius, this.speed)

      const satelliteFolder = satelliteFolderFunc(allSatellitesFolder, satellites)

      satellitesFolders.push(satelliteFolder);
    },
  };
  //at pos (20 million, 20 million, 20 million) the height of satellite will be 28,270 km
  AddSatelliteFolder.add(satGui, "x").min(-20000000).max(20000000).step(100).listen(true).name("                x");
  AddSatelliteFolder.add(satGui, "y").min(-20000000).max(20000000).step(100).listen(true).name("                y");
  AddSatelliteFolder.add(satGui, "z").min(-20000000).max(20000000).step(100).listen(true).name("                z");
  AddSatelliteFolder.add(satGui, "mass").min(0).max(5000).step(5).listen(true).name("             mass");
  AddSatelliteFolder.add(satGui, "radius").min(0).max(20).step(1).listen(true).name("            radius");
  AddSatelliteFolder.add(satGui, "speed").min(0).max(100000).step(10).listen(true).name("            speed");
  AddSatelliteFolder.add(satGui, "SaveSatellite");
  const loadButton = AddSatelliteFolder.add(satGui, "AddSatellite").disable();

  return satellitesFolders
}

export function destroyFolder(index){
    satellitesFolders[index].destroy();
    satellitesFolders.splice(index, 1)
}