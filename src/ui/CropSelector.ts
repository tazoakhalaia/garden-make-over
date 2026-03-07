import { Container, Graphics, Text } from "pixi.js";

export const CROP_CONFIG: Record<string, { label: string; price: number; reward: number }> = {
  corn: { label: "🌽 Corn", price: 1, reward: 5 },
  grape: { label: "🍇 Grape", price: 2, reward: 8 },
  strawberry: { label: "🍓 Strawberry", price: 3, reward: 12 },
  tomato: { label: "🍅 Tomato", price: 2, reward: 7 },
  chicken: { label: "🐔 Chicken", price: 3, reward: 10 },
  sheep: { label: "🐑 Sheep", price: 4, reward: 14 },
  cow: { label: "🐄 Cow", price: 5, reward: 18 },
};

export class CropSelector {
  private container = new Container();
  private onSelect: (crop: string) => void;

  constructor(onSelect: (crop: string) => void) {
    this.onSelect = onSelect;
  }

  show(stage: Container, screenX: number, screenY: number, coins: number) {
    this.hide();

    Object.entries(CROP_CONFIG).forEach(([key, crop], i) => {
      const canAfford = coins >= crop.price;

      const btn = new Graphics()
        .roundRect(0, 0, 160, 44, 8)
        .fill({ color: canAfford ? 0x4caf50 : 0x888888 });

      btn.position.set(screenX, screenY + i * 54);
      btn.eventMode = canAfford ? "dynamic" : "none";
      btn.cursor = canAfford ? "pointer" : "default";
      btn.alpha = canAfford ? 1 : 0.6;

      const label = new Text({
        text: `${crop.label}  🪙${crop.price}`,
        style: { fontSize: 14, fill: 0xffffff },
      });
      label.position.set(10, 13);
      btn.addChild(label);

      btn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this.onSelect(key);
        this.hide();
      });

      this.container.addChild(btn);
    });

    stage.addChild(this.container);
  }

  hide() {
    this.container.removeChildren();
    this.container.parent?.removeChild(this.container);
  }
}