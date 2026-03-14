import { Scene } from "three";
import type { LoadModels } from "../config";

export class Ground {
  init(scene: Scene, loadModels: LoadModels) {
    this.createPlane(scene, loadModels);
  }

  createPlane(scene: Scene, loadModels: LoadModels) {
    const ground = loadModels.getModel("ground").scene;
    ground.position.set(0, 0, 0);
    ground.scale.set(8, 6, 6);
    ground.traverse((e) => {
      e.name = "ground";
    });
    scene.add(ground);
  }
}
