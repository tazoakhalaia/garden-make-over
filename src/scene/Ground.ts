import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";

export class Ground {
  init(scene: Scene) {
    const box = new BoxGeometry(20, 20);
    const boxColor = new MeshStandardMaterial({ color: "red" });
    const mesh = new Mesh(box, boxColor);
    scene.add(mesh);
  }
}
