import { ClickHandler } from "../input";
import { ThreeScene } from "../scene";
import { PixiUI } from "../ui";

export class GameController {
  private pixiUI = new PixiUI();
  private threeScene = new ThreeScene();
  private clickHandler = new ClickHandler();

  private _pixiCanvas: HTMLCanvasElement;
  private _threeCanvas: HTMLCanvasElement;

  constructor(pixiCanvas: HTMLCanvasElement, threeCanvas: HTMLCanvasElement) {
    this._pixiCanvas = pixiCanvas;
    this._threeCanvas = threeCanvas;
  }

  init() {
    this.threeScene.initThree(this._threeCanvas);
    this.pixiUI.initPixi(this._pixiCanvas);
    this.clickHandler.setupClickHandler(
      this._pixiCanvas,
      this.threeScene.perspectiveCamera,
      this.threeScene.scene,
      this.pixiUI.uiLayer,
      this.threeScene.placeholder,
      this.threeScene.animalFence,
      this.threeScene.plant,
      this.pixiUI,
    );
  }
}
