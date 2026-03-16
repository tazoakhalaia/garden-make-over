import { Container, Graphics } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class PlantMarket {
  private marketBackground!: Graphics;
  private plantContainer = new Container();

  createPlantMarket(container: Container) {
    this.renderBackground(container);
    this.plantAction(container);
  }

  renderBackground(container: Container) {
    this.marketBackground = new Graphics()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: "grey" });
    this.marketBackground.alpha = 0;
    this.marketBackground.label = plantOrAnimal.BACKGROUND;
    container.addChild(this.marketBackground);
  }

  plantAction(container: Container) {
    const plantBtnBackground = new Graphics()
      .rect(300, 0, 100, 100)
      .fill({ color: "green" });
    plantBtnBackground.label = plantOrAnimal.PLANTMARKET;
    this.plantContainer.addChild(plantBtnBackground);
    container.addChild(this.plantContainer);
  }

  destroy() {
    this.marketBackground?.removeFromParent();
    this.plantContainer.removeFromParent();
  }
}
