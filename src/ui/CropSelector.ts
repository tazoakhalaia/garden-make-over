import { Container, Graphics, Text } from "pixi.js";

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
  ) {
    this.hideOnly();

    const W = window.innerWidth;
    const H = window.innerHeight;

    const overlay = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x000000, alpha: 0.5 });
    overlay.eventMode = "static";
    overlay.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    this.container.addChild(overlay);

    const filtered = Object.entries(CROP_CONFIG).filter(([, v]) =>
      categories.includes(v.category),
    );

    const panelW = 220;
    const panelH = filtered.length * 60 + 70;
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;

    const panel = new Graphics()
      .roundRect(0, 0, panelW, panelH, 16)
      .fill({ color: 0x1e1e1e });
    panel.position.set(panelX, panelY);
    panel.eventMode = "static";
    panel.addEventListener("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(panel);

    const title = new Text({
      text: "Choose",
      style: { fontSize: 16, fill: 0xffffff, fontWeight: "bold" },
    });
    title.anchor.set(0.5, 0);
    title.position.set(panelX + panelW / 2, panelY + 12);
    this.container.addChild(title);

    filtered.forEach(([key, crop], i) => {
      const canAfford = coins >= crop.price;

      const btn = new Graphics()
        .roundRect(0, 0, panelW - 20, 48, 10)
        .fill({ color: canAfford ? 0x4caf50 : 0x555555 });

      btn.position.set(panelX + 10, panelY + 44 + i * 58);
      btn.eventMode = canAfford ? "dynamic" : "none";
      btn.cursor = canAfford ? "pointer" : "default";
      btn.alpha = canAfford ? 1 : 0.5;

      const label = new Text({
        text: `${crop.label}  🪙${crop.price}`,
        style: { fontSize: 14, fill: 0xffffff },
      });
      label.position.set(12, 14);
      btn.addChild(label);

      btn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this.onSelect(key);
        if (!keepOpen) this.hide();
      });

      this.container.addChild(btn);
    });

    const closeBtn = new Graphics()
      .roundRect(0, 0, panelW - 20, 38, 10)
      .fill({ color: 0xe53935 });
    closeBtn.position.set(panelX + 10, panelY + panelH - 48);
    closeBtn.eventMode = "dynamic";
    closeBtn.cursor = "pointer";

    const closeLabel = new Text({
      text: "✕ Close",
      style: { fontSize: 13, fill: 0xffffff },
    });
    closeLabel.position.set(12, 10);
    closeBtn.addChild(closeLabel);

    closeBtn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.hide();
    });

    this.container.addChild(closeBtn);
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
