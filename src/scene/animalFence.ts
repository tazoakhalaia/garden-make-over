import gsap from "gsap";
import { BoxGeometry, Mesh, MeshBasicMaterial, type Scene } from "three";
import type { LoadModels } from "../config";

export class AnimalFence {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private hitBoxes: Mesh[] = [];

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

    const hitBox = new Mesh(
      new BoxGeometry(60, 5, 40),
      new MeshBasicMaterial({ color: 0xff0000, visible: false }),
    );
    hitBox.position.set(x, y + 2, z);
    this.scene.add(hitBox);
    this.hitBoxes.push(hitBox);

    gsap.to(fenceObject.scale, {
      x: 6,
      y: 6,
      z: 6,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  getHitBoxes() {
    return this.hitBoxes;
  }
}
