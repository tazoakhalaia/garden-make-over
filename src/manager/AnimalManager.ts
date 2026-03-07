import { Scene, Vector3 } from "three";
import { spawnObject } from "../functions";
import type { CoinUI } from "../ui/CoinUi";

export class AnimalManager {
  spawn(
    scene: Scene,
    position: Vector3,
    animalName: string,
    coinUI: CoinUI,
    reward: number,
  ) {
    spawnObject(scene, position.x, 0, position.z, `${animalName}_1`);
    this.startProducing(coinUI, reward);
  }

  private startProducing(coinUI: CoinUI, reward: number) {
    setTimeout(() => {
      coinUI.add(reward);
      this.startProducing(coinUI, reward);
    }, 5000);
  }
}