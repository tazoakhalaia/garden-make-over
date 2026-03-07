import gsap from "gsap";
import { AmbientLight, DirectionalLight, Scene, WebGLRenderer } from "three";

export class LightsManager {
  private ambientLight!: AmbientLight;
  private directionalLight!: DirectionalLight;

  createLights(scene: Scene, renderer: WebGLRenderer) {
    this.ambientLight = new AmbientLight(0xffffff, 0.8);

    this.directionalLight = new DirectionalLight(0xffffff, 2);
    this.directionalLight.position.set(0, 20, 10);
    renderer.shadowMap.enabled = true;

    scene.add(this.ambientLight, this.directionalLight);
  }

  setDay() {
    gsap.to(this.ambientLight, { intensity: 0.8, duration: 1 });
    gsap.to(this.directionalLight, { intensity: 1.2, duration: 1 });
    gsap.to(this.ambientLight.color, { r: 1, g: 1, b: 1, duration: 1 });
    gsap.to(this.directionalLight.color, { r: 1, g: 1, b: 1, duration: 1 });
  }

  setNight() {
    gsap.to(this.ambientLight, { intensity: 0.7, duration: 1 });
    gsap.to(this.directionalLight, { intensity: 0.2, duration: 1 });
    gsap.to(this.ambientLight.color, { r: 0.7, g: 0.7, b: 0.2, duration: 1 });
    gsap.to(this.directionalLight.color, {
      r: 0.2,
      g: 0.2,
      b: 0.5,
      duration: 1,
    });
  }
}
