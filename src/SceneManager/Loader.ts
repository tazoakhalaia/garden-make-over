import type { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class LoadModels {
  private gltfLoader = new GLTFLoader();

  load(modelPath: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        modelPath,
        (gltf) => resolve(gltf.scene),
        undefined,
        (error) => reject(error),
      );
    });
  }
}
