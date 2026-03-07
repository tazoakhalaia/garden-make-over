import { Container, Graphics, Text } from "pixi.js";

export class CoinUI {
  private container = new Container();
  private label!: Text;
  private coins = 100;

  create(stage: Container) {
    const bg = new Graphics()
      .roundRect(0, 0, 120, 44, 12)
      .fill({ color: 0x2d2d2d });
    this.label = new Text({
      text: `🪙 ${this.coins}`,
      style: { fontSize: 20, fill: 0xffd700, fontWeight: "bold" },
    });
    this.label.position.set(12, 10);
    this.container.addChild(bg, this.label);
    this.container.position.set(20, 20);
    stage.addChild(this.container);
  }

  add(amount: number) {
    this.coins += amount;
    this.update();
  }

  spend(amount: number): boolean {
    if (this.coins < amount) return false;
    this.coins -= amount;
    this.update();
    return true;
  }

  private update() {
    this.label.text = `🪙 ${this.coins}`;
  }

  get total() {
    return this.coins;
  }
}
