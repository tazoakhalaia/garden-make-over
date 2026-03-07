import { Application, Container } from "pixi.js";
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { Ground } from "./Ground";
import { Lights } from "./Lights";
import { PlaceHolder } from "../manager/Placeholder";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { PlantManager, RaycastManager } from "../manager";
import { CROP_CONFIG, CropSelector } from "../ui/CropSelector";
import { spawnObject } from "../functions";
import { CoinUI } from "../ui/CoinUi";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private app?: Application;
  private stage!: Container;
  private orbitControl?: OrbitControls;

  private ground = new Ground();
  private lights = new Lights();
  private placeHolder = new PlaceHolder();
  private plantManager = new PlantManager();
  private raycast = new RaycastManager();
  private cropSelector!: CropSelector;
  private coinUI = new CoinUI();

  private threeCanvas: HTMLCanvasElement;
  private pixiCanvas: HTMLCanvasElement;

  private pendingPosition: Vector3 | null = null;
  private pendingHit: any | null = null;

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
    this.placeHolder.createPlaceholder(this.scene);
    this.setupOrbitControls();
    this.init();
  }

  private setupOrbitControls() {
    this.orbitControl = new OrbitControls(this.camera, this.pixiCanvas);
    this.orbitControl.enableZoom = true;
    this.orbitControl.minDistance = 10;
    this.orbitControl.maxDistance = 100;
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

    this.coinUI.create(this.stage);

    const ANIMALS = ["chicken", "sheep", "cow"];

    this.cropSelector = new CropSelector((crop) => {
      if (!this.pendingPosition) return;

      const config = CROP_CONFIG[crop];
      if (!this.coinUI.spend(config.price)) {
        return;
      }

      const isAnimal = ANIMALS.includes(crop);
      if (isAnimal) {
        if (this.pendingHit?.name === "placeholder") {
          this.placeHolder.removePlaceholder(this.scene, this.pendingHit);
        }
        this.plantManager.plant(
          this.scene,
          this.pendingPosition,
          crop,
          this.stage,
          this.camera,
          this.threeCanvas,
          this.coinUI,
          config.reward,
        );
      } else {
        if (this.pendingHit?.name === "placeholder") {
          this.placeHolder.removePlaceholder(this.scene, this.pendingHit);
          spawnObject(
            this.scene,
            this.pendingPosition.x,
            this.pendingPosition.y,
            this.pendingPosition.z,
            "ground",
          );
        }
        this.plantManager.plant(
          this.scene,
          this.pendingPosition,
          crop,
          this.stage,
          this.camera,
          this.threeCanvas,
          this.coinUI,
          config.reward,
        );
      }

      this.pendingPosition = null;
      this.pendingHit = null;
    });

    this.pixiCanvas.addEventListener("click", (e) => this.handleClick(e));
    this.render();
  }
  private isPixiObjectAt(x: number, y: number): boolean {
    const hits = this.app!.renderer.events.rootBoundary.hitTest(x, y);
    return hits !== null && hits !== this.stage;
  }

  private handleClick(e: PointerEvent) {
    const { clientX: x, clientY: y } = e;
    if (this.isPixiObjectAt(x, y)) return;

    const hit = this.raycast.clickWithPriority(
      x,
      y,
      this.threeCanvas,
      this.camera,
      this.scene.children,
      "placeholder",
    );
    if (!hit) return;

    if (hit.name === "placeholder") {
      const position = hit.getWorldPosition(new Vector3());
      this.pendingPosition = position;
      this.pendingHit = hit;

      this.cropSelector.show(this.stage, x, y, this.coinUI.total);
    } else if (hit.name.startsWith("ground")) {
      const position = hit.getWorldPosition(new Vector3());
      this.pendingPosition = position;
      this.cropSelector.show(this.stage, x, y, this.coinUI.total);
    }
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    this.orbitControl?.update();
    this.app?.renderer.render({ container: this.stage, clear: false });
  };
}
