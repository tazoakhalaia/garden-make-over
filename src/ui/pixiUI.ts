import { Application, Assets, Container } from "pixi.js";
import { config } from "../config";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();

  public plantOrAnimalMarket = new PlantOrAnimalMarket();

  private screenSize = config.baseScreenSize;

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  async initPixi(canvas: HTMLCanvasElement) {
    await Assets.loadBundle(["Assets"]);

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
  }

  showMarket() {
    this.plantOrAnimalMarket.createFarmMarket(this.uiLayer);
  }

  hideMarket() {
    this.plantOrAnimalMarket.destroy();
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
