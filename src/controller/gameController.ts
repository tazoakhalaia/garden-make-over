import { ThreeScene } from "../scene";
import { PixiUI } from "../ui";

export class GameController {
  private pixiUI = new PixiUI();
  private threeScene = new ThreeScene();

  private _pixiCanvas: HTMLCanvasElement;
  private _threeCanvas: HTMLCanvasElement;

  constructor(pixiCanvas: HTMLCanvasElement, threeCanvas: HTMLCanvasElement) {
    this._pixiCanvas = pixiCanvas;
    this._threeCanvas = threeCanvas;
  }

  async init() {
    this.pixiUI.initPixi(this._pixiCanvas);
    this.threeScene.initThree(this._threeCanvas);
  }
}
