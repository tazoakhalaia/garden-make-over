import { Scene, Vector3 } from "three";
import { spawnObject } from "../functions";

export class PlantManager {
  private occupiedPositions = new Set<string>();

  private positionKey(x: number, z: number): string {
    return `${Math.round(x)},${Math.round(z)}`;
  }

  plant(scene: Scene, position: Vector3, cropName: string) {
    const key = this.positionKey(position.x, position.z);
    if (this.occupiedPositions.has(key)) return;
    this.occupiedPositions.add(key);

    const stages = [`${cropName}_1`, `${cropName}_2`, `${cropName}_3`];

    stages.forEach((stage, i) => {
      setTimeout(() => {
        if (i > 0) this.removeByPosition(scene, position, stages[i - 1]);
        spawnObject(scene, position.x, position.y, position.z, stage);

        if (i === stages.length - 1) {
          setTimeout(() => {
            this.removeByPosition(scene, position, stage);
            this.occupiedPositions.delete(key);
          }, 2000);
        }
      }, i * 2000);
    });
  }

  private removeByPosition(scene: Scene, position: Vector3, name: string) {
    const obj = scene.children.find(
      (child) =>
        child.name === name &&
        Math.abs(child.position.x - position.x) < 0.1 &&
        Math.abs(child.position.z - position.z) < 0.1,
    );
    if (obj) scene.remove(obj);
  }
}