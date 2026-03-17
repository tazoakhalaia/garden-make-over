import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class CoinUI {
  private container = new Container();
  private coinText!: Text;
  private coins = 0;

  create(uiLayer: Container, initialCoins = 500) {
    this.coins = initialCoins;

    const barWidth = 160;
    const barHeight = 52;
    const x = 16;
    const y = 16;

    const shadow = new Graphics()
      .roundRect(4, 4, barWidth, barHeight, barHeight / 2)
      .fill({ color: 0x000000 });
    shadow.alpha = 0.3;

    const bg = new Graphics()
      .roundRect(0, 0, barWidth, barHeight, barHeight / 2)
      .fill({ color: 0x0f172a });

    const border = new Graphics()
      .roundRect(0, 0, barWidth, barHeight, barHeight / 2)
      .stroke({ width: 2, color: 0xffd700, alpha: 0.6 });

    const coinCircle = new Graphics()
      .circle(barHeight / 2, barHeight / 2, 18)
      .fill({ color: 0xffd700 });

    const coinInner = new Graphics()
      .circle(barHeight / 2, barHeight / 2, 12)
      .fill({ color: 0xf59e0b });

    const coinSymbol = new Text({
      text: "₿",
      style: new TextStyle({
        fill: "#7c3f00",
        fontSize: 16,
        fontFamily: "LuckiestGuy Regular",
      }),
    });
    coinSymbol.anchor.set(0.5);
    coinSymbol.x = barHeight / 2;
    coinSymbol.y = barHeight / 2;

    this.coinText = new Text({
      text: this.coins.toString(),
      style: new TextStyle({
        fill: "#ffd700",
        fontSize: 22,
        fontFamily: "LuckiestGuy Regular",
      }),
    });
    this.coinText.anchor.set(0, 0.5);
    this.coinText.x = barHeight + 8;
    this.coinText.y = barHeight / 2;

    this.container.addChild(
      shadow,
      bg,
      border,
      coinCircle,
      coinInner,
      coinSymbol,
      this.coinText,
    );

    this.container.x = x;
    this.container.y = y;

    uiLayer.addChild(this.container);
  }

  add(amount: number) {
    this.coins += amount;
    this.updateText(true);
  }

  remove(amount: number): boolean {
    if (this.coins < amount) {
      this.flashInsufficient();
      return false;
    }
    this.coins -= amount;
    this.updateText(false);
    return true;
  }

  getCoins(): number {
    return this.coins;
  }

  private updateText(isAdd: boolean) {
    this.coinText.text = this.coins.toString();
    this.coinText.style.fill = isAdd ? "#00ff88" : "#ff4444";

    setTimeout(() => {
      if (this.coinText) this.coinText.style.fill = "#ffd700";
    }, 400);
  }

  private flashInsufficient() {
    this.coinText.style.fill = "#ff0000";
    let flashes = 0;
    const interval = setInterval(() => {
      this.coinText.visible = !this.coinText.visible;
      flashes++;
      if (flashes >= 6) {
        clearInterval(interval);
        this.coinText.visible = true;
        this.coinText.style.fill = "#ffd700";
      }
    }, 80);
  }

  destroy() {
    this.container.removeFromParent();
  }
}
