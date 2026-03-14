import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Scene } from "three";
import { config, type LoadModels } from "../config";

export class Placeholder {
  private placeholderCords = config.placeholderCords;
  private storePlaceholders: Object3D[] = [];
  private scene!: Scene;

  createPlaceholder(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    for (let i = 0; i < this.placeholderCords.length; i++) {
      const placeholder = new BoxGeometry(80, 40, 10);
      const placeholderColor = new MeshBasicMaterial({ color: "red" });
      const placeholderMesh = new Mesh(placeholder, placeholderColor);
      placeholderMesh.rotation.x = Math.PI / 2;
      placeholderMesh.name = `placeholder_${i}`;
      placeholderMesh.position.set(
        this.placeholderCords[i].x,
        this.placeholderCords[i].y,
        this.placeholderCords[i].z,
      );
      this.storePlaceholders.push(placeholderMesh);
      scene.add(placeholderMesh);
    }
  }

  removePlaceholder(mesh: Object3D) {
    this.scene.remove(mesh);
    this.storePlaceholders = this.storePlaceholders.filter((p) => p !== mesh);
    const asMesh = mesh as Mesh;
    asMesh.geometry.dispose();
    (asMesh.material as MeshBasicMaterial).dispose();
  }

  getPlaceholders() {
    return this.storePlaceholders;
  }
}
