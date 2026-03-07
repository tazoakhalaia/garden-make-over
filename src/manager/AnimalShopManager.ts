import { Container, Graphics, Text } from "pixi.js";

export const ANIMALS = [
  { name: "chicken", label: "🐔", price: 3, reward: 10 },
  { name: "sheep", label: "🐑", price: 4, reward: 14 },
  { name: "cow", label: "🐄", price: 5, reward: 18 },
];

export class AnimalShop {
  private container = new Container();
  selectedAnimal: string | null = null;
  private onSelect: (animal: string | null) => void;

  constructor(onSelect: (animal: string | null) => void) {
    this.onSelect = onSelect;
  }

  create(stage: Container, coins: number) {
    this.container.removeChildren();

    const bg = new Graphics()
      .roundRect(0, 0, 70, ANIMALS.length * 70 + 10, 12)
      .fill({ color: 0x2d2d2d });
    this.container.addChild(bg);

    ANIMALS.forEach((animal, i) => {
      const isSelected = this.selectedAnimal === animal.name;
      const canAfford = coins >= animal.price;

      const btn = new Graphics().roundRect(5, 5 + i * 70, 60, 60, 10).fill({
        color: isSelected ? 0xffa000 : canAfford ? 0x4caf50 : 0x888888,
      });

      btn.eventMode = canAfford ? "dynamic" : "none";
      btn.cursor = canAfford ? "pointer" : "default";
      btn.alpha = canAfford ? 1 : 0.5;

      const icon = new Text({ text: animal.label, style: { fontSize: 24 } });
      icon.anchor.set(0.5);
      icon.position.set(35, 30 + i * 70);

      const price = new Text({
        text: `🪙${animal.price}`,
        style: { fontSize: 11, fill: 0xffffff },
      });
      price.anchor.set(0.5);
      price.position.set(35, 55 + i * 70);

      btn.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        this.selectedAnimal =
          this.selectedAnimal === animal.name ? null : animal.name;
        this.onSelect(this.selectedAnimal);
        this.refresh(stage, coins);
      });

      this.container.addChild(btn, icon, price);
    });

    this.container.position.set(
      window.innerWidth - 90,
      window.innerHeight / 2 - 100,
    );
    stage.addChild(this.container);
  }

  refresh(stage: Container, coins: number) {
    stage.removeChild(this.container);
    this.create(stage, coins);
  }
}
