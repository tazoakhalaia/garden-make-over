import gsap from "gsap";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  type Scene,
} from "three";
import type { LoadModels } from "../config";

interface FenceEntry {
  fence: Object3D;
  hitBox: Mesh;
  x: number;
  y: number;
  z: number;
}

export class AnimalFence {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private fences: FenceEntry[] = [];

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

    this.fences.push({ fence: fenceObject, hitBox, x, y, z });

    gsap.to(fenceObject.scale, {
      x: 6,
      y: 6,
      z: 6,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  sellFence(clickedHitBox: Mesh, spawnedAnimals: Object3D[]) {
    const entry = this.fences.find((f) => f.hitBox === clickedHitBox);
    if (!entry) return;

    const rangeX = 30;
    const rangeZ = 20;
    spawnedAnimals.forEach((animal) => {
      const dx = Math.abs(animal.position.x - entry.x);
      const dz = Math.abs(animal.position.z - entry.z);
      if (dx <= rangeX && dz <= rangeZ) {
        this.scene.remove(animal);
      }
    });

    this.scene.remove(entry.fence);
    this.scene.remove(entry.hitBox);
    this.fences = this.fences.filter((f) => f.hitBox !== clickedHitBox);
  }

  getHitBoxes() {
    return this.fences.map((f) => f.hitBox);
  }
}
