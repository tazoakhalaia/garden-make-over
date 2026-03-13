import { Application, Assets } from "pixi.js";
import { config } from "../config";

export class PixiUI {
  private app = new Application();

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  initPixi(canvas: HTMLCanvasElement) {
    Assets.loadBundle(["Assets"], async () => {
      await this.app.init({
        canvas: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
      });
    });
    window.addEventListener("resize", () => this.onResize());
  }

  onResize = () => {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
  };
}
