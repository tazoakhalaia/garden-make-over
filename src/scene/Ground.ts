import {
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene
} from "three";

export class Ground {
  init(scene: Scene) {
    this.createPlane(scene);
  }

  createPlane(scene: Scene) {
    const plane = new PlaneGeometry(20, 20);
    const planeColor = new MeshStandardMaterial({ color: "green" });
    const planeMesh = new Mesh(plane, planeColor);
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add(planeMesh);
  }
}
