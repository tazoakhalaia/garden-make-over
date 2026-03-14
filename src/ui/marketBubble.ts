import { Graphics, type Container } from "pixi.js";

export class MarketBubble {
  createBubble(container: Container) {
    const marketG = new Graphics().rect(0, 0, 100, 100).fill({ color: "red" });
    marketG.label = "marketBubble";
    container.addChild(marketG);
  }
}
