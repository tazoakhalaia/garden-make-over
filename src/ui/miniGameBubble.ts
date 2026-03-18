import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class MiniGameBubble {
  private container: Container | null = null;
  private snowContainer: Container | null = null;
  private snowActive = false;

  create(parent: Container, onOpen: () => void, onSnowToggle: () => void) {
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
      text: "EARNING",
      style: new TextStyle({
        fontSize: 8,
        fill: 0xaad4aa,
        letterSpacing: 1,
      }),
    });
    label.anchor.set(0.5);
    label.x = 32;
    label.y = 50;
    this.container.addChild(label);

    this.container.x = 20;
    this.container.y = 90;

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

    this.snowContainer = new Container();
    this.snowContainer.eventMode = "static";
    this.snowContainer.cursor = "pointer";

    const snowShadow = new Graphics();
    snowShadow.circle(34, 36, 32).fill({ color: 0x000000, alpha: 0.18 });
    this.snowContainer.addChild(snowShadow);

    const snowBg = new Graphics();
    snowBg.circle(32, 32, 32).fill({ color: 0x1a3a5c });
    this.snowContainer.addChild(snowBg);

    const snowRing = new Graphics();
    snowRing.circle(32, 32, 32).stroke({ color: 0x90caf9, width: 3 });
    this.snowContainer.addChild(snowRing);

    const snowIcon = new Text({
      text: "❄️",
      style: new TextStyle({ fontSize: 26 }),
    });
    snowIcon.anchor.set(0.5);
    snowIcon.x = 32;
    snowIcon.y = 26;
    this.snowContainer.addChild(snowIcon);

    const snowLabel = new Text({
      text: "SNOW",
      style: new TextStyle({
        fontSize: 8,
        fill: 0x90caf9,
        letterSpacing: 1,
      }),
    });
    snowLabel.anchor.set(0.5);
    snowLabel.x = 32;
    snowLabel.y = 50;
    this.snowContainer.addChild(snowLabel);

    this.snowContainer.x = 20;
    this.snowContainer.y = 165;

    this.snowContainer.on("pointerdown", () => {
      this.snowContainer!.scale.set(0.9);
    });
    this.snowContainer.on("pointerup", () => {
      this.snowContainer!.scale.set(1);
      this.snowActive = !this.snowActive;

      snowBg.clear();
      snowBg
        .circle(32, 32, 32)
        .fill({ color: this.snowActive ? 0x4a90d9 : 0x1a3a5c });

      onSnowToggle();
    });
    this.snowContainer.on("pointerupoutside", () => {
      this.snowContainer!.scale.set(1);
    });

    parent.addChild(this.snowContainer);
  }

  destroy() {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
    if (this.snowContainer) {
      this.snowContainer.destroy({ children: true });
      this.snowContainer = null;
    }
  }
}
