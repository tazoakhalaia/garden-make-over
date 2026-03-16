import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { plantOrAnimal } from "../enums";

interface AnimalData {
  name: string;
  color: number;
  label: string;
}

export class AnimalMarket {
  private marketBackground!: Graphics;
  private animalContainer = new Container();

  private animals: AnimalData[] = [
    { name: "Cow", color: 0x43a047, label: plantOrAnimal.COW },
    { name: "Chicken", color: 0xffca28, label: plantOrAnimal.CHICKEN },
    { name: "Sheep", color: 0x90caf9, label: plantOrAnimal.SHEEP },
  ];

  createAnimalMarket(container: Container) {
    this.renderBackground(container);
    this.createAnimalCards(container);
  }

  renderBackground(container: Container) {
    this.marketBackground = new Graphics()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x0f172a });
    this.marketBackground.alpha = 0.85;
    this.marketBackground.label = plantOrAnimal.BACKGROUND;
    container.addChild(this.marketBackground);
  }

  createAnimalCards(container: Container) {
    const spacing = 220;
    const startX = window.innerWidth / 2 - spacing;
    const centerY = window.innerHeight / 2 - 75;

    this.animals.forEach((animal, index) => {
      const cardContainer = new Container();
      cardContainer.x = startX + spacing * index;
      cardContainer.y = centerY;

      const shadow = new Graphics()
        .roundRect(8, 10, 200, 150, 25)
        .fill({ color: 0x000000 });
      shadow.alpha = 0.3;

      const button = new Graphics()
        .roundRect(0, 0, 200, 150, 25)
        .fill({ color: animal.color });
      button.label = animal.label;

      const border = new Graphics()
        .roundRect(0, 0, 200, 150, 25)
        .stroke({ width: 3, color: 0xffffff, alpha: 0.3 });

      const text = new Text({
        text: `${animal.name}`,
        style: new TextStyle({
          fontFamily: "LuckiestGuy-Regular",
          fontSize: 28,
          fill: "#ffffff",
          fontWeight: "bold",
        }),
      });
      text.anchor.set(0.5);
      text.x = 100;
      text.y = 75;

      cardContainer.addChild(shadow, button, border, text);

      cardContainer.eventMode = "static";
      cardContainer.cursor = "pointer";
      this.animalContainer.addChild(cardContainer);
    });

    container.addChild(this.animalContainer);
  }

  destroy() {
    this.marketBackground?.removeFromParent();
    this.animalContainer.removeFromParent();
  }
}
