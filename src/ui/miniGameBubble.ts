import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class MiniGameBubble {
  private container: Container | null = null;

  create(parent: Container, onOpen: () => void) {
    this.container = new Container();
    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    const shadow = new Graphics();
    shadow.circle(34, 36, 32).fill({ color: 0x000000, alpha: 0.18 });
    this.container.addChild(shadow);

    const bg = new Graphics();
    bg.circle(32, 32, 32).fill({ color: 0x2d5a27 });
    this.container.addChild(bg);

    const ring = new Graphics();
    ring.circle(32, 32, 32).stroke({ color: 0x4caf50, width: 3 });
    this.container.addChild(ring);

    const icon = new Text({
      text: "🌾",
      style: new TextStyle({ fontSize: 26 }),
    });
    icon.anchor.set(0.5);
    icon.x = 32;
    icon.y = 26;
    this.container.addChild(icon);

    const label = new Text({
      text: "PLAY",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: 9,
        fontWeight: "bold",
        fill: 0xaad4aa,
        letterSpacing: 1,
      }),
    });
    label.anchor.set(0.5);
    label.x = 32;
    label.y = 50;
    this.container.addChild(label);

    this.container.x = 20;
    this.container.y = window.innerHeight - 90;

    this.container.on("pointerdown", () => {
      this.container!.scale.set(0.9);
    });
    this.container.on("pointerup", () => {
      this.container!.scale.set(1);
      onOpen();
    });
    this.container.on("pointerupoutside", () => {
      this.container!.scale.set(1);
    });

    parent.addChild(this.container);
  }

  reposition() {
    if (this.container) {
      this.container.y = window.innerHeight - 90;
    }
  }

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }
}
