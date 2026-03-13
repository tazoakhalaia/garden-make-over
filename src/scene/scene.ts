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
  public _renderer!: WebGLRenderer;

  initThree(canvas: HTMLCanvasElement) {
    this._scene = new Scene();
    this._perspectiveCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );
    this._perspectiveCamera.position.set(0, 5, 15);
    this._perspectiveCamera.lookAt(0, 0, 0);

    this._renderer = new WebGLRenderer({ canvas, antialias: true });
    this._renderer.setClearColor("cyan");
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this.initLights();
    this.ground.init(this._scene);
    this.animate();
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    const windowWidth = window.innerWidth;
    const windoHeight = window.innerHeight;
    this._perspectiveCamera.updateProjectionMatrix();
    this._renderer.setSize(windowWidth, windoHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
  }

  private initLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.5);

    const directionalLight = new DirectionalLight("0xffffff", 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    this._scene.add(ambientLight, directionalLight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this._renderer.render(this._scene, this._perspectiveCamera);
  };
}
