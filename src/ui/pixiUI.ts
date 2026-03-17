import { Application, Assets, Container } from "pixi.js";
import { config, type GameEvents } from "../config";
import { AnimalMarket } from "./animalMarket";
import { CoinUI } from "./coinUI";
import { PlantMarket } from "./plantMarket";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();
  public coinUI = new CoinUI();
  private gameEvents!: GameEvents;

  public plantOrAnimalMarket = new PlantOrAnimalMarket();
  public animalMarket = new AnimalMarket();
  public plantMarket = new PlantMarket();

  private screenSize = config.baseScreenSize;

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  initPixi(canvas: HTMLCanvasElement, gameEvents: GameEvents) {
    this.gameEvents = gameEvents;

    Assets.loadBundle(["Assets"]).then(async () => {
      await this.app.init({
        canvas,
        width: this.screenSize.width,
        height: this.screenSize.height,
        backgroundAlpha: 0,
      });

      this.uiLayer.eventMode = "static";
      this.uiLayer.interactiveChildren = true;
      this.app.stage.addChild(this.uiLayer);
      this.coinUI.create(this.uiLayer, 500);

      this.onResize();
      window.addEventListener("resize", this.onResize);
    });
  }

  showMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.plantOrAnimalMarket.createFarmMarket(this.uiLayer);
  }

  hideMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.plantOrAnimalMarket.destroy();
  }

  showAnimalMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.animalMarket.createAnimalMarket(this.uiLayer);
  }

  hideAnimalMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.animalMarket.destroy();
  }

  showPlantMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.plantMarket.createPlantMarket(this.uiLayer);
  }

  hidePlantMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.plantMarket.destroy();
  }

  onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);
  };
}
