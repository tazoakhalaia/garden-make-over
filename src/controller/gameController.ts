import type { Mesh } from "three";
import { GameEvents } from "../config";
import { AudioManager } from "../config/audioManager";
import { ClickHandler } from "../input";
import { ThreeScene } from "../scene";
import { PixiUI, ProgressBar } from "../ui";

export class GameController {
  private pixiUI = new PixiUI();
  private threeScene = new ThreeScene();
  private clickHandler = new ClickHandler();
  private gameEvents = new GameEvents();
  private audioManager = new AudioManager();
  private progressBar = new ProgressBar();
  private lastClickedFenceHitBox: Mesh | null = null;
  private lastClickedFencePosition: { x: number; y: number; z: number } | null =
    null;

  private _pixiCanvas: HTMLCanvasElement;
  private _threeCanvas: HTMLCanvasElement;

  constructor(pixiCanvas: HTMLCanvasElement, threeCanvas: HTMLCanvasElement) {
    this._pixiCanvas = pixiCanvas;
    this._threeCanvas = threeCanvas;
  }

  async init() {
    await this.threeScene.initThree(this._threeCanvas, this.gameEvents);

    this.pixiUI.dayNight.initScene(
      this.threeScene.scene,
      this.threeScene.lights.hemi,
      this.threeScene.lights.sun,
      this.threeScene.lights.fill,
      this.threeScene.lights.accent,
    );

    this.pixiUI.initPixi(this._pixiCanvas, this.gameEvents);
    this.pixiUI.threeSnowToggle = () => this.threeScene.snow.toggle();
    this.progressBar.init(this.pixiUI.uiLayer, this.gameEvents);

    this.clickHandler.setupClickHandler(
      this._pixiCanvas,
      this.threeScene.perspectiveCamera,
      this.threeScene.scene,
      this.pixiUI.uiLayer,
      this.threeScene.placeholder,
      this.threeScene.animalFence,
      this.threeScene.plant,
      this.gameEvents,
      this.threeScene.cameraController,
    );

    this.gameEvents.addEventListener("placeholder:clicked", ({ x, y, z }) => {
      this.audioManager.playSfx("click");
      this.threeScene.cameraController.zoomToPosition(x, y, z);
      this.pixiUI.showMarket();
    });

    this.gameEvents.addEventListener(
      "market:item-selected",
      ({ id, x, y, z }) => {
        if (id === "PLANT") this.threeScene.plant.placePlantAt(x, y, z);
        if (id === "ANIMAL") this.threeScene.animalFence.placeFenceAt(x, y, z);
        this.threeScene.cameraController.resetPosition();
        this.pixiUI.hideMarket();
      },
    );

    this.gameEvents.addEventListener("fence:clicked", ({ hitBox }) => {
      this.lastClickedFenceHitBox = hitBox;
      this.lastClickedFencePosition = {
        x: hitBox.position.x,
        y: hitBox.position.y - 2,
        z: hitBox.position.z,
      };
      this.audioManager.playSfx("click");
      this.pixiUI.showAnimalMarket();
    });

    this.gameEvents.addEventListener(
      "animalMarket:item-selected",
      ({ x, y, z, id }) => {
        const cost = 100;
        if (!this.pixiUI.coinUI.remove(cost)) return;

        if (id === "CHICKEN") this.audioManager.playAnimal("chicken");
        else if (id === "SHEEP") this.audioManager.playAnimal("sheep");
        else if (id === "COW") this.audioManager.playAnimal("cow");

        this.threeScene.spawner.spawnObjects(x, y, z, id);
        this.pixiUI.hideAnimalMarket();
      },
    );

    this.gameEvents.addEventListener("plantGround:clicked", () => {
      this.audioManager.playSfx("click");
      this.pixiUI.showPlantMarket();
    });

    this.gameEvents.addEventListener(
      "buyPlant:item-selected",
      ({ x, y, z, id }) => {
        const cost = 50;
        if (!this.pixiUI.coinUI.remove(cost)) return;
        this.threeScene.spawner.spawnObjects(x, y, z, id);
        this.pixiUI.hidePlantMarket();
      },
    );

    this.gameEvents.addEventListener("minigame:coins", ({ coins }) => {
      this.pixiUI.coinUI.add(coins);
    });

    this.gameEvents.addEventListener("sell-fence", () => {
      if (!this.lastClickedFenceHitBox || !this.lastClickedFencePosition)
        return;

      this.threeScene.animalFence.sellFence(
        this.lastClickedFenceHitBox,
        this.threeScene.spawner.getSpawnedAnimals(),
      );

      const { x, y, z } = this.lastClickedFencePosition;
      this.threeScene.placeholder.restorePlaceholder(
        x,
        y,
        z,
        this.threeScene.loadAllModels,
      );

      this.pixiUI.coinUI.add(500);
      this.pixiUI.hideAnimalMarket();
      this.lastClickedFenceHitBox = null;
      this.lastClickedFencePosition = null;
    });
  }
}
