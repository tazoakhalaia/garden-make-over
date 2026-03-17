import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { AudioManager } from "../config/audioManager";

export class MuteButton {
  private container: Container | null = null;
  private icon!: Text;
  private audioManager = new AudioManager();
  create(parent: Container): void {
    this.container = new Container();
    this.container.eventMode = "static";
    this.container.cursor = "pointer";

    const SIZE = this.btnSize();

    const bg = new Graphics();
    bg.circle(SIZE / 2, SIZE / 2, SIZE / 2).fill({ color: 0x1a2e1a });
    bg.circle(SIZE / 2, SIZE / 2, SIZE / 2).stroke({
      color: 0x4caf50,
      width: 2,
    });
    this.container.addChild(bg);

    this.icon = new Text({
      text: this.audioManager.isMuted() ? "🔇" : "🔊",
      style: new TextStyle({ fontSize: Math.round(SIZE * 0.5) }),
    });
    this.icon.anchor.set(0.5);
    this.icon.x = SIZE / 2;
    this.icon.y = SIZE / 2;
    this.container.addChild(this.icon);

    this.container.on("pointerdown", () => {
      this.container!.alpha = 0.7;
    });
    this.container.on("pointerup", () => {
      this.container!.alpha = 1;
      const muted = this.audioManager.toggleMute();
      this.icon.text = muted ? "🔇" : "🔊";
    });
    this.container.on("pointerupoutside", () => {
      this.container!.alpha = 1;
    });

    parent.addChild(this.container);
    this.reposition();
  }

  reposition(): void {
    if (!this.container) return;
    const SIZE = this.btnSize();
    const margin = this.margin();
    this.container.x = window.innerWidth - SIZE - margin;
    this.container.y = margin;
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  private btnSize(): number {
    const w = window.innerWidth;
    if (w < 400) return 40;
    if (w < 768) return 48;
    return 54;
  }

  private margin(): number {
    return window.innerWidth < 768 ? 12 : 20;
  }
}
