import { Mesh, MeshStandardMaterial, PlaneGeometry, Scene } from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import type { LoadModels } from "../config";

export class Ground {
  init(scene: Scene, loadModels: LoadModels) {
    this.createPlane(scene, loadModels);
  }

  // createPlane(scene: Scene, loadModels: LoadModels) {
  //   const ground = loadModels.getModel("ground").scene;
  //   ground.position.set(0, 0, 0);
  //   ground.scale.set(8, 4, 6);
  //   ground.traverse((e) => {
  //     e.name = "ground";
  //   });
  //   scene.add(ground);
  // }

  createPlane(scene: Scene, loadModels: LoadModels) {
    const plane = new PlaneGeometry(40, 40);
    const color = new MeshStandardMaterial({ color: "green" });
    const planeMesh = new Mesh(plane, color);
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add(planeMesh);
  }
}
