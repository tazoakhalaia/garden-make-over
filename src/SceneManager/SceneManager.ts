import { Application, Container } from "pixi.js";
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { spawnObject } from "../functions";
import { PlantManager, RaycastManager } from "../Manager";
import { DayNightToggle } from "../Manager/DayNightTogglerManager";
import { LightsManager } from "../Manager/LightManger";
import { PlaceHolder } from "../Manager/Placeholder";
import { CoinUI } from "../ui/CoinUi";
import { CROP_CONFIG, CropSelector } from "../ui/CropSelector";
import { Ground } from "./Ground";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private app?: Application;
  private stage!: Container;
  private orbitControl?: OrbitControls;

  private ground = new Ground();
  private placeHolder = new PlaceHolder();
  private plantManager = new PlantManager();
  private raycast = new RaycastManager();
  private cropSelector!: CropSelector;
  private coinUI = new CoinUI();
  private dayNightToggle = new DayNightToggle();
  private ligthsManger = new LightsManager();

  private threeCanvas: HTMLCanvasElement;
  private pixiCanvas: HTMLCanvasElement;

  private pendingPosition: Vector3 | null = null;
  private pendingHit: any | null = null;
  private isDay = true;

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
    this.ground.createGround(this.scene);
    this.placeHolder.createPlaceholder(this.scene);
    this.setupOrbitControls();
    this.init();
    this.ligthsManger.createLights(this.scene, this.renderer);
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

    this.dayNightToggle.create(this.stage, (isDay) => {
      this.isDay = isDay;
      if (isDay) {
        this.renderer.setClearColor("#87ceeb");
        this.ligthsManger.setDay();
      } else {
        this.renderer.setClearColor("#0a0a2e");
        this.ligthsManger.setNight();
      }
    });

    const ANIMALS = ["chicken", "sheep", "cow"];

    this.cropSelector = new CropSelector((crop) => {
      if (!this.pendingPosition) return;

      const config = CROP_CONFIG[crop];
      if (!this.coinUI.spend(config.price)) return;

      const isAnimal = ANIMALS.includes(crop);

      if (crop === "ground") {
        if (this.pendingHit?.name === "placeholder") {
          this.placeHolder.removePlaceholder(this.scene, this.pendingHit);
        }
        spawnObject(
          this.scene,
          this.pendingPosition.x,
          0,
          this.pendingPosition.z,
          "ground",
        );
      } else if (isAnimal) {
        if (this.pendingHit?.name === "placeholder") {
          this.placeHolder.removePlaceholder(this.scene, this.pendingHit);
        }
        this.plantManager.plant(
          this.scene,
          new Vector3(this.pendingPosition.x, 0, this.pendingPosition.z),
          crop,
          this.stage,
          this.camera,
          this.threeCanvas,
          this.coinUI,
          config.reward,
        );
      } else {
        this.plantManager.plant(
          this.scene,
          new Vector3(this.pendingPosition.x, 0, this.pendingPosition.z),
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
      this.cropSelector.show(this.stage, x, y, this.coinUI.total, [
        "animal",
        "ground",
      ]);
    } else if (hit.name.startsWith("ground")) {
      const position = hit.getWorldPosition(new Vector3());
      this.pendingPosition = position;
      this.pendingHit = null;
      this.cropSelector.show(this.stage, x, y, this.coinUI.total, ["plant"]);
    }
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    this.orbitControl?.update();
    this.app?.renderer.render({ container: this.stage, clear: false });
  };
}
