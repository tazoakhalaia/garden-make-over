import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Scene } from "three";
import { config, type LoadModels } from "../config";

export class Placeholder {
  private placeholderCords = config.placeholderCords;
  private storePlaceholders: Object3D[] = [];
  private scene!: Scene;

  createPlaceholder(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    const originalModel = loadModel.getModel("farmObjects").scene.children[0];

    for (let i = 0; i < this.placeholderCords.length; i++) {
      const placeholder = new BoxGeometry(80, 40, 10);
      const placeholderColor = new MeshBasicMaterial({
        color: "green",
        transparent: true,
        opacity: 0,
      });
      const placeholderMesh = new Mesh(placeholder, placeholderColor);
      placeholderMesh.rotation.x = Math.PI / 2;
      placeholderMesh.name = `placeholder_${i}`;
      placeholderMesh.position.set(
        this.placeholderCords[i].x,
        this.placeholderCords[i].y,
        this.placeholderCords[i].z,
      );

      const placeholderModel = originalModel.clone();
      placeholderModel.rotation.y = Math.PI / 2;
      placeholderModel.position.set(
        this.placeholderCords[i].x,
        30,
        this.placeholderCords[i].z,
      );
      placeholderModel.scale.set(5, 5, 5);

      this.storePlaceholders.push(placeholderMesh);
      scene.add(placeholderMesh, placeholderModel);
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
