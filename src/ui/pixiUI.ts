import { Application, Assets, Container } from "pixi.js";
import { config } from "../config";
import { DayNightToggler } from "./dayNightToggler";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";
import { SellProductsBubble } from "./sellProductsBubble";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();

  private dayNightToggler = new DayNightToggler();
  private sellProductsBubble = new SellProductsBubble();
  public plantOrAnimalMarket = new PlantOrAnimalMarket();

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  initPixi(canvas: HTMLCanvasElement) {
    Assets.loadBundle(["Assets"], async () => {
      await this.app.init({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
      });

      this.uiLayer.interactive = true;
      this.uiLayer.interactiveChildren = true;
      this.app.stage.addChild(this.uiLayer);
    });

    window.addEventListener("resize", () => this.onResize());
  }

  showMarket() {
    this.plantOrAnimalMarket.createFarmMarket(this.uiLayer);
  }

  hideMarket() {
    this.plantOrAnimalMarket.destroy();
  }

  onResize = () => {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
  };
}
