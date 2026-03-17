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
  private parentContainer!: Container;

  private animals: AnimalData[] = [
    { name: "Cow", color: 0x43a047, label: plantOrAnimal.COW },
    { name: "Chicken", color: 0xffca28, label: plantOrAnimal.CHICKEN },
    { name: "Sheep", color: 0x90caf9, label: plantOrAnimal.SHEEP },
  ];

  private CARD_WIDTH = 200;
  private CARD_HEIGHT = 150;
  private RADIUS = 25;

  createAnimalMarket(container: Container) {
    this.parentContainer = container;
    this.renderBackground(container);
    this.updateLayout();
    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => this.updateLayout();

  renderBackground(container: Container) {
    if (!this.marketBackground) {
      this.marketBackground = new Graphics();
      this.marketBackground.label = plantOrAnimal.BACKGROUND;
    }

    if (!container.children.includes(this.marketBackground)) {
      container.addChildAt(this.marketBackground, 0);
    }

    this.marketBackground.clear();
    this.marketBackground
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x0f172a, alpha: 0.8 });
  }

  private updateLayout() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let scaleFactor = Math.min(screenWidth / 1200, screenHeight / 900);
    scaleFactor = Math.max(0.7, Math.min(1.3, scaleFactor));

    this.CARD_WIDTH = 200 * scaleFactor;
    this.CARD_HEIGHT = 150 * scaleFactor;
    this.RADIUS = 25 * scaleFactor;
    const spacing = this.CARD_WIDTH + 50 * scaleFactor;

    this.animalContainer.removeChildren();
    this.renderBackground(this.parentContainer);

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    this.animals.forEach((animal, index) => {
      const cardContainer = new Container();

      if (screenWidth > 700) {
        cardContainer.x =
          centerX - spacing + spacing * index - this.CARD_WIDTH / 2;
        cardContainer.y = centerY - this.CARD_HEIGHT / 2;
      } else {
        cardContainer.x = centerX - this.CARD_WIDTH / 2;
        cardContainer.y =
          centerY -
          (this.animals.length * (this.CARD_HEIGHT + 20)) / 2 +
          index * (this.CARD_HEIGHT + 20);
      }

      const card = new Graphics()
        .roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, this.RADIUS)
        .fill({ color: animal.color, alpha: 0.7 });

      card.label = animal.label;

      const text = new Text({
        text: animal.name,
        style: new TextStyle({
          fontFamily: "LuckiestGuy Regular",
          fontSize: Math.max(18, this.CARD_HEIGHT * 0.25),
          fill: "#ffffff",
          align: "center",
        }),
      });
      text.anchor.set(0.5);
      text.x = this.CARD_WIDTH / 2;
      text.y = this.CARD_HEIGHT / 2;

      cardContainer.addChild(card, text);
      cardContainer.eventMode = "static";
      cardContainer.cursor = "pointer";

      this.animalContainer.addChild(cardContainer);
    });

    if (!this.parentContainer.children.includes(this.animalContainer)) {
      this.parentContainer.addChild(this.animalContainer);
    }
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.animalContainer.removeChildren();
    this.animalContainer.removeFromParent();
    this.marketBackground?.removeFromParent();
  }
}
