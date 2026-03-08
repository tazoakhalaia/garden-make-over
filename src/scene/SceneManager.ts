import { Application, Container } from "pixi.js";
import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { AssetLoader } from "../core";
import { PlantManager, RaycastManager, Tutorial } from "../Manager";
import { DayNightToggle } from "../Manager/DayNightTogglerManager";
import { LightsManager } from "../Manager/LightManger";
import { PlaceHolder } from "../Manager/Placeholder";
import { WeatherParticles } from "../Manager/WeatherParticlesManager";
import { CoinUI } from "../ui/CoinUi";
import { CropSelector } from "../ui/CropSelector";
import { showSoundPrompt } from "../ui/Soundprompt";
import { CameraController } from "./CameraController";
import { handleClick, type ClickHandlerDeps } from "./ClickHandler";
import { Ground } from "./Ground";
import {
  hideLoadingScreen,
  showLoadingScreen,
  updateLoadingBar,
} from "./LoadingScreen";
import {
  createAnimalSelector,
  createCropSelector,
  type SelectorState,
} from "./SelectorFactory";

const STEP_CLICK_PLACEHOLDER = 0;
const STEP_CLICK_CORN = 1;

export class SceneManager {
  private scene = new Scene();
  private renderer: WebGLRenderer;
  private cam: CameraController;

  private app?: Application;
  private stage!: Container;

  private ground = new Ground();
  private placeHolder = new PlaceHolder();
  private plantManager = new PlantManager();
  private raycast = new RaycastManager();
  private cropSelector!: CropSelector;
  private animalSelector!: CropSelector;
  private coinUI = new CoinUI();
  private dayNightToggle = new DayNightToggle();
  private lightsManager = new LightsManager();
  private tutorial = new Tutorial();
  private weatherParticles = new WeatherParticles();

  private threeCanvas: HTMLCanvasElement;
  private pixiCanvas: HTMLCanvasElement;

  private isDay = true;
  private tutorialState = { active: true, step: STEP_CLICK_PLACEHOLDER };

  private state: SelectorState = {
    isSelectorOpen: false,
    selectorJustClosed: false,
    isAnimalSelectorOpen: false,
    animalSelectorJustClosed: false,
    pendingPosition: null,
    pendingHit: null,
  };

  constructor(threeCanvas: HTMLCanvasElement, pixiCanvas: HTMLCanvasElement) {
    this.threeCanvas = threeCanvas;
    this.pixiCanvas = pixiCanvas;

    this.cam = new CameraController(
      threeCanvas.clientWidth,
      threeCanvas.clientHeight,
    );

    this.renderer = new WebGLRenderer({ antialias: true, canvas: threeCanvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.ground.createGround(this.scene);
    this.placeHolder.createPlaceholder(this.scene);
    this.lightsManager.createLights(this.scene, this.renderer);

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

  private startTutorial() {
    const firstPlaceholder = this.scene.children.find(
      (c) => c.name === "placeholder",
    );
    if (!firstPlaceholder) return;

    this.cam.camera.updateMatrixWorld();

    const worldPos = new Vector3();
    firstPlaceholder.getWorldPosition(worldPos);
    const screen = this.cam.toScreen(worldPos);

    if (
      screen.x < 0 ||
      screen.x > window.innerWidth ||
      screen.y < 0 ||
      screen.y > window.innerHeight
    ) {
      requestAnimationFrame(() => this.startTutorial());
      return;
    }

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
        this.tutorialState.active = false;
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
          message: "🐂 Now tap Fence to buy Animals!",
          targetX: W / 2,
          targetY: H / 2 + 44,
        },
      ],
      () => {
        this.tutorialState.active = false;
      },
    );
    this.tutorialState.step = STEP_CLICK_CORN;
  }

  async init() {
    showLoadingScreen();
    await AssetLoader.loadAll((progress) => updateLoadingBar(progress));

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

    this.dayNightToggle.create(
      this.stage,
      (isDay) => {
        this.isDay = isDay;
        if (isDay) {
          this.renderer.setClearColor("#87ceeb");
          this.lightsManager.setDay();
        } else {
          this.renderer.setClearColor("#0a0a2e");
          this.lightsManager.setNight();
        }
      },
      (mode) => {
        this.weatherParticles.setMode(this.scene, mode);
      },
    );

    this.animalSelector = createAnimalSelector(
      this.state,
      this.scene,
      this.coinUI,
      this.cam,
      (x, z) => this.spawnFenceTrigger(x, z),
      this.placeHolder,
      this.plantManager,
    );

    this.cropSelector = createCropSelector(
      this.state,
      this.scene,
      this.coinUI,
      this.cam,
      this.plantManager,
      this.placeHolder,
      this.stage,
      this.threeCanvas,
      (x, z) => this.spawnFenceTrigger(x, z),
      () => {
        if (
          this.tutorialState.active &&
          this.tutorialState.step === STEP_CLICK_CORN
        ) {
          this.tutorial.end();
          this.tutorialState.active = false;
        }
      },
    );

    this.pixiCanvas.addEventListener("pointerdown", (e) =>
      this.onPointerDown(e),
    );

    hideLoadingScreen();
    await showSoundPrompt();

    this.render();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.startTutorial();
      });
    });
  }

  private onPointerDown(e: PointerEvent) {
    const deps: ClickHandlerDeps = {
      app: this.app!,
      stage: this.stage,
      scene: this.scene,
      cam: this.cam,
      raycast: this.raycast,
      coinUI: this.coinUI,
      cropSelector: this.cropSelector,
      animalSelector: this.animalSelector,
      pixiCanvas: this.pixiCanvas,
      state: this.state,
      tutorialState: this.tutorialState,
      onAdvanceTutorial: () => this.advanceTutorialToCorn(),
    };
    handleClick(e, deps);
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.cam.tick();
    this.weatherParticles.update();
    this.renderer.render(this.scene, this.cam.camera);
    this.app?.renderer.render({ container: this.stage, clear: false });
  };
}
