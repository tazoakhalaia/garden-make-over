import type { Scene } from "three";
import { LoadModels } from "../config";

export class StaticModels {
  private loader = new LoadModels();

  init(scene: Scene, loadModel: LoadModels) {}
}
