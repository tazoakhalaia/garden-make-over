import { Container, Graphics, Text } from "pixi.js";
import { Camera, Vector3 } from "three";
import gsap from "gsap";

export class FloatingCoin {
  private container = new Container();
  private collected = false;

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

    const screen = this.toScreen(worldPosition, camera, canvas);
    this.container.position.set(screen.x, screen.y - 40);

    gsap.to(this.container, {
      y: screen.y - 80,
      duration: 0.6,
      ease: "power2.out",
    });

    this.container.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (this.collected) return;
      this.collected = true;

      gsap.to(this.container, {
        y: screen.y - 120,
        alpha: 0,
        duration: 0.3,
        onComplete: () => {
          this.container.parent?.removeChild(this.container);
          onCollect();
        },
      });
    });

    stage.addChild(this.container);
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
