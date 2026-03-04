import "./style.css";
import { SceneManager } from "./SceneManager";
import { PlacementManager } from "./PlacementManager";

class App {
  private sceneManager: SceneManager;

  constructor() {
    const container = document.getElementById("app")!;
    this.sceneManager = new SceneManager(container);
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
