import type { Scene } from "three";
import { LoadModels } from "../config";

export class StaticModels {
  private loader = new LoadModels();

  init(scene: Scene, loadModel: LoadModels) {
    // this.crearteFarmHouse(scene, loadModel);
  }

  // crearteFarmHouse(scene: Scene, loadModel: LoadModels) {
  //   const farmHouse = loadModel.getModel("farmHouse").scene;
  //   farmHouse.scale.set(1.5, 1.5, 1.5);
  //   farmHouse.rotateY(1.5);
  //   farmHouse.position.z = -15;
  //   scene.add(farmHouse);
  // }
}
