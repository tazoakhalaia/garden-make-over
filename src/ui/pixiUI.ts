import { Application, Assets, Container } from "pixi.js";
import { config } from "../config";
import { DayNightToggler } from "./dayNightToggler";
import { MarketBubble } from "./marketBubble";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();

  private dayNightToggler = new DayNightToggler();
  private marketBubble = new MarketBubble();

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

    this.marketBubble.createBubble(this.uiLayer);
    window.addEventListener("resize", () => this.onResize());
  }

  onResize = () => {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
  };
}
