import { Scene, Vector3 } from "three";
import { spawnObject } from "../functions";

export class AnimalManager {
  spawn(scene: Scene, position: Vector3, animalName: string) {
    spawnObject(scene, position.x, 0, position.z, `${animalName}_1`);
  }
}
