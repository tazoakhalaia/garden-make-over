import gsap from "gsap";
import type { Object3D, Scene } from "three";
import type { LoadModels } from "../config";

export class AnimalFence {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private storeFence: Object3D[] = [];

  createFence(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    this.loadModel = loadModel;
  }

  placeFenceAt(x: number, y: number, z: number) {
    const fenceObject = this.loadModel
      .getModel("farmObjects")
      .scene.children[4].clone();

    fenceObject.scale.set(0, 0, 0);
    fenceObject.position.set(x, y, z);
    fenceObject.rotation.y = Math.PI / 2;
    this.scene.add(fenceObject);
    this.storeFence.push(fenceObject);

    gsap.to(fenceObject.scale, {
      x: 6,
      y: 6,
      z: 6,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  getFence() {
    return this.storeFence;
  }
}
