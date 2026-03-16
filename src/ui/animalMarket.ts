import { Container, Graphics } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class AnimalMarket {
  private marketBackground!: Graphics;
  private animalContainer = new Container();

  createAnimalMarket(container: Container) {
    this.renderBackground(container);
    this.animaltAction(container);
  }

  renderBackground(container: Container) {
    this.marketBackground = new Graphics()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: "grey" });
    this.marketBackground.alpha = 0;
    this.marketBackground.label = "BACKGROUND";
    container.addChild(this.marketBackground);
  }

  animaltAction(container: Container) {
    const animalBtnBackground = new Graphics()
      .rect(300, 0, 100, 100)
      .fill({ color: "green" });
    animalBtnBackground.label = plantOrAnimal.ANIMALMARKET;
    this.animalContainer.addChild(animalBtnBackground);
    container.addChild(this.animalContainer);
  }

  destroy() {
    this.marketBackground?.removeFromParent();
    this.animalContainer.removeFromParent();
  }
}
