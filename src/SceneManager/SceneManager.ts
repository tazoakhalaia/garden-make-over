import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Ground } from "./Ground";
import { Lights } from "./Lights";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private container: HTMLElement;

  private ground = new Ground();
  private lights = new Lights();

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(5, 8, 8);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#87ceeb");
    this.container.appendChild(this.renderer.domElement);

    this.lights.createLights(this.scene);
    this.ground.createGround(this.scene);
    this.resize();
    window.addEventListener("resize", this.resize);
    this.animate();
  }

  private resize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
