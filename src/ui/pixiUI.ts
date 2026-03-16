import { Application, Assets, Container } from "pixi.js";
import { config } from "../config";
import { AnimalMarket } from "./animalMarket";
import { PlantMarket } from "./plantMarket";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();

  public plantOrAnimalMarket = new PlantOrAnimalMarket();
  public animalMarket = new AnimalMarket();
  public plantMarket = new PlantMarket();

  private screenSize = config.baseScreenSize;

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  initPixi(canvas: HTMLCanvasElement) {
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

      this.onResize();
      window.addEventListener("resize", this.onResize);
    });
  }

  showMarket() {
    this.plantOrAnimalMarket.createFarmMarket(this.uiLayer);
  }

  hideMarket() {
    this.plantOrAnimalMarket.destroy();
  }

  showAnimalMarket() {
    this.animalMarket.createAnimalMarket(this.uiLayer);
  }

  hideAnimalMarket() {
    this.animalMarket.destroy();
  }

  showPlantMarket() {
    this.plantMarket.createPlantMarket(this.uiLayer);
  }

  hidePlantMarket() {
    this.plantMarket.destroy();
  }

  onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.app.renderer.resize(width, height);

    const scaleX = width / this.screenSize.width;
    const scaleY = height / this.screenSize.height;

    const scale = Math.min(scaleX, scaleY);

    this.app.stage.scale.set(scale);
  };
}
