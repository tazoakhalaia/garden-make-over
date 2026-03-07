import { Container } from "pixi.js";
import { Camera, Scene, Vector3 } from "three";
import { spawnPlant } from "../functions";
import type { CoinUI } from "../ui/CoinUi";
import { FloatingCoin } from "../ui/FloatingCoin";

export class PlantManager {
  private occupiedPositions = new Set<string>();

  private positionKey(x: number, z: number): string {
    return `${Math.round(x)},${Math.round(z)}`;
  }

  plant(
    scene: Scene,
    position: Vector3,
    cropName: string,
    stage: Container,
    camera: Camera,
    canvas: HTMLCanvasElement,
    coinUI: CoinUI,
    reward: number,
  ) {
    const key = this.positionKey(position.x, position.z);
    if (this.occupiedPositions.has(key)) return;
    this.occupiedPositions.add(key);

    const stages = [`${cropName}_1`, `${cropName}_2`, `${cropName}_3`];

    stages.forEach((stageName, i) => {
      setTimeout(() => {
        if (i > 0) this.removeByPosition(scene, position, stages[i - 1]);
        spawnPlant(scene, position.x, position.y, position.z, stageName);

        if (i === stages.length - 1) {
          const coin = new FloatingCoin();
          coin.spawn(stage, position, camera, canvas, () => {
            this.removeByPosition(scene, position, stageName);
            this.occupiedPositions.delete(key);
            coinUI.add(reward);
          });
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
