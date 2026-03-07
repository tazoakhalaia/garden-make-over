import { Container, Graphics, Text } from "pixi.js";
import { Camera, Vector3 } from "three";
import gsap from "gsap";

export class FloatingCoin {
  private container = new Container();
  private collected = false;
  private animFrameId: number | null = null;

  spawn(
    stage: Container,
    worldPosition: Vector3,
    camera: Camera,
    canvas: HTMLCanvasElement,
    onCollect: () => void,
  ) {
    const bg = new Graphics().circle(0, 0, 22).fill({ color: 0x4caf50 });
    const icon = new Text({ text: "🪙", style: { fontSize: 18 } });
    icon.anchor.set(0.5);

    this.container.addChild(bg, icon);
    this.container.eventMode = "dynamic";
    this.container.cursor = "pointer";
    stage.addChild(this.container);

    const update = () => {
      if (this.collected) return;
      const screen = this.toScreen(worldPosition, camera, canvas);
      this.container.position.set(screen.x, screen.y - 60);
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);

    this.container.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (this.collected) return;
      this.collected = true;

      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
      }

      gsap.to(this.container, {
        alpha: 0,
        duration: 0.3,
        onComplete: () => {
          this.container.parent?.removeChild(this.container);
          onCollect();
        },
      });
    });
  }

  private toScreen(
    position: Vector3,
    camera: Camera,
    canvas: HTMLCanvasElement,
  ) {
    const projected = position.clone().project(camera as any);
    return {
      x: ((projected.x + 1) / 2) * canvas.clientWidth,
      y: ((-projected.y + 1) / 2) * canvas.clientHeight,
    };
  }
}
