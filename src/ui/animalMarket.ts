import { Container, Graphics, Text } from "pixi.js";
import type { GameEvents } from "../config";
import { plantOrAnimal } from "../enums";

interface AnimalData {
  name: string;
  emoji: string;
  color: number;
  secondary: number;
  label: string;
  stats: { label: string };
}

export class AnimalMarket {
  private animalContainer = new Container();
  private parentContainer!: Container;
  private gameEvents!: GameEvents;

  private animals: AnimalData[] = [
    {
      name: "COW",
      emoji: "🐄",
      color: 0x43a047,
      secondary: 0x2e7d32,
      label: plantOrAnimal.COW,
      stats: { label: "COW" },
    },
    {
      name: "CHICKEN",
      emoji: "🐔",
      color: 0xffca28,
      secondary: 0xf57f17,
      label: plantOrAnimal.CHICKEN,
      stats: { label: "CHICKEN" },
    },
    {
      name: "SHEEP",
      emoji: "🐑",
      color: 0x90caf9,
      secondary: 0x1976d2,
      label: plantOrAnimal.SHEEP,
      stats: { label: "SHEEP" },
    },
  ];

  private readonly BASE_CARD_W = 200;
  private readonly BASE_CARD_H = 270;
  private readonly GAP = 22;

  createAnimalMarket(container: Container, gameEvents: GameEvents) {
    this.parentContainer = container;
    this.gameEvents = gameEvents;
    this.updateLayout();
    window.addEventListener("resize", this.onResize);
  }
  private onResize = () => this.updateLayout();

  private updateLayout() {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const isPortrait = sh > sw;

    this.animalContainer.removeChildren();
    this.animalContainer.removeFromParent();
    this.parentContainer.addChild(this.animalContainer);

    const overlay = new Graphics()
      .rect(0, 0, sw, sh)
      .fill({ color: 0x000000, alpha: 0.75 });
    overlay.eventMode = "static";
    this.animalContainer.addChild(overlay);

    const content = new Container();

    const title = new Text({
      text: "FARMSTEAD MARKET",
      style: {
        fontFamily: "LuckiestGuy Regular",
        fontSize: 34,
        fill: "#5d4037",
      },
    });
    title.anchor.set(0.5, 0);
    content.addChild(title);

    const cardsWrap = new Container();
    this.animals.forEach((animal, i) => {
      const card = this.createCard(animal);
      if (isPortrait) {
        card.y = i * (this.BASE_CARD_H + this.GAP);
      } else {
        card.x = i * (this.BASE_CARD_W + this.GAP);
      }
      cardsWrap.addChild(card);
    });

    cardsWrap.y = 65;
    cardsWrap.x = isPortrait ? -this.BASE_CARD_W / 2 : -(cardsWrap.width / 2);
    content.addChild(cardsWrap);

    const sellBtnW = isPortrait ? this.BASE_CARD_W : cardsWrap.width;
    const sellBtnH = 48;
    const sellBtnGap = 16;

    const sellBg = new Graphics()
      .roundRect(0, 0, sellBtnW, sellBtnH, 12)
      .fill({ color: 0xb71c1c })
      .roundRect(3, 3, sellBtnW - 6, sellBtnH - 6, 10)
      .fill({ color: 0xe53935 });

    const sellLabel = new Text({
      text: "💰 SELL FENCE",
      style: {
        fontFamily: "LuckiestGuy Regular",
        fontSize: 20,
        fill: "#ffffff",
      },
    });
    sellLabel.anchor.set(0.5);
    sellLabel.x = sellBtnW / 2;
    sellLabel.y = sellBtnH / 2;

    const sellBtn = new Container();
    sellBtn.addChild(sellBg, sellLabel);
    sellBtn.eventMode = "static";
    sellBtn.cursor = "pointer";
    sellBtn.x = isPortrait ? -this.BASE_CARD_W / 2 : -(cardsWrap.width / 2);
    sellBtn.y = cardsWrap.y + cardsWrap.height + sellBtnGap;

    sellBtn.on("pointerover", () => sellBtn.scale.set(1.03));
    sellBtn.on("pointerout", () => sellBtn.scale.set(1.0));
    sellBtn.on("pointerdown", () => sellBtn.scale.set(0.97));
    sellBtn.on("pointerup", () => {
      sellBtn.scale.set(1.0);
      this.gameEvents.dispatchEvent({ type: "sell-fence" });
    });

    content.addChild(sellBtn);

    const padding = 45;
    const panelW = content.width + padding * 2;
    const panelH = content.height + padding * 2;

    const panel = new Graphics()
      .roundRect(-panelW / 2, -padding, panelW, panelH, 24)
      .fill({ color: 0x5d4037 })
      .roundRect(-panelW / 2 + 8, -padding + 8, panelW - 16, panelH - 16, 18)
      .fill({ color: 0xffecb3 });
    content.addChildAt(panel, 0);

    const safeWidth = sw * 0.9;
    const safeHeight = sh * 0.9;
    const isMobile = sh > sw || sw < 768;
    const maxScale = isMobile ? 0.7 : 1;
    const scale = Math.min(safeWidth / panelW, safeHeight / panelH, maxScale);

    content.scale.set(scale);
    content.x = sw / 2;
    content.y = sh / 2 - content.height / 2 + padding * scale;

    this.animalContainer.addChild(content);

    const closeBtn = new Graphics().circle(0, 0, 18).fill({ color: 0xc62828 });

    const closeText = new Text({
      text: "✕",
      style: { fontSize: 15, fill: "#ffffff", fontWeight: "bold" },
    });
    closeText.anchor.set(0.5);

    const btn = new Container();
    btn.addChild(closeBtn, closeText);
    btn.eventMode = "static";
    btn.cursor = "pointer";
    btn.on("pointerdown", () => this.destroy());

    btn.x = content.x + content.width / 2 - 25;
    btn.y = content.y - 10;

    this.animalContainer.addChild(btn);
  }

  private createCard(data: AnimalData): Container {
    const card = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, this.BASE_CARD_W, this.BASE_CARD_H, 16)
      .fill({ color: data.secondary })
      .roundRect(6, 6, this.BASE_CARD_W - 12, this.BASE_CARD_H - 12, 12)
      .fill({ color: data.color });

    const name = new Text({
      text: data.name,
      style: {
        fontFamily: "LuckiestGuy Regular",
        fontSize: 26,
        fill: "#ffffff",
      },
    });
    name.anchor.set(0.5, 0);
    name.x = this.BASE_CARD_W / 2;
    name.y = 18;

    const emoji = new Text({ text: data.emoji, style: { fontSize: 80 } });
    emoji.anchor.set(0.5);
    emoji.x = this.BASE_CARD_W / 2;
    emoji.y = this.BASE_CARD_H / 2;

    const stats = new Text({
      text: `${data.stats.label}`,
      style: { fontSize: 15, fill: "#ffffff", fontWeight: "bold" },
    });
    stats.anchor.set(0.5);
    stats.x = this.BASE_CARD_W / 2;
    stats.y = this.BASE_CARD_H - 30;

    card.addChild(bg, name, emoji, stats);
    card.eventMode = "static";
    card.cursor = "pointer";
    card.label = data.label;

    return card;
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.animalContainer.removeFromParent();
    this.animalContainer.removeChildren();
  }
}
