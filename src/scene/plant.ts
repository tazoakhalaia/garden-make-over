import gsap from "gsap";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  type Scene,
} from "three";
import type { LoadModels } from "../config";

interface PlantEntry {
  plantObject: Object3D;
  hitBoxes: Mesh[];
  x: number;
  y: number;
  z: number;
}

export class Plant {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private plants: PlantEntry[] = [];

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

    const entryHitBoxes: Mesh[] = [];

    plantObject.children.forEach((child) => {
      const hitBox = new Mesh(
        new BoxGeometry(2, 5, 2),
        new MeshBasicMaterial({ color: 0x00ff00, visible: false }),
      );
      hitBox.position.copy(child.position);
      plantObject.add(hitBox);
      entryHitBoxes.push(hitBox);
    });

    this.plants.push({ plantObject, hitBoxes: entryHitBoxes, x, y, z });

    gsap.to(plantObject.scale, {
      x: 8,
      y: 8,
      z: 8,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  sellPlant(clickedHitBox: Mesh): { x: number; y: number; z: number } | null {
    const entry = this.plants.find((p) => p.hitBoxes.includes(clickedHitBox));
    if (!entry) return null;

    this.scene.remove(entry.plantObject);
    this.plants = this.plants.filter((p) => p !== entry);

    return { x: entry.x, y: entry.y, z: entry.z };
  }

  getHitBoxes(): Mesh[] {
    return this.plants.flatMap((p) => p.hitBoxes);
  }
}
