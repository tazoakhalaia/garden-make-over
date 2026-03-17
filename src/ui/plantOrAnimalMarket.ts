import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class PlantOrAnimalMarket {
  private background!: Graphics;
  private plantContainer = new Container();
  private animalContainer = new Container();

  private CARD_WIDTH = 280;
  private CARD_HEIGHT = 120;
  private RADIUS = 24;

  createFarmMarket(container: Container) {
    this.plantContainer.label = plantOrAnimal.PLANT;
    this.animalContainer.label = plantOrAnimal.ANIMAL;

    container.addChild(this.plantContainer, this.animalContainer);

    this.renderBackground(container);
    this.updateLayout();

    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => this.updateLayout();

  renderBackground(container: Container) {
    if (!this.background) {
      this.background = new Graphics();
      this.background.label = plantOrAnimal.BACKGROUND;
    }

    if (!this.background.parent) {
      container.addChildAt(this.background, 0);
    }

    this.background.clear();
    this.background
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x0f172a });
    this.background.alpha = 0.2;
  }

  private updateLayout() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let scaleFactor = Math.min(screenWidth / 1200, screenHeight / 900);
    scaleFactor = Math.max(0.7, Math.min(1.3, scaleFactor));

    this.CARD_WIDTH = 320 * scaleFactor;
    this.CARD_HEIGHT = 100 * scaleFactor;
    this.RADIUS = 20 * scaleFactor;
    const spacing = 30 * scaleFactor;

    this.plantContainer.removeChildren();
    this.animalContainer.removeChildren();

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    if (screenWidth > 700) {
      this.createCard(
        this.plantContainer,
        "🌱  PLANT",
        0x10b981,
        0x059669,
        centerX - this.CARD_WIDTH / 2,
        centerY - this.CARD_HEIGHT - spacing / 2,
      );
      this.createCard(
        this.animalContainer,
        "🐄  ANIMAL",
        0xf59e0b,
        0xd97706,
        centerX - this.CARD_WIDTH / 2,
        centerY + spacing / 2,
      );
    } else {
      this.createCard(
        this.plantContainer,
        "🌱  PLANT",
        0x10b981,
        0x059669,
        centerX - this.CARD_WIDTH / 2,
        centerY - this.CARD_HEIGHT - spacing,
      );
      this.createCard(
        this.animalContainer,
        "🐄  ANIMAL",
        0xf59e0b,
        0xd97706,
        centerX - this.CARD_WIDTH / 2,
        centerY + spacing,
      );
    }
  }

  private createCard(
    parent: Container,
    label: string,
    colorTop: number,
    colorBottom: number,
    x: number,
    y: number,
  ) {
    parent.x = x;
    parent.y = y;

    const shadow = new Graphics()
      .roundRect(0, 8, this.CARD_WIDTH, this.CARD_HEIGHT, this.RADIUS)
      .fill({ color: 0x000000, alpha: 0.4 });

    const card = new Graphics()
      .roundRect(0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, this.RADIUS)
      .fill({ color: colorTop })
      .stroke({ width: 2, color: 0xffffff, alpha: 0.3 });

    const shine = new Graphics()
      .roundRect(2, 2, this.CARD_WIDTH - 4, this.CARD_HEIGHT / 2, this.RADIUS)
      .fill({ color: 0xffffff, alpha: 0.15 });

    const text = new Text({
      text: label,
      style: new TextStyle({
        fill: "#ffffff",
        fontSize: Math.max(14, this.CARD_HEIGHT * 0.3),
        fontFamily: "LuckiestGuy Regular",
        letterSpacing: 1,
        dropShadow: { color: 0x000000, alpha: 0.3, blur: 4, distance: 2 },
      }),
    });

    text.anchor.set(0.5);
    text.x = this.CARD_WIDTH / 2;
    text.y = this.CARD_HEIGHT / 2;

    parent.addChild(shadow, card, shine, text);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.background?.removeFromParent();
    this.plantContainer.removeFromParent();
    this.animalContainer.removeFromParent();
  }
}
