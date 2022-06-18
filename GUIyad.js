import GUI from "lil-gui";
import { addSat } from "./main";

function satelliteFolderFunc(allSatellitesFolder, satellites){
    const satelliteFolder = allSatellitesFolder.addFolder(
        "satellite no. " + (satellites.length - 1)
      );
    
      satelliteFolder.add(satellites[satellites.length -1].position, "x").min(-20000000).max(20000000).listen(true).step(100).name("                       x");
      satelliteFolder.add(satellites[satellites.length -1].position, "y").min(-20000000).max(20000000).listen(true).step(100).name("                       y");
      satelliteFolder.add(satellites[satellites.length -1].position, "z").min(-20000000).max(20000000).listen(true).step(100).name("                       z");
    return satelliteFolder;
}

export function guiFunc(satellites, time) {
  const gui = new GUI();
  gui.add(time, "timeScale").min(0).max(100).step(0.1).name("Time Scale");

  const allSatellitesFolder = gui.addFolder("All Satellites");
  
  const AddSatelliteFolder = gui.addFolder("Add Satellite");

  let satellitesFolders = new Array();

  let satelliteGuiValues = {};
  
  const satGui = {
    x: 8500000,  y: 8500000,  z: 8500000,
    //at pos (8.5 million, 8.5 million, 8.5 million) the height
    // of satellite will be 8,351 km from surface of earth
    SaveSatellite() {
      satelliteGuiValues = gui.save();
      loadButton.enable();
    },
    AddSatellite() {
      gui.load(satelliteGuiValues);
      addSat(this.x, this.y, this.z)

      const satelliteFolder = satelliteFolderFunc(allSatellitesFolder, satellites)
      
      satellitesFolders.push(satelliteFolder);
      },
  };
  //at pos (20 million, 20 million, 20 million) the height of satellite will be 28,270 km
  AddSatelliteFolder.add(satGui, "x").min(-20000000).max(20000000).step(100).listen(true).name("                       x");
  AddSatelliteFolder.add(satGui, "y").min(-20000000).max(20000000).step(100).listen(true).name("                       y");
  AddSatelliteFolder.add(satGui, "z").min(-20000000).max(20000000).step(100).listen(true).name("                       z");
  AddSatelliteFolder.add(satGui, "SaveSatellite");
  const loadButton = AddSatelliteFolder.add(satGui, "AddSatellite").disable();

  return satellitesFolders
}

export function destroyFolder(satellitesFolders, index){
    satellitesFolders[index].destroy();
    satellitesFolders.splice(index, 1)
}