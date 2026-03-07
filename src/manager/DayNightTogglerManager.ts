import { Container, Graphics, Text } from "pixi.js";

export class DayNightToggle {
  private container = new Container();
  private isDay = true;

  create(stage: Container, onToggle: (isDay: boolean) => void) {
    const bg = new Graphics()
      .roundRect(0, 0, 80, 40, 20)
      .fill({ color: 0x4a90d9 });

    const label = new Text({
      text: "☀️",
      style: { fontSize: 22 },
    });
    label.anchor.set(0.5);
    label.position.set(40, 20);

    this.container.addChild(bg, label);
    this.container.eventMode = "dynamic";
    this.container.cursor = "pointer";
    this.container.position.set(20, 80);

    this.container.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      this.isDay = !this.isDay;

      (bg as any).clear();
      (bg as Graphics)
        .roundRect(0, 0, 80, 40, 20)
        .fill({ color: this.isDay ? 0x4a90d9 : 0x1a1a3e });
      label.text = this.isDay ? "☀️" : "🌙";

      onToggle(this.isDay);
    });

    stage.addChild(this.container);
  }
}
