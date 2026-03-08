import { Container, Graphics, Sprite, Text } from "pixi.js";
import type { CropEntry } from "../config/CropConfig";
import { addCoinSprite, drawGradientCard, tryGetTexture } from "./drawUtils";

const ITEM_H = 88;
const COIN_SIZE = 20;
const IMG_SIZE = 52;

export function buildCropItem(
  container: Container,
  key: string,
  crop: CropEntry,
  btnX: number,
  btnY: number,
  btnW: number,
  canAfford: boolean,
  onSelect: (key: string) => void,
  keepOpen: boolean,
  hide: () => void,
) {
  const cardShadow = new Graphics()
    .roundRect(2, 3, btnW, ITEM_H, 14)
    .fill({ color: 0x000000, alpha: canAfford ? 0.35 : 0.15 });
  cardShadow.position.set(btnX, btnY);
  container.addChild(cardShadow);

  const btn = new Graphics();
  drawGradientCard(
    btn,
    btnW,
    ITEM_H,
    14,
    canAfford ? 0x1b5230 : 0x161d19,
    canAfford ? 0x122e1d : 0x101510,
    8,
  );
  btn.position.set(btnX, btnY);
  btn.eventMode = canAfford ? "dynamic" : "none";
  btn.cursor = canAfford ? "pointer" : "default";
  btn.alpha = canAfford ? 1 : 0.42;
  container.addChild(btn);

  const cardBorder = new Graphics().roundRect(0, 0, btnW, ITEM_H, 14).stroke({
    color: canAfford ? 0x3ddc6e : 0x2a3a2e,
    width: 1.2,
    alpha: canAfford ? 0.5 : 0.25,
  });
  cardBorder.position.set(btnX, btnY);
  container.addChild(cardBorder);

  if (canAfford) {
    const stripe = new Graphics()
      .roundRect(0, 12, 3, ITEM_H - 24, 3)
      .fill({ color: 0x3ddc6e, alpha: 0.85 });
    stripe.position.set(btnX + 1, btnY);
    container.addChild(stripe);
  }

  const texture = tryGetTexture(key);
  if (texture) {
    const sprite = new Sprite(texture);
    sprite.width = IMG_SIZE;
    sprite.height = IMG_SIZE;
    sprite.anchor.set(0.5);
    sprite.position.set(btnX + 38, btnY + ITEM_H / 2);
    container.addChild(sprite);
  } else {
    const iconBubble = new Graphics()
      .circle(0, 0, 26)
      .fill({ color: canAfford ? 0x0d2a14 : 0x111811, alpha: 0.8 });
    iconBubble.position.set(btnX + 38, btnY + ITEM_H / 2);
    container.addChild(iconBubble);

    const emoji = new Text({
      text: crop.label.split(" ")[0],
      style: { fontSize: 30 },
    });
    emoji.anchor.set(0.5);
    emoji.position.set(btnX + 38, btnY + ITEM_H / 2);
    container.addChild(emoji);
  }

  const nameText = new Text({
    text: crop.label.replace(/^\S+\s/, "").toUpperCase(),
    style: {
      fontSize: 16,
      fill: canAfford ? 0xe8fff0 : 0x4a5e50,
      fontWeight: "bold",
      letterSpacing: 2,
      fontFamily: "Georgia, serif",
    },
  });
  nameText.position.set(btnX + 72, btnY + 18);
  container.addChild(nameText);

  buildBadge(container, crop, btnX, btnY, canAfford);

  buildPricePill(container, crop.price, btnX, btnY, btnW, canAfford);

  if (canAfford) {
    const shimmer = new Graphics()
      .roundRect(0, 0, btnW, ITEM_H / 2, 14)
      .fill({ color: 0xffffff, alpha: 0.025 });
    shimmer.position.set(btnX, btnY);
    container.addChild(shimmer);
  }

  btn.on("pointerdown", (e) => {
    e.stopPropagation();
    onSelect(key);
    if (!keepOpen) hide();
  });
}

function buildBadge(
  container: Container,
  crop: CropEntry,
  btnX: number,
  btnY: number,
  canAfford: boolean,
) {
  if (crop.reward > 0) {
    const badgeBg = new Graphics()
      .roundRect(0, 0, 80, 22, 11)
      .fill({ color: canAfford ? 0x0d3d1f : 0x0d1e11 });
    badgeBg.position.set(btnX + 72, btnY + 44);
    container.addChild(badgeBg);

    addCoinSprite(container, btnX + 84, btnY + 55, 14);

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
    container.addChild(rewardText);
    return;
  }

  const tag =
    crop.category === "ground"
      ? "TERRAIN"
      : crop.category === "animal"
        ? "LIVESTOCK"
        : null;

  if (tag) {
    const tagText = new Text({
      text: tag,
      style: {
        fontSize: 11,
        fill: canAfford ? 0x8ab88f : 0x3a5a3e,
        letterSpacing: 2,
      },
    });
    tagText.position.set(btnX + 72, btnY + 48);
    container.addChild(tagText);
  }
}

function buildPricePill(
  container: Container,
  price: number,
  btnX: number,
  btnY: number,
  btnW: number,
  canAfford: boolean,
) {
  const pillW = 72;
  const pillH = 34;
  const pillX = btnX + btnW - pillW - 12;
  const pillY = btnY + (ITEM_H - pillH) / 2;

  const pill = new Graphics()
    .roundRect(0, 0, pillW, pillH, 10)
    .fill({ color: canAfford ? 0x0d3a18 : 0x0f1812 });
  pill.position.set(pillX, pillY);
  container.addChild(pill);

  const pillBorder = new Graphics()
    .roundRect(0, 0, pillW, pillH, 10)
    .stroke({ color: canAfford ? 0xffe082 : 0x2a3020, width: 1 });
  pillBorder.position.set(pillX, pillY);
  container.addChild(pillBorder);

  addCoinSprite(container, pillX + 14, pillY + pillH / 2, COIN_SIZE);

  const priceText = new Text({
    text: `${price}`,
    style: {
      fontSize: 15,
      fill: canAfford ? 0xffe082 : 0x404a3a,
      fontWeight: "bold",
    },
  });
  priceText.anchor.set(0, 0.5);
  priceText.position.set(pillX + 26, pillY + pillH / 2);
  container.addChild(priceText);
}

export { ITEM_H };
