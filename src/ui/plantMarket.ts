import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { GameEvents } from "../config";
import { plantOrAnimal } from "../enums";

export class PlantMarket {
  private marketBackground!: Graphics;
  private plantContainer = new Container();
  private parentContainer!: Container;
  private gameEvents!: GameEvents;

  createPlantMarket(container: Container, gameEvents: GameEvents) {
    this.parentContainer = container;
    this.gameEvents = gameEvents;
    this.renderBackground(container);
    this.plantAction(container);
    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => {
    this.renderBackground(this.parentContainer);
    this.rebuildButton();
  };

  renderBackground(container: Container) {
    if (!this.marketBackground) {
      this.marketBackground = new Graphics();
      this.marketBackground.label = plantOrAnimal.BACKGROUND;
    }
    if (!this.marketBackground.parent) {
      container.addChildAt(this.marketBackground, 0);
    }
    this.marketBackground
      .clear()
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x000000, alpha: 0.75 });
  }

  plantAction(container: Container) {
    if (!this.plantContainer.parent) container.addChild(this.plantContainer);
    this.rebuildButton();
  }

  private rebuildButton() {
    this.plantContainer.removeChildren();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scale = Math.min(
      Math.max(Math.min(screenWidth / 1000, screenHeight / 800), 0.7),
      1.2,
    );

    const cardWidth = 460 * scale;
    const cardHeight = 180 * scale;
    const borderRadius = 24 * scale;

    const shadow = new Graphics()
      .roundRect(5 * scale, 10 * scale, cardWidth, cardHeight, borderRadius)
      .fill({ color: 0x000000, alpha: 0.4 });
    this.plantContainer.addChild(shadow);

    const body = new Graphics()
      .roundRect(0, 0, cardWidth, cardHeight, borderRadius)
      .fill({ color: 0x3d2b1f })
      .roundRect(
        8 * scale,
        8 * scale,
        cardWidth - 16 * scale,
        cardHeight - 16 * scale,
        borderRadius - 8 * scale,
      )
      .fill({ color: 0x8d6e63 });
    this.plantContainer.addChild(body);

    for (let i = 0; i < 5; i++) {
      const line = new Graphics()
        .rect(
          20 * scale,
          (40 + i * 25) * scale,
          cardWidth - 40 * scale,
          2 * scale,
        )
        .fill({ color: 0x5d4037, alpha: 0.3 });
      this.plantContainer.addChild(line);
    }

    const tagWidth = cardHeight * 0.75;
    const tag = new Graphics()
      .roundRect(
        15 * scale,
        15 * scale,
        tagWidth,
        cardHeight - 30 * scale,
        15 * scale,
      )
      .fill({ color: 0x2e7d32 })
      .stroke({ color: 0xa5d6a7, width: 3 * scale, alpha: 0.5 })
      .roundRect(
        20 * scale,
        20 * scale,
        tagWidth - 10 * scale,
        (cardHeight - 30 * scale) / 2,
        10 * scale,
      )
      .fill({ color: 0xffffff, alpha: 0.1 });
    this.plantContainer.addChild(tag);

    const emoji = new Text({
      text: "🌱",
      style: { fontSize: 70 * scale },
    });
    emoji.anchor.set(0.5);
    emoji.x = 15 * scale + tagWidth / 2;
    emoji.y = cardHeight / 2;
    this.plantContainer.addChild(emoji);

    const title = new Text({
      text: "BUY PLANTS",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: 38 * scale,
        fill: "#ffffff",
        stroke: { color: "#1b5e20", width: 6 * scale },
        dropShadow: { color: "#000000", alpha: 0.4, distance: 4 * scale },
      }),
    });
    title.x = tagWidth + 40 * scale;
    title.y = cardHeight * 0.3;
    this.plantContainer.addChild(title);

    const subtitle = new Text({
      text: "CULTIVATE YOUR GARDEN",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: 18 * scale,
        fill: "#c8e6c9",
      }),
    });
    subtitle.x = tagWidth + 42 * scale;
    subtitle.y = cardHeight * 0.6;
    this.plantContainer.addChild(subtitle);

    const hitArea = new Graphics()
      .roundRect(0, 0, cardWidth, cardHeight, borderRadius)
      .fill({ color: 0xffffff, alpha: 0.001 });
    hitArea.label = plantOrAnimal.PLANTMARKET;
    hitArea.eventMode = "static";
    hitArea.cursor = "pointer";
    this.plantContainer.addChild(hitArea);

    const closeCircle = new Graphics()
      .roundRect(-60 * scale, -18 * scale, 120 * scale, 36 * scale, 10 * scale)
      .fill({ color: 0xc62828 });

    const closeText = new Text({
      text: "✕",
      style: { fontSize: 15 * scale, fill: "#ffffff", fontWeight: "bold" },
    });
    closeText.anchor.set(0.5);

    this.plantContainer.pivot.set(cardWidth / 2, cardHeight / 2);
    this.plantContainer.position.set(screenWidth / 2, screenHeight / 2);

    hitArea.on("pointerover", () => this.plantContainer.scale.set(1.05));
    hitArea.on("pointerout", () => this.plantContainer.scale.set(1.0));
    hitArea.on("pointerdown", () => this.plantContainer.scale.set(0.95));
    hitArea.on("pointerup", () => this.plantContainer.scale.set(1.05));

    const closeBtn = new Graphics()
      .roundRect(0, 0, 36 * scale, 36 * scale, 8 * scale)
      .fill({ color: 0xc62828 });
    closeBtn.label = plantOrAnimal.PLANTMARKETCLOSE;
    closeBtn.cursor = "pointer";

    const closeBtnText = new Text({
      text: "✕",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: 18 * scale,
        fill: "#ffffff",
      }),
    });
    closeBtnText.anchor.set(0.5);
    closeBtnText.x = 18 * scale;
    closeBtnText.y = 18 * scale;

    const closeBtnContainer = new Container();
    closeBtnContainer.addChild(closeBtn, closeBtnText);
    closeBtnContainer.x = cardWidth - 44 * scale;
    closeBtnContainer.y = -16 * scale;
    this.plantContainer.addChild(closeBtnContainer);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.marketBackground?.removeFromParent();
    this.plantContainer.removeFromParent();
  }
}
