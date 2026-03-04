import { AmbientLight, DirectionalLight, type Scene } from "three";

export class Lights {
  createLights(scene: Scene) {
    const ambient = new AmbientLight(0xffffff, 0.6);

    const dir = new DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    scene.add(dir, ambient);
  }
}
