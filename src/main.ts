import "./style.css";
import { SceneManager } from "./SceneManager";

class App {
  private sceneManager: SceneManager;

  constructor() {
    const container = document.getElementById("app")!;
    this.sceneManager = new SceneManager(container);
  }
}

const app = new App();
