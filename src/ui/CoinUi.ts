import { Assets, Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export class CoinUI {
  private container = new Container();
  private label!: Text;
  private coins = 100;

  create(stage: Container) {
    const bg = new Graphics()
      .roundRect(0, 0, 120, 44, 12)
      .fill({ color: 0x2d2d2d });

    const texture = Assets.get<Texture>("coin");
    const icon = new Sprite(texture);
    icon.width = 28;
    icon.height = 28;
    icon.position.set(8, 8);

    this.label = new Text({
      text: `${this.coins}`,
      style: { fontSize: 20, fill: 0xffd700, fontWeight: "bold" },
    });
    this.label.position.set(44, 10);

    (this.container as any).__isCoinBar = true;

    this.container.addChild(bg, icon, this.label);
    this.container.position.set(20, 20);
    stage.addChild(this.container);
  }

  /** Center of the coin icon in screen space — pass this to FloatingCoin.spawn */
  get barTarget(): { x: number; y: number } {
    return {
      x: this.container.position.x + 22,
      y: this.container.position.y + 22,
    };
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
    this.label.text = `${this.coins}`;
  }

  get total() {
    return this.coins;
  }
}
