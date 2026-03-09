import gsap from "gsap";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  type Scene,
} from "three";
import { PlaceHolderCords } from "../constants";
import { LoadModels } from "../scene";

interface PlaceholderPair {
  model: Object3D;
  hitBox: Mesh;
}

export class PlaceHolder {
  private loader = new LoadModels();
  private pairs: PlaceholderPair[] = [];

  async createPlaceholder(scene: Scene) {
    for (let i = 0; i < PlaceHolderCords.length; i++) {
      await this.spawnOne(
        scene,
        PlaceHolderCords[i].x,
        PlaceHolderCords[i].y,
        PlaceHolderCords[i].z,
      );
    }
  }

  async restorePlaceholder(scene: Scene, x: number, z: number) {
    const original = PlaceHolderCords.find(
      (c) => Math.abs(c.x - x) < 0.1 && Math.abs(c.z - z) < 0.1,
    );
    const y = original?.y ?? 0;
    await this.spawnOne(scene, x, y, z);
  }

  private async spawnOne(scene: Scene, x: number, y: number, z: number) {
    const model = await this.loader.load("/models/objects.glb");
    const placeholder = model.children[0];
    placeholder.name = "placeholder";
    placeholder.scale.set(0, 0, 0);
    placeholder.rotation.y = Math.PI / 2;
    placeholder.position.set(x, y, z);
    scene.add(placeholder);

    gsap.to(placeholder.scale, {
      x: 0.8,
      y: 0.8,
      z: 0.8,
      duration: 0.5,
      ease: "back.out(1.7)",
    });

    const hitBox = new Mesh(
      new BoxGeometry(0.8, 0.8, 0.8),
      new MeshBasicMaterial({ visible: false }),
    );
    hitBox.name = "placeholder";
    hitBox.position.set(x, y, z);
    hitBox.userData.isPlaceholder = true;
    scene.add(hitBox);

    this.pairs.push({ model: placeholder, hitBox });
  }

  removePlaceholder(scene: Scene, object: Object3D) {
    let target = object;
    while (target.parent && target.parent !== scene) {
      target = target.parent;
    }

    const pairIndex = this.pairs.findIndex(
      (p) => p.model === target || p.hitBox === target,
    );

    if (pairIndex !== -1) {
      const pair = this.pairs[pairIndex];
      scene.remove(pair.model);
      scene.remove(pair.hitBox);
      this.pairs.splice(pairIndex, 1);
    } else {
      scene.remove(target);
    }
  }
}
