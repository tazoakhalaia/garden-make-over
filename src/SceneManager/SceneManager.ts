import { Application, Container } from "pixi.js";
import {
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { Ground } from "./Ground";
import { Lights } from "./Lights";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private app?: Application;
  private stage!: Container;

  private ground = new Ground();
  private lights = new Lights();

  private threeCanvas: HTMLCanvasElement;
  private pixiCanvas: HTMLCanvasElement;

  constructor(container: HTMLCanvasElement, pixiCanvas: HTMLCanvasElement) {
    this.threeCanvas = container;
    this.pixiCanvas = pixiCanvas;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 25, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.threeCanvas,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.lights.createLights(this.scene);
    this.ground.createGround(this.scene);
    this.init();
  }

  async init() {
    this.app = new Application();

    await this.app.init({
      canvas: this.pixiCanvas,
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
    });

    this.stage = this.app.stage;
    this.stage.eventMode = "passive";
    this.stage.interactiveChildren = true;

    this.pixiCanvas.addEventListener("pointerdown", (e) => {
      this.handlePointerDown(e);
    });

    this.render();
  }

  private isPixiObjectAt(x: number, y: number): boolean {
    const hits = this.app!.renderer.events.rootBoundary.hitTest(x, y);
    return hits !== null && hits !== this.stage;
  }

  private handlePointerDown(e: PointerEvent) {
    const x = e.clientX;
    const y = e.clientY;

    if (this.isPixiObjectAt(x, y)) {
      return;
    }

    this.raycastGround(x, y);
  }

  private raycastGround(clientX: number, clientY: number) {
    if (this.ground.meshes.length === 0) return;

    const rect = this.threeCanvas.getBoundingClientRect();
    const mouse = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.ground.meshes);
    if (intersects.length > 0) {
      console.log("ground hit at", intersects[0].point);
    }
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    if (this.app) {
      this.app.renderer.render({
        container: this.stage,
        clear: false,
      });
    }
  };
}
