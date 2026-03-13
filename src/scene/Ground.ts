import { Scene } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";

export class Ground {
  init(scene: Scene, model: GLTF) {
    this.createPlane(scene, model);
  }

  createPlane(scene: Scene, model: GLTF) {
    model.scene.position.set(0, 0, 0);
    model.scene.scale.set(8, 4, 6);
    model.scene.traverse((e) => {
      e.name = "ground";
    });
    scene.add(model.scene);
  }
}
