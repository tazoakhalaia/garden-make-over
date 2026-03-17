import {
  DirectionalLight,
  HemisphereLight,
  PointLight,
  type Scene,
} from "three";

export class Lights {
  public hemi!: HemisphereLight;
  public sun!: DirectionalLight;
  public fill!: DirectionalLight;
  public accent!: PointLight;

  sceneLights(scene: Scene) {
    this.hemi = new HemisphereLight(0xfff4e0, 0x88aa55, 1.2);
    scene.add(this.hemi);

    this.sun = new DirectionalLight(0xfff1c1, 3.5);
    this.sun.position.set(60, 120, 40);
    this.sun.castShadow = true;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 500;
    this.sun.shadow.camera.left = -150;
    this.sun.shadow.camera.right = 150;
    this.sun.shadow.camera.top = 150;
    this.sun.shadow.camera.bottom = -150;
    this.sun.shadow.mapSize.width = 4096;
    this.sun.shadow.mapSize.height = 4096;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.02;
    scene.add(this.sun);
    scene.add(this.sun.target);

    this.fill = new DirectionalLight(0xc8d8ff, 0.6);
    this.fill.position.set(-40, 60, -30);
    this.fill.castShadow = false;
    scene.add(this.fill);

    this.accent = new PointLight(0xffd580, 2.5, 80, 1.5);
    this.accent.position.set(0, 20, 10);
    this.accent.castShadow = true;
    this.accent.shadow.mapSize.width = 1024;
    this.accent.shadow.mapSize.height = 1024;
    this.accent.shadow.bias = -0.001;
    scene.add(this.accent);
  }
}
