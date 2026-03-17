import { GameEvents } from "../config";
import { ClickHandler } from "../input";
import { ThreeScene } from "../scene";
import { PixiUI } from "../ui";

export class GameController {
  private pixiUI = new PixiUI();
  private threeScene = new ThreeScene();
  private clickHandler = new ClickHandler();
  private gameEvents = new GameEvents();

  private _pixiCanvas: HTMLCanvasElement;
  private _threeCanvas: HTMLCanvasElement;

  constructor(pixiCanvas: HTMLCanvasElement, threeCanvas: HTMLCanvasElement) {
    this._pixiCanvas = pixiCanvas;
    this._threeCanvas = threeCanvas;
  }

  init() {
    this.threeScene.initThree(this._threeCanvas, this.gameEvents);
    this.pixiUI.initPixi(this._pixiCanvas, this.gameEvents);
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

    this.gameEvents.addEventListener("placeholder:clicked", () => {
      this.pixiUI.showMarket();
    });

    this.gameEvents.addEventListener(
      "market:item-selected",
      ({ id, x, y, z }) => {
        if (id === "PLANT") this.threeScene.plant.placePlantAt(x, y, z);
        if (id === "ANIMAL") this.threeScene.animalFence.placeFenceAt(x, y, z);
        this.pixiUI.hideMarket();
      },
    );

    this.gameEvents.addEventListener(
      "animalMarket:item-selected",
      ({ x, y, z, id }) => {
        const cost = 100;
        if (!this.pixiUI.coinUI.remove(cost)) return;
        this.threeScene.spawner.spawnObjects(x, y, z, id);
        this.pixiUI.hideAnimalMarket();
      },
    );

    this.gameEvents.addEventListener("fence:clicked", () => {
      this.pixiUI.showAnimalMarket();
    });

    this.gameEvents.addEventListener("plantGround:clicked", () => {
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
  }
}
