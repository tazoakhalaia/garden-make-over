import { GameController } from "./controller";
import "./style.css";

class App {
  private gameController: GameController;
  private threeCanvas = document.getElementById(
    "three-canvas",
  )! as HTMLCanvasElement;
  private pixiCanvas = document.getElementById(
    "pixi-canvas",
  )! as HTMLCanvasElement;

  constructor() {
    this.gameController = new GameController(this.pixiCanvas, this.threeCanvas);
    this.gameController.init();
  }
}
const app = new App();
