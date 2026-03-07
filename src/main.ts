import "./style.css";
import { SceneManager } from "./SceneManager";

class App {
  private sceneManager: SceneManager;
  private threeCanvas = document.getElementById(
    "three-canvas",
  )! as HTMLCanvasElement;
  private pixiCanvas = document.getElementById(
    "pixi-canvas",
  )! as HTMLCanvasElement;

  constructor() {
    this.sceneManager = new SceneManager(this.threeCanvas, this.pixiCanvas);
  }
}
const app = new App();
