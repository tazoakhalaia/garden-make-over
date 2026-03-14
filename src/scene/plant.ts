import gsap from "gsap";
import type { Scene } from "three";
import type { LoadModels } from "../config";

export class Plant {
  private scene!: Scene;
  private loadModel!: LoadModels;
  createPlant(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    this.loadModel = loadModel;
  }

  placePlantAt(x: number, y: number, z: number) {
    const plantObject = this.loadModel
      .getModel("farmObjects")
      .scene.children[17].clone();

    plantObject.scale.set(0, 0, 0);
    plantObject.position.set(x, y + 5, z);
    plantObject.rotation.y = Math.PI / 2;
    this.scene.add(plantObject);

    gsap.to(plantObject.scale, {
      x: 8,
      y: 8,
      z: 8,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }
}
