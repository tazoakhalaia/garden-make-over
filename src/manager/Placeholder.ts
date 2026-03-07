import type { Object3D, Scene } from "three";
import { LoadModels } from "../SceneManager";
import { PlaceHolderCords } from "../constants";

export class PlaceHolder {
  private loader = new LoadModels();
  private storePlaceHolder: Object3D[] = [];

  async createPlaceholder(scene: Scene) {
    for (let i = 0; i < PlaceHolderCords.length; i++) {
      const model = await this.loader.load("public/models/objects.glb");
      const placeholder = model.children[0];
      placeholder.scale.set(0.8, 0.8, 0.8);
      placeholder.rotation.y = Math.PI / 2;
      placeholder.position.set(
        PlaceHolderCords[i].x,
        PlaceHolderCords[i].y,
        PlaceHolderCords[i].z,
      );
      this.storePlaceHolder.push(placeholder);
      scene.add(placeholder);
    }
  }

  removePlaceholder(scene: Scene, object: Object3D) {
    let target = object;
    while (target.parent && target.parent !== scene) {
      target = target.parent;
    }

    scene.remove(target);
    this.storePlaceHolder = this.storePlaceHolder.filter((p) => p !== target);
  }
}
