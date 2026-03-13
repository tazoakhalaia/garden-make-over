import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { Ground } from "./ground";

export class ThreeScene {
  private ground = new Ground();

  public _scene!: Scene;
  private _perspectiveCamera!: PerspectiveCamera;
  public renderer!: WebGLRenderer;

  initThree(canvas: HTMLCanvasElement) {
    this._scene = new Scene();
    this._perspectiveCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );
    this._perspectiveCamera.position.set(0, 0, 30);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.initLights();
    this.ground.init(this._scene);
    this.animate();
  }

  private initLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.5);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    this._scene.add(ambientLight, directionalLight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this._scene, this._perspectiveCamera);
  };
}
