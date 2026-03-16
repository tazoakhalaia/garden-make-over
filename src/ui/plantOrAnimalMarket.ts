import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class PlantOrAnimalMarket {
  private background!: Graphics;
  private plantContainer = new Container();
  private animalContainer = new Container();

  createFarmMarket(container: Container) {
    this.renderBackground(container);

    this.createCard(
      this.plantContainer,
      "🌱 Plants",
      0x43a047,
      window.innerWidth / 2 - 180,
      window.innerHeight / 2 - 80,
    );

    this.createCard(
      this.animalContainer,
      "🐄 Animals",
      0xff7043,
      window.innerWidth / 2 + 20,
      window.innerHeight / 2 - 80,
    );

    this.plantContainer.label = plantOrAnimal.PLANT;
    this.animalContainer.label = plantOrAnimal.ANIMAL;

    container.addChild(this.plantContainer, this.animalContainer);
  }

  renderBackground(container: Container) {
    this.background = new Graphics()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x0f172a });

    this.background.alpha = 0.85;
    this.background.label = plantOrAnimal.BACKGROUND;

    container.addChild(this.background);
  }

  private createCard(
    parent: Container,
    label: string,
    color: number,
    x: number,
    y: number,
  ) {
    parent.x = x;
    parent.y = y;

    const shadow = new Graphics()
      .roundRect(8, 10, 150, 150, 28)
      .fill({ color: 0x000000 });

    shadow.alpha = 0.3;

    const card = new Graphics().roundRect(0, 0, 150, 150, 28).fill({ color });

    const border = new Graphics()
      .roundRect(0, 0, 150, 150, 28)
      .stroke({ width: 3, color: 0xffffff, alpha: 0.3 });

    const text = new Text({
      text: label,
      style: new TextStyle({
        fill: "#ffffff",
        fontSize: 24,
        fontFamily: "LuckiestGuy Regular",
      }),
    });

    text.anchor.set(0.5);
    text.x = 75;
    text.y = 75;

    parent.addChild(shadow, card, border, text);

    parent.eventMode = "static";
    parent.cursor = "pointer";
  }

  destroy() {
    this.background?.removeFromParent();
    this.plantContainer.removeFromParent();
    this.animalContainer.removeFromParent();
  }
}
