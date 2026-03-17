import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { plantOrAnimal } from "../enums";

export class PlantMarket {
  private marketBackground!: Graphics;
  private plantContainer = new Container();
  private parentContainer!: Container;

  createPlantMarket(container: Container) {
    this.parentContainer = container;
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
    this.marketBackground.clear();
    this.marketBackground
      .rect(0, 0, window.innerWidth, window.innerHeight)
      .fill({ color: 0x071a07 });
    this.marketBackground.alpha = 0.6;
  }

  plantAction(container: Container) {
    if (!this.plantContainer.parent) container.addChild(this.plantContainer);
    this.rebuildButton();
  }

  private rebuildButton() {
    this.plantContainer.removeChildren();

    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const s = Math.min(Math.max(Math.min(sw / 900, sh / 700), 0.6), 1.4);

    const cardW = Math.round(420 * s);
    const cardH = Math.round(160 * s);
    const r = Math.round(20 * s);
    const cx = Math.round((sw - cardW) / 2);
    const cy = Math.round((sh - cardH) / 2);

    for (let i = 3; i >= 1; i--) {
      const sh2 = new Graphics();
      sh2
        .roundRect(cx + i * 3, cy + i * 4, cardW, cardH, r)
        .fill({ color: 0x000000, alpha: 0.18 });
      this.plantContainer.addChild(sh2);
    }

    const glow = new Graphics();
    glow
      .roundRect(cx - 4, cy - 4, cardW + 8, cardH + 8, r + 4)
      .fill({ color: 0x16a34a, alpha: 0.22 });
    this.plantContainer.addChild(glow);

    const card = new Graphics();
    card.roundRect(cx, cy, cardW, cardH, r).fill({ color: 0x1a3a1a });
    this.plantContainer.addChild(card);

    const darkBottom = new Graphics();
    darkBottom
      .roundRect(cx, cy + cardH * 0.5, cardW, cardH * 0.5, r)
      .fill({ color: 0x0f2410 });
    darkBottom.mask = (() => {
      const m = new Graphics();
      m.rect(cx, cy + cardH * 0.5, cardW, cardH * 0.5).fill({
        color: 0xffffff,
      });
      this.plantContainer.addChild(m);
      return m;
    })();
    this.plantContainer.addChild(darkBottom);

    const accentW = Math.round(cardH * 0.7);
    const accent = new Graphics();
    accent.roundRect(cx, cy, accentW, cardH, r).fill({ color: 0x15803d });
    const accentMask = new Graphics();
    accentMask.rect(cx, cy, accentW - r / 2, cardH).fill({ color: 0xffffff });
    accent.mask = accentMask;
    this.plantContainer.addChild(accent);
    this.plantContainer.addChild(accentMask);

    const accentShine = new Graphics();
    accentShine
      .roundRect(cx + 5, cy + 5, accentW - 12, cardH * 0.42, r - 4)
      .fill({ color: 0xffffff, alpha: 0.12 });
    this.plantContainer.addChild(accentShine);

    const shine = new Graphics();
    shine
      .roundRect(
        cx + accentW + 6,
        cy + 6,
        cardW - accentW - 12,
        cardH * 0.36,
        r - 4,
      )
      .fill({ color: 0xffffff, alpha: 0.05 });
    this.plantContainer.addChild(shine);

    const divider = new Graphics();
    divider
      .rect(
        cx + accentW,
        cy + Math.round(12 * s),
        2,
        cardH - Math.round(24 * s),
      )
      .fill({ color: 0x4ade80, alpha: 0.35 });
    this.plantContainer.addChild(divider);

    const border = new Graphics();
    border
      .roundRect(cx, cy, cardW, cardH, r)
      .stroke({ color: 0x4ade80, width: Math.round(2 * s), alpha: 0.9 });
    this.plantContainer.addChild(border);

    const innerBorder = new Graphics();
    innerBorder
      .roundRect(cx + 2, cy + 2, cardW - 4, cardH - 4, r - 1)
      .stroke({ color: 0xffffff, width: 1, alpha: 0.06 });
    this.plantContainer.addChild(innerBorder);

    const emojiFs = Math.round(cardH * 0.48);
    const emoji = new Text({
      text: "🌱",
      style: new TextStyle({ fontSize: emojiFs }),
    });
    emoji.anchor.set(0.5, 0.5);
    emoji.x = cx + accentW / 2;
    emoji.y = cy + cardH / 2 + Math.round(3 * s);
    this.plantContainer.addChild(emoji);

    const titleFs = Math.max(16, Math.round(cardH * 0.235));
    const title = new Text({
      text: "BUY PLANTS",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: titleFs,
        fontWeight: "bold",
        fill: 0xdcfce7,
        letterSpacing: Math.round(3 * s),
        dropShadow: {
          color: 0x000000,
          alpha: 0.7,
          blur: 4,
          distance: Math.round(2 * s),
          angle: Math.PI / 4,
        },
      }),
    });
    title.anchor.set(0, 0.5);
    title.x = cx + accentW + Math.round(18 * s);
    title.y = cy + cardH * 0.37;
    this.plantContainer.addChild(title);

    const subFs = Math.max(9, Math.round(cardH * 0.135));
    const sub = new Text({
      text: "Beautiful Plants",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: subFs,
        fill: 0x86efac,
        letterSpacing: 0.5,
      }),
    });
    sub.anchor.set(0, 0);
    sub.x = cx + accentW + Math.round(20 * s);
    sub.y = cy + cardH * 0.57;
    this.plantContainer.addChild(sub);

    const hitArea = new Graphics();
    hitArea
      .roundRect(cx, cy, cardW, cardH, r)
      .fill({ color: 0xffffff, alpha: 0.001 });
    hitArea.label = plantOrAnimal.PLANTMARKET;
    hitArea.eventMode = "static";
    hitArea.cursor = "pointer";
    this.plantContainer.addChild(hitArea);

    hitArea.on("pointerover", () => {
      this.plantContainer.scale.set(1.035);
    });
    hitArea.on("pointerout", () => {
      this.plantContainer.scale.set(1.0);
    });
    hitArea.on("pointerdown", () => {
      this.plantContainer.scale.set(0.965);
    });
    hitArea.on("pointerup", () => {
      this.plantContainer.scale.set(1.035);
    });
    hitArea.on("pointerupoutside", () => {
      this.plantContainer.scale.set(1.0);
    });

    this.plantContainer.pivot.set(sw / 2, sh / 2);
    this.plantContainer.position.set(sw / 2, sh / 2);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.marketBackground?.removeFromParent();
    this.plantContainer.removeFromParent();
  }
}
