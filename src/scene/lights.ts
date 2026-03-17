import {
    DirectionalLight,
    HemisphereLight,
    PointLight,
    type Scene,
} from "three";

export class Lights {
  sceneLights(scene: Scene) {
    const hemiLight = new HemisphereLight(0xfff4e0, 0x88aa55, 1.2);
    scene.add(hemiLight);

    const sun = new DirectionalLight(0xfff1c1, 3.5);
    sun.position.set(60, 120, 40);
    sun.castShadow = true;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;

    sun.shadow.mapSize.width = 4096;
    sun.shadow.mapSize.height = 4096;

    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;

    scene.add(sun);
    scene.add(sun.target);

    const fillLight = new DirectionalLight(0xc8d8ff, 0.6);
    fillLight.position.set(-40, 60, -30);
    fillLight.castShadow = false;
    scene.add(fillLight);

    const warmAccent = new PointLight(0xffd580, 2.5, 80, 1.5);
    warmAccent.position.set(0, 20, 10);
    warmAccent.castShadow = true;
    warmAccent.shadow.mapSize.width = 1024;
    warmAccent.shadow.mapSize.height = 1024;
    warmAccent.shadow.bias = -0.001;
    scene.add(warmAccent);
  }
}
