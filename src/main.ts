import "./style.css";
import { SceneManager } from "./SceneManager";
import { PlacementManager } from "./PlacementManager";

class App {
  private sceneManager: SceneManager;
  private container = document.getElementById("app")!;

  constructor() {
    this.sceneManager = new SceneManager(this.container);
    this.addEvent();
  }

  addEvent() {
    const plantBtn = document.getElementById("plant")!;
    plantBtn.addEventListener("click", () => {
      PlacementManager.selectedType("plant");
    });
  }
}
const app = new App();
