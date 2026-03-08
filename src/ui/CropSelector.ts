import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export const CROP_CONFIG: Record<
  string,
  {
    label: string;
    price: number;
    reward: number;
    category: "plant" | "ground" | "animal";
  }
> = {
  ground: { label: "🟫 Buy Ground", price: 1, reward: 0, category: "ground" },
  fence: { label: "🪵 Buy Fence", price: 2, reward: 0, category: "ground" },
  corn: { label: "🌽 Corn", price: 1, reward: 5, category: "plant" },
  grape: { label: "🍇 Grape", price: 2, reward: 8, category: "plant" },
  strawberry: {
    label: "🍓 Strawberry",
    price: 3,
    reward: 12,
    category: "plant",
  },
  tomato: { label: "🍅 Tomato", price: 2, reward: 7, category: "plant" },
  chicken: { label: "🐔 Chicken", price: 3, reward: 0, category: "animal" },
  sheep: { label: "🐑 Sheep", price: 4, reward: 0, category: "animal" },
  cow: { label: "🐄 Cow", price: 5, reward: 0, category: "animal" },
};

function tryGetTexture(key: string): Texture | null {
  try {
    const tex = Assets.get<Texture>(key);
    if (!tex || tex === Texture.WHITE) return null;
    return tex;
  } catch {
    return null;
  }
}

function getCoinTexture(): Texture | null {
  return tryGetTexture("coin");
}

function addCoinSprite(
  container: Container,
  x: number,
  y: number,
  size: number,
): void {
  const tex = getCoinTexture();
  if (tex) {
    const sprite = new Sprite(tex);
    sprite.width = size;
    sprite.height = size;
    sprite.anchor.set(0.5);
    sprite.position.set(x, y);
    container.addChild(sprite);
  } else {
    const dot = new Graphics().circle(0, 0, size / 2).fill({ color: 0xffe082 });
    dot.position.set(x, y);
    container.addChild(dot);
  }
}

function drawGradientCard(
  g: Graphics,
  w: number,
  h: number,
  r: number,
  colorTop: number,
  colorBot: number,
  steps = 12,
) {
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r1 =
      ((colorTop >> 16) & 0xff) +
      t * (((colorBot >> 16) & 0xff) - ((colorTop >> 16) & 0xff));
    const g1 =
      ((colorTop >> 8) & 0xff) +
      t * (((colorBot >> 8) & 0xff) - ((colorTop >> 8) & 0xff));
    const b1 = (colorTop & 0xff) + t * ((colorBot & 0xff) - (colorTop & 0xff));
    const color =
      (Math.round(r1) << 16) | (Math.round(g1) << 8) | Math.round(b1);
    const sliceY = (h / steps) * i;
    const sliceH = h / steps + 1;
    if (i === 0) {
      g.roundRect(0, sliceY, w, sliceH, r).fill({ color });
    } else if (i === steps - 1) {
      g.roundRect(0, sliceY, w, sliceH, r).fill({ color });
    } else {
      g.rect(0, sliceY, w, sliceH).fill({ color });
    }
  }
}

export class CropSelector {
  private container = new Container();
  private onSelect: (crop: string) => void;
  private onClose?: () => void;

  constructor(onSelect: (crop: string) => void, onClose?: () => void) {
    this.onSelect = onSelect;
    this.onClose = onClose;
  }

  show(
    stage: Container,
    _x: number,
    _y: number,
    coins: number,
    categories: ("plant" | "ground" | "animal")[],
    keepOpen = false,
    disableClose = false,
  ) {
    this.hideOnly();

    const W = window.innerWidth;
    const H = window.innerHeight;

    const overlay = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x020b05, alpha: 0.82 });
    overlay.eventMode = "static";
    overlay.on("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(overlay);

    const filtered = Object.entries(CROP_CONFIG).filter(([, v]) =>
      categories.includes(v.category),
    );

    const ITEM_H = 88;
    const GAP = 10;
    const SIDE_PAD = 24;
    const HEADER_H = 100;
    const FOOTER_H = 72;
    const panelW = 400;
    const panelH =
      HEADER_H + filtered.length * (ITEM_H + GAP) - GAP + FOOTER_H + 20;

    const panelX = Math.round(W / 2 - panelW / 2);
    const panelY = Math.round(H / 2 - panelH / 2);

    for (let s = 5; s >= 1; s--) {
      const shadow = new Graphics()
        .roundRect(panelX + s * 3, panelY + s * 4, panelW, panelH, 22)
        .fill({ color: 0x000000, alpha: 0.18 * s });
      this.container.addChild(shadow);
    }

    const panelBg = new Graphics();
    drawGradientCard(panelBg, panelW, panelH, 22, 0x0e2016, 0x09160d, 16);
    panelBg.position.set(panelX, panelY);
    panelBg.eventMode = "static";
    panelBg.on("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(panelBg);

    const outerBorder = new Graphics()
      .roundRect(panelX, panelY, panelW, panelH, 22)
      .stroke({ color: 0x3ddc6e, width: 1.5, alpha: 0.55 });
    this.container.addChild(outerBorder);

    const innerBorder = new Graphics()
      .roundRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 20)
      .stroke({ color: 0xaaffd0, width: 0.8, alpha: 0.12 });
    this.container.addChild(innerBorder);

    const headerBar = new Graphics();
    drawGradientCard(headerBar, panelW, HEADER_H, 22, 0x1a4a28, 0x0e2016, 8);
    headerBar.position.set(panelX, panelY);
    this.container.addChild(headerBar);

    const headerDivider = new Graphics()
      .rect(panelX + SIDE_PAD, panelY + HEADER_H - 1, panelW - SIDE_PAD * 2, 1)
      .fill({ color: 0x3ddc6e, alpha: 0.3 });
    this.container.addChild(headerDivider);

    for (let d = 0; d < 5; d++) {
      const dot = new Graphics()
        .circle(0, 0, 3 - d * 0.3)
        .fill({ color: 0x3ddc6e, alpha: 0.55 - d * 0.08 });
      dot.position.set(panelX + SIDE_PAD + 10 + d * 16, panelY + HEADER_H - 14);
      this.container.addChild(dot);
    }

    const leafIcon = new Text({ text: "🌿", style: { fontSize: 28 } });
    leafIcon.anchor.set(0.5);
    leafIcon.position.set(panelX + panelW / 2 - 72, panelY + 38);
    this.container.addChild(leafIcon);

    const title = new Text({
      text: "MARKET",
      style: {
        fontSize: 30,
        fill: 0xc8ffd9,
        fontWeight: "bold",
        letterSpacing: 8,
        fontFamily: "Georgia, serif",
      },
    });
    title.anchor.set(0, 0.5);
    title.position.set(panelX + panelW / 2 - 56, panelY + 38);
    this.container.addChild(title);

    const subtitle = new Text({
      text: `${coins} coins available`,
      style: {
        fontSize: 13,
        fill: 0x6fcf8a,
        letterSpacing: 2,
        fontFamily: "monospace",
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(panelX + panelW / 2, panelY + 68);
    this.container.addChild(subtitle);

    addCoinSprite(
      this.container,
      panelX + panelW / 2 - subtitle.width / 2 - 14,
      panelY + 68,
      14,
    );

    filtered.forEach(([key, crop], i) => {
      const canAfford = coins >= crop.price;
      const btnY = panelY + HEADER_H + 12 + i * (ITEM_H + GAP);
      const btnX = panelX + SIDE_PAD;
      const btnW = panelW - SIDE_PAD * 2;

      const cardShadow = new Graphics()
        .roundRect(2, 3, btnW, ITEM_H, 14)
        .fill({ color: 0x000000, alpha: canAfford ? 0.35 : 0.15 });
      cardShadow.position.set(btnX, btnY);
      this.container.addChild(cardShadow);

      const btn = new Graphics();
      if (canAfford) {
        drawGradientCard(btn, btnW, ITEM_H, 14, 0x1b5230, 0x122e1d, 8);
      } else {
        drawGradientCard(btn, btnW, ITEM_H, 14, 0x161d19, 0x101510, 8);
      }
      btn.position.set(btnX, btnY);
      btn.eventMode = canAfford ? "dynamic" : "none";
      btn.cursor = canAfford ? "pointer" : "default";
      btn.alpha = canAfford ? 1 : 0.42;
      this.container.addChild(btn);

      const cardBorder = new Graphics()
        .roundRect(0, 0, btnW, ITEM_H, 14)
        .stroke({
          color: canAfford ? 0x3ddc6e : 0x2a3a2e,
          width: 1.2,
          alpha: canAfford ? 0.5 : 0.25,
        });
      cardBorder.position.set(btnX, btnY);
      this.container.addChild(cardBorder);

      if (canAfford) {
        const stripe = new Graphics()
          .roundRect(0, 12, 3, ITEM_H - 24, 3)
          .fill({ color: 0x3ddc6e, alpha: 0.85 });
        stripe.position.set(btnX + 1, btnY);
        this.container.addChild(stripe);
      }

      const IMG_SIZE = 52;
      const texture = tryGetTexture(key);
      if (texture) {
        const sprite = new Sprite(texture);
        sprite.width = IMG_SIZE;
        sprite.height = IMG_SIZE;
        sprite.anchor.set(0.5);
        sprite.position.set(btnX + 38, btnY + ITEM_H / 2);
        this.container.addChild(sprite);
      } else {
        const iconBubble = new Graphics()
          .circle(0, 0, 26)
          .fill({ color: canAfford ? 0x0d2a14 : 0x111811, alpha: 0.8 });
        iconBubble.position.set(btnX + 38, btnY + ITEM_H / 2);
        this.container.addChild(iconBubble);

        const emoji = new Text({
          text: crop.label.split(" ")[0],
          style: { fontSize: 30 },
        });
        emoji.anchor.set(0.5);
        emoji.position.set(btnX + 38, btnY + ITEM_H / 2);
        this.container.addChild(emoji);
      }

      const cropName = crop.label.replace(/^\S+\s/, "");
      const nameText = new Text({
        text: cropName.toUpperCase(),
        style: {
          fontSize: 16,
          fill: canAfford ? 0xe8fff0 : 0x4a5e50,
          fontWeight: "bold",
          letterSpacing: 2,
          fontFamily: "Georgia, serif",
        },
      });
      nameText.position.set(btnX + 72, btnY + 18);
      this.container.addChild(nameText);

      if (crop.reward > 0) {
        const badgeBg = new Graphics()
          .roundRect(0, 0, 80, 22, 11)
          .fill({ color: canAfford ? 0x0d3d1f : 0x0d1e11 });
        badgeBg.position.set(btnX + 72, btnY + 44);
        this.container.addChild(badgeBg);

        addCoinSprite(this.container, btnX + 84, btnY + 55, 14);

        const rewardText = new Text({
          text: `+${crop.reward}`,
          style: {
            fontSize: 12,
            fill: canAfford ? 0x5fffaa : 0x2a5a35,
            fontWeight: "bold",
          },
        });
        rewardText.anchor.set(0, 0.5);
        rewardText.position.set(btnX + 94, btnY + 55);
        this.container.addChild(rewardText);
      } else if (crop.category === "ground") {
        const tagText = new Text({
          text: "TERRAIN",
          style: {
            fontSize: 11,
            fill: canAfford ? 0x8ab88f : 0x3a5a3e,
            letterSpacing: 2,
          },
        });
        tagText.position.set(btnX + 72, btnY + 48);
        this.container.addChild(tagText);
      } else if (crop.category === "animal") {
        const tagText = new Text({
          text: "LIVESTOCK",
          style: {
            fontSize: 11,
            fill: canAfford ? 0x8ab88f : 0x3a5a3e,
            letterSpacing: 2,
          },
        });
        tagText.position.set(btnX + 72, btnY + 48);
        this.container.addChild(tagText);
      }

      const COIN_SIZE = 20;
      const priceNumStr = `${crop.price}`;
      const pricePillW = 72;
      const pricePillH = 34;
      const pillX = btnX + btnW - pricePillW - 12;
      const pillY = btnY + (ITEM_H - pricePillH) / 2;

      const pricePill = new Graphics()
        .roundRect(0, 0, pricePillW, pricePillH, 10)
        .fill({ color: canAfford ? 0x0d3a18 : 0x0f1812 });
      pricePill.position.set(pillX, pillY);
      this.container.addChild(pricePill);

      const pricePillBorder = new Graphics()
        .roundRect(0, 0, pricePillW, pricePillH, 10)
        .stroke({ color: canAfford ? 0xffe082 : 0x2a3020, width: 1 });
      pricePillBorder.position.set(pillX, pillY);
      this.container.addChild(pricePillBorder);

      addCoinSprite(
        this.container,
        pillX + 14,
        pillY + pricePillH / 2,
        COIN_SIZE,
      );

      const priceText = new Text({
        text: priceNumStr,
        style: {
          fontSize: 15,
          fill: canAfford ? 0xffe082 : 0x404a3a,
          fontWeight: "bold",
        },
      });
      priceText.anchor.set(0, 0.5);
      priceText.position.set(pillX + 26, pillY + pricePillH / 2);
      this.container.addChild(priceText);

      if (canAfford) {
        const shimmer = new Graphics()
          .roundRect(0, 0, btnW, ITEM_H / 2, 14)
          .fill({ color: 0xffffff, alpha: 0.025 });
        shimmer.position.set(btnX, btnY);
        this.container.addChild(shimmer);
      }

      btn.on("pointerdown", (e) => {
        e.stopPropagation();
        this.onSelect(key);
        if (!keepOpen) this.hide();
      });
    });

    const closeBtnW = panelW - SIDE_PAD * 2;
    const closeBtnH = 44;
    const closeBtnX = panelX + SIDE_PAD;
    const closeBtnY = panelY + panelH - closeBtnH - 14;

    const closeShadow = new Graphics()
      .roundRect(2, 3, closeBtnW, closeBtnH, 13)
      .fill({ color: 0x000000, alpha: 0.3 });
    closeShadow.position.set(closeBtnX, closeBtnY);
    this.container.addChild(closeShadow);

    const closeBtn = new Graphics();
    if (disableClose) {
      drawGradientCard(
        closeBtn,
        closeBtnW,
        closeBtnH,
        13,
        0x1a1a1a,
        0x111111,
        6,
      );
    } else {
      drawGradientCard(
        closeBtn,
        closeBtnW,
        closeBtnH,
        13,
        0x5c1a1a,
        0x3a0f0f,
        6,
      );
    }
    closeBtn.position.set(closeBtnX, closeBtnY);
    closeBtn.eventMode = disableClose ? "none" : "dynamic";
    closeBtn.cursor = disableClose ? "default" : "pointer";
    closeBtn.alpha = disableClose ? 0.38 : 1;
    this.container.addChild(closeBtn);

    const closeBtnBorder = new Graphics()
      .roundRect(0, 0, closeBtnW, closeBtnH, 13)
      .stroke({
        color: disableClose ? 0x333333 : 0xff6b6b,
        width: 1.2,
        alpha: 0.55,
      });
    closeBtnBorder.position.set(closeBtnX, closeBtnY);
    this.container.addChild(closeBtnBorder);

    const closeText = new Text({
      text: disableClose ? "🔒  LOCKED" : "✕  CLOSE",
      style: {
        fontSize: 15,
        fill: disableClose ? 0x555555 : 0xff9999,
        fontWeight: "bold",
        letterSpacing: 3,
        fontFamily: "Georgia, serif",
      },
    });
    closeText.anchor.set(0.5);
    closeText.position.set(
      closeBtnX + closeBtnW / 2,
      closeBtnY + closeBtnH / 2,
    );
    this.container.addChild(closeText);

    if (!disableClose) {
      closeBtn.on("pointerdown", (e) => {
        e.stopPropagation();
        this.hide();
      });
    }

    stage.addChild(this.container);
  }

  private hideOnly() {
    this.container.removeChildren();
    this.container.parent?.removeChild(this.container);
  }

  hide() {
    this.container.removeChildren();
    this.container.parent?.removeChild(this.container);
    this.onClose?.();
  }
}
