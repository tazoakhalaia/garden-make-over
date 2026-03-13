import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { LoadModels } from "../config";
import { Ground } from "./ground";

export class ThreeScene {
  private ground = new Ground();
  private loadAllModels = new LoadModels();

  public scene!: Scene;
  private perspectiveCamera!: PerspectiveCamera;
  public renderer!: WebGLRenderer;

  async initThree(canvas: HTMLCanvasElement): Promise<void> {
    this.scene = new Scene();
    this.perspectiveCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );
    this.perspectiveCamera.position.set(0, 20, 25);
    this.perspectiveCamera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor("cyan");
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    await this.loadAllModels.loadAll();

    this.initLights();
    this.animate();
    this.onResize();
    window.addEventListener("resize", () => this.onResize());

    const groundModel = this.loadAllModels.getModel("ground");
    this.ground.init(this.scene, groundModel);
  }

  onResize() {
    const windowWidth = window.innerWidth;
    const windoHeight = window.innerHeight;
    this.perspectiveCamera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windoHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private initLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.5);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    this.scene.add(ambientLight, directionalLight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.perspectiveCamera);
  };
}
