import gsap from "gsap";
import { Application, Container } from "pixi.js";
import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { AssetLoader } from "../core";
import { spawnAnimal, spawnPlant } from "../functions";
import { PlantManager, RaycastManager, Tutorial } from "../Manager";
import { DayNightToggle } from "../Manager/DayNightTogglerManager";
import { LightsManager } from "../Manager/LightManger";
import { PlaceHolder } from "../Manager/Placeholder";
import { CoinUI } from "../ui/CoinUi";
import { CROP_CONFIG, CropSelector } from "../ui/CropSelector";
import { Ground } from "./Ground";

const ANIMAL_CROPS = ["chicken", "sheep", "cow"];
const STEP_CLICK_PLACEHOLDER = 0;
const STEP_CLICK_CORN = 1;

const DEFAULT_CAM = { x: 0, y: 22, z: 15 };
const DEFAULT_LOOKAT = { x: 0, y: 0, z: 0 };

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
  private animalSelector!: CropSelector;
  private coinUI = new CoinUI();
  private dayNightToggle = new DayNightToggle();
  private ligthsManger = new LightsManager();
  private tutorial = new Tutorial();

  private threeCanvas: HTMLCanvasElement;
  private pixiCanvas: HTMLCanvasElement;

  private pendingPosition: Vector3 | null = null;
  private pendingHit: any | null = null;
  private isDay = true;
  private isSelectorOpen = false;
  private selectorJustClosed = false;
  private isAnimalSelectorOpen = false;
  private animalSelectorJustClosed = false;
  private tutorialStep = STEP_CLICK_PLACEHOLDER;
  private tutorialActive = true;

  private lookAt = new Vector3(
    DEFAULT_LOOKAT.x,
    DEFAULT_LOOKAT.y,
    DEFAULT_LOOKAT.z,
  );

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
    this.camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);
    this.camera.lookAt(DEFAULT_LOOKAT.x, DEFAULT_LOOKAT.y, DEFAULT_LOOKAT.z);

    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: this.threeCanvas,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.ground.createGround(this.scene);
    this.placeHolder.createPlaceholder(this.scene);
    this.ligthsManger.createLights(this.scene, this.renderer);

    this.init();
  }

  private spawnFenceTrigger(x: number, z: number) {
    const plane = new Mesh(
      new PlaneGeometry(14, 14),
      new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    plane.name = "fence_trigger";
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, 0.1, z);
    this.scene.add(plane);
  }

  private setupOrbitControls() {
    this.orbitControl = new OrbitControls(this.camera, this.pixiCanvas);
    this.orbitControl.enableZoom = true;
    this.orbitControl.enableRotate = false;
    this.orbitControl.enablePan = false;
    this.orbitControl.minDistance = 10;
    this.orbitControl.maxDistance = 30;
  }

  private zoomTo(worldPos: Vector3) {
    if (this.orbitControl) this.orbitControl.enabled = false;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.camera.position, {
      x: worldPos.x,
      y: 12,
      z: worldPos.z + 8,
      duration: 0.6,
      ease: "power2.inOut",
    });
    gsap.to(this.lookAt, {
      x: worldPos.x,
      y: 0,
      z: worldPos.z,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => {
        this.orbitControl?.target.set(
          this.lookAt.x,
          this.lookAt.y,
          this.lookAt.z,
        );
      },
    });
  }

  private zoomOut() {
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.camera.position, {
      x: DEFAULT_CAM.x,
      y: DEFAULT_CAM.y,
      z: DEFAULT_CAM.z,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        if (this.orbitControl) this.orbitControl.enabled = true;
      },
    });
    gsap.to(this.lookAt, {
      x: DEFAULT_LOOKAT.x,
      y: DEFAULT_LOOKAT.y,
      z: DEFAULT_LOOKAT.z,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => {
        this.orbitControl?.target.set(
          this.lookAt.x,
          this.lookAt.y,
          this.lookAt.z,
        );
      },
    });
  }

  private toScreen(worldPos: Vector3): { x: number; y: number } {
    const vec = worldPos.clone().project(this.camera);
    return {
      x: ((vec.x + 1) / 2) * window.innerWidth,
      y: ((-vec.y + 1) / 2) * window.innerHeight,
    };
  }

  private startTutorial() {
    const firstPlaceholder = this.scene.children.find(
      (c) => c.name === "placeholder",
    );
    if (!firstPlaceholder) return;

    const worldPos = new Vector3();
    firstPlaceholder.getWorldPosition(worldPos);
    const screen = this.toScreen(worldPos);

    this.tutorial.start(
      this.stage,
      [
        {
          message: "👋 Tap the placeholder to open the market!",
          targetX: screen.x,
          targetY: screen.y,
        },
      ],
      () => {
        this.tutorialActive = false;
      },
    );
  }

  private advanceTutorialToCorn() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.tutorial.start(
      this.stage,
      [
        {
          message: "🌽 Now tap Corn to plant your first crop!",
          targetX: W / 2,
          targetY: H / 2 + 44,
        },
      ],
      () => {
        this.tutorialActive = false;
      },
    );
    this.tutorialStep = STEP_CLICK_CORN;
  }

  private showLoadingScreen(): HTMLDivElement {
    const overlay = document.createElement("div");
    overlay.id = "asset-loading-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "#0a0f0a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "9999",
      fontFamily: "sans-serif",
      color: "#a8f5b8",
    });
    overlay.innerHTML = `
      <div style="font-size:48px;margin-bottom:24px;">🌱</div>
      <div style="font-size:20px;font-weight:bold;letter-spacing:3px;margin-bottom:20px;">LOADING FARM...</div>
      <div style="width:260px;height:12px;background:#1a3d22;border-radius:6px;overflow:hidden;border:1px solid #2d6a3f;">
        <div id="asset-loading-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:6px;transition:width 0.15s ease;"></div>
      </div>
      <div id="asset-loading-pct" style="margin-top:10px;font-size:13px;opacity:0.7;">0%</div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  private updateLoadingBar(progress: number) {
    const bar = document.getElementById("asset-loading-bar");
    const pct = document.getElementById("asset-loading-pct");
    if (bar) bar.style.width = `${progress}%`;
    if (pct) pct.textContent = `${progress}%`;
  }

  private hideLoadingScreen() {
    const overlay = document.getElementById("asset-loading-overlay");
    if (!overlay) return;
    overlay.style.transition = "opacity 0.4s ease";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 420);
  }

  async init() {
    this.showLoadingScreen();

    await AssetLoader.loadAll((progress) => {
      this.updateLoadingBar(progress);
    });

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

    this.animalSelector = new CropSelector(
      (crop) => {
        if (!ANIMAL_CROPS.includes(crop)) return;
        const config = CROP_CONFIG[crop];
        if (!this.coinUI.spend(config.price)) return;
        if (!this.pendingPosition) return;
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetZ = (Math.random() - 0.5) * 4;
        spawnAnimal(
          this.scene,
          this.pendingPosition.x + offsetX,
          this.pendingPosition.z + offsetZ,
          crop,
        );
      },
      () => {
        this.isAnimalSelectorOpen = false;
        this.animalSelectorJustClosed = true;
        this.pendingPosition = null;
        this.zoomOut();
      },
    );

    this.cropSelector = new CropSelector(
      (crop) => {
        this.isSelectorOpen = false;
        this.selectorJustClosed = true;
        this.zoomOut();

        if (this.tutorialActive && this.tutorialStep === STEP_CLICK_CORN) {
          this.tutorial.end();
          this.tutorialActive = false;
        }

        if (!this.pendingPosition) return;

        const config = CROP_CONFIG[crop];
        if (!this.coinUI.spend(config.price)) return;

        if (crop === "ground" || crop === "fence") {
          if (this.pendingHit?.name === "placeholder") {
            this.placeHolder.removePlaceholder(this.scene, this.pendingHit);
          }
          spawnPlant(
            this.scene,
            this.pendingPosition.x,
            0,
            this.pendingPosition.z,
            crop,
          );
          if (crop === "fence") {
            this.spawnFenceTrigger(
              this.pendingPosition.x,
              this.pendingPosition.z,
            );
          }
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
      },
      () => {
        this.isSelectorOpen = false;
        this.selectorJustClosed = true;
        this.zoomOut();
      },
    );

    this.pixiCanvas.addEventListener("pointerdown", (e) => this.handleClick(e));
    setTimeout(() => this.startTutorial(), 500);

    this.hideLoadingScreen();
    this.render();
  }

  private isPixiObjectAt(x: number, y: number): boolean {
    const hits = this.app!.renderer.events.rootBoundary.hitTest(x, y);
    return hits !== null && hits !== this.stage;
  }

  private handleClick(e: PointerEvent) {
    const { clientX: x, clientY: y } = e;
    if (this.isPixiObjectAt(x, y)) return;
    if (this.isSelectorOpen || this.isAnimalSelectorOpen) return;
    if (this.selectorJustClosed) {
      this.selectorJustClosed = false;
      return;
    }
    if (this.animalSelectorJustClosed) {
      this.animalSelectorJustClosed = false;
      return;
    }

    const result = this.raycast.clickWithPriority(
      x,
      y,
      this.pixiCanvas,
      this.camera,
      this.scene.children,
      "placeholder",
    );
    if (!result) return;

    const { object: hit } = result;

    if (hit.name === "fence_trigger") {
      const center = new Vector3();
      hit.getWorldPosition(center);
      this.pendingPosition = new Vector3(center.x, 0, center.z);
      this.pendingHit = hit;
      this.isAnimalSelectorOpen = true;
      this.zoomTo(center);
      this.animalSelector.show(
        this.stage,
        x,
        y,
        this.coinUI.total,
        ["animal"],
        false,
        false,
      );
    } else if (hit.name === "placeholder") {
      const pos = new Vector3();
      hit.getWorldPosition(pos);
      this.pendingPosition = new Vector3(pos.x, 0, pos.z);
      this.pendingHit = hit;
      this.isSelectorOpen = true;
      this.zoomTo(pos);
      this.cropSelector.show(
        this.stage,
        x,
        y,
        this.coinUI.total,
        ["ground"],
        false,
        this.tutorialActive,
      );

      if (this.tutorialActive && this.tutorialStep === STEP_CLICK_PLACEHOLDER) {
        setTimeout(() => this.advanceTutorialToCorn(), 150);
      }
    } else if (hit.name.startsWith("ground")) {
      const pos = new Vector3();
      hit.getWorldPosition(pos);
      this.pendingPosition = new Vector3(pos.x, 0, pos.z);
      this.pendingHit = hit;
      this.isSelectorOpen = true;
      this.zoomTo(pos);
      this.cropSelector.show(
        this.stage,
        x,
        y,
        this.coinUI.total,
        ["plant"],
        false,
        this.tutorialActive,
      );
    }
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.camera.lookAt(this.lookAt);
    this.renderer.render(this.scene, this.camera);
    this.orbitControl?.update();
    this.app?.renderer.render({ container: this.stage, clear: false });
  };
}
