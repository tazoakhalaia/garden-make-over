import type { Scene } from "three";
import { AnimationMixer, Clock } from "three";
import type { LoadModels } from "../config";

export class Farmer {
  private mixer: AnimationMixer | null = null;
  private clock = new Clock();
  private isWalk = false;

  init(scene: Scene, loader: LoadModels) {
    this.createFarmer(scene, loader);
  }

  createFarmer(scene: Scene, loader: LoadModels) {
    const farmerGLTF = loader.getModel("farmer");
    const farmer = farmerGLTF.scene;

    farmer.scale.set(0.02, 0.02, 0.02);
    farmer.position.set(0, 30, 0);
    scene.add(farmer);

    if (farmerGLTF.animations.length > 0) {
      this.mixer = new AnimationMixer(farmer);
      const action = this.mixer.clipAction(farmerGLTF.animations[0]);
      action.play();
    }
  }

  update() {
    if (this.mixer && this.isWalk) {
      this.mixer.update(this.clock.getDelta());
    }
  }
}
