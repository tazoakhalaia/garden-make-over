import gsap from "gsap";
import { BoxGeometry, Mesh, MeshBasicMaterial, type Scene } from "three";
import type { LoadModels } from "../config";

export class Plant {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private hitBoxes: Mesh[] = [];

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

    plantObject.children.forEach((child) => {
      const hitBox = new Mesh(
        new BoxGeometry(2, 5, 2),
        new MeshBasicMaterial({ color: 0x00ff00, visible: false }),
      );
      hitBox.position.copy(child.position);
      plantObject.add(hitBox);
      this.hitBoxes.push(hitBox);
    });

    gsap.to(plantObject.scale, {
      x: 8,
      y: 8,
      z: 8,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  getHitBoxes() {
    return this.hitBoxes;
  }
}
