import { Container, Graphics } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class PlantOrAnimalMarket {
  private marketBackground!: Graphics;
  private plantContainer = new Container();
  private animalContainer = new Container();

  createFarmMarket(container: Container) {
    this.renderBackground(container);
    this.plantAction(container);
    this.animaltAction(container);
  }

  renderBackground(container: Container) {
    this.marketBackground = new Graphics()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: "grey" });
    this.marketBackground.alpha = 0.2;
    this.marketBackground.label = "BACKGROUND";
    container.addChild(this.marketBackground);
  }

  plantAction(container: Container) {
    this.plantContainer.label = plantOrAnimal.PLANT;
    const plantBtnBackground = new Graphics()
      .rect(0, 0, 100, 100)
      .fill({ color: "red" });
    this.plantContainer.addChild(plantBtnBackground);
    container.addChild(this.plantContainer);
  }

  animaltAction(container: Container) {
    this.animalContainer.label = plantOrAnimal.ANIMAL;
    const animalBtnBackground = new Graphics()
      .rect(250, 0, 100, 100)
      .fill({ color: "green" });
    this.animalContainer.addChild(animalBtnBackground);
    container.addChild(this.animalContainer);
  }

  destroy() {
    this.marketBackground?.removeFromParent();
    this.plantContainer.removeFromParent();
    this.animalContainer.removeFromParent();
  }
}
