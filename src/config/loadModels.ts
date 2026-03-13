import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { config } from "../config";

export class LoadModels {
  private loader = new GLTFLoader();
  private models: Map<string, GLTF> = new Map();

  async loadAll(): Promise<void> {
    const entries = Object.entries(config.threeModels) as [string, string][];
    await Promise.all(entries.map(([key, path]) => this.loadModel(key, path)));
  }

  private loadModel(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.models.set(key, gltf);
          resolve();
        },
        undefined,
        (error) => reject(new Error(`Failed to load "${key}": ${error}`)),
      );
    });
  }

  getModel(key: keyof typeof config.threeModels): GLTF {
    const model = this.models.get(key);
    if (!model) throw new Error(`Model "${key}" not found`);
    return model;
  }
}
