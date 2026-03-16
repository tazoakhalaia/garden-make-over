import gsap from "gsap";
import type { Scene } from "three";
import type { LoadModels } from "./loadModels";

export class Spawner {
  private scene!: Scene;
  private loadModel!: LoadModels;
  init(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    this.loadModel = loadModel;
  }

  spawnObjects(x: number, y: number, z: number) {
    const spawnObject = this.loadModel
      .getModel("farmObjects")
      .scene.children[2].clone();

    spawnObject.scale.set(0, 0, 0);
    spawnObject.position.set(x, y, z);
    this.scene.add(spawnObject);

    gsap.to(spawnObject.scale, {
      x: 3,
      y: 3,
      z: 3,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }
}
