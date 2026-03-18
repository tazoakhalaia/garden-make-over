import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene,
} from "three";
import { config, type LoadModels } from "../config";

export class Placeholder {
  private placeholderCords = config.placeholderCords;
  private storePlaceholders: Object3D[] = [];
  private scene!: Scene;

  createPlaceholder(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    const originalModel = loadModel.getModel("farmObjects").scene.children[0];

    for (let i = 0; i < this.placeholderCords.length; i++) {
      const placeholderGroup = new Group();

      const placeholder = new BoxGeometry(80, 40, 10);
      const placeholderColor = new MeshBasicMaterial({
        color: "green",
        transparent: true,
        opacity: 0,
      });
      const placeholderMesh = new Mesh(placeholder, placeholderColor);
      placeholderMesh.rotation.x = Math.PI / 2;
      placeholderMesh.name = `placeholder_${i}`;

      const placeholderModel = originalModel.clone();
      placeholderModel.rotation.y = Math.PI / 2;
      placeholderModel.scale.set(6, 6, 7);
      placeholderModel.position.set(0, 5, 0);

      placeholderGroup.position.set(
        this.placeholderCords[i].x,
        this.placeholderCords[i].y,
        this.placeholderCords[i].z,
      );

      placeholderGroup.add(placeholderMesh, placeholderModel);
      this.storePlaceholders.push(placeholderGroup);
      scene.add(placeholderGroup);
    }
  }

  removePlaceholderAt(x: number, y: number, z: number) {
    const placeholderGroup = this.storePlaceholders.find(
      (g) => Math.abs(g.position.x - x) < 5 && Math.abs(g.position.z - z) < 5,
    );
    if (!placeholderGroup) return;
    this.scene.remove(placeholderGroup);
    this.storePlaceholders = this.storePlaceholders.filter(
      (g) => g !== placeholderGroup,
    );
  }

  restorePlaceholder(x: number, y: number, z: number, loadModel: LoadModels) {
    const originalModel = loadModel.getModel("farmObjects").scene.children[0];

    const placeholderGroup = new Group();

    const placeholder = new BoxGeometry(80, 40, 10);
    const placeholderColor = new MeshBasicMaterial({
      color: "green",
      transparent: true,
      opacity: 0,
    });

    const placeholderMesh = new Mesh(placeholder, placeholderColor);
    placeholderMesh.rotation.x = Math.PI / 2;
    placeholderMesh.name = `placeholder_restored`;

    const placeholderModel = originalModel.clone();
    placeholderModel.rotation.y = Math.PI / 2;
    placeholderModel.scale.set(6, 6, 7);
    placeholderModel.position.set(0, 5, 0);

    placeholderGroup.position.set(x, y, z);
    placeholderGroup.add(placeholderMesh, placeholderModel);
    this.storePlaceholders.push(placeholderGroup);
    this.scene.add(placeholderGroup);
  }

  getPlaceholders(): Object3D[] {
    return this.storePlaceholders.flatMap((g) => {
      const allModel: Object3D[] = [];
      g.traverse((child) => allModel.push(child));
      return allModel;
    });
  }
}
