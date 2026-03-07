import { Container, Graphics, Text } from "pixi.js";

export const CROP_CONFIG: Record<
  string,
  {
    label: string;
    price: number;
    reward: number;
    category: "plant" | "animal" | "ground";
  }
> = {
  ground: { label: "🟫 Ground", price: 1, reward: 0, category: "ground" },
  corn: { label: "🌽 Corn", price: 1, reward: 5, category: "plant" },
  grape: { label: "🍇 Grape", price: 2, reward: 8, category: "plant" },
  strawberry: {
    label: "🍓 Strawberry",
    price: 3,
    reward: 12,
    category: "plant",
  },
  tomato: { label: "🍅 Tomato", price: 2, reward: 7, category: "plant" },
  chicken: { label: "🐔 Chicken", price: 3, reward: 10, category: "animal" },
  sheep: { label: "🐑 Sheep", price: 4, reward: 14, category: "animal" },
  cow: { label: "🐄 Cow", price: 5, reward: 18, category: "animal" },
};

export class CropSelector {
  private container = new Container();
  private onSelect: (crop: string) => void;

  constructor(onSelect: (crop: string) => void) {
    this.onSelect = onSelect;
  }

  show(
    stage: Container,
    screenX: number,
    screenY: number,
    coins: number,
    categories: ("plant" | "animal" | "ground")[],
  ) {
    this.hide();

    const filtered = Object.entries(CROP_CONFIG).filter(([, v]) =>
      categories.includes(v.category),
    );

    filtered.forEach(([key, crop], i) => {
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
