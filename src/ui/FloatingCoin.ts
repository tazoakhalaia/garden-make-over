import gsap from "gsap";
import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { Camera, Vector3 } from "three";

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
    coinBarPosition: { x: number; y: number } = { x: 34, y: 42 },
  ) {
    const bg = new Graphics().circle(0, 0, 22).fill({ color: 0x4caf50 });

    const texture = Assets.get<Texture>("coin");
    const icon = new Sprite(texture);
    icon.width = 28;
    icon.height = 28;
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
        this.animFrameId = null;
      }

      const flyIcon = new Sprite(Assets.get<Texture>("coin"));
      flyIcon.width = 28;
      flyIcon.height = 28;
      flyIcon.anchor.set(0.5);
      flyIcon.position.set(
        this.container.position.x,
        this.container.position.y,
      );
      stage.addChild(flyIcon);

      gsap.to(this.container, {
        alpha: 0,
        scale: 0.4,
        duration: 0.18,
        ease: "power2.in",
      });

      gsap.to(flyIcon, {
        x: coinBarPosition.x,
        y: coinBarPosition.y,
        duration: 0.55,
        ease: "power2.in",
        onComplete: () => {
          stage.removeChild(flyIcon);
          onCollect();

          const bar = stage.children.find((c) => (c as any).__isCoinBar) as
            | Container
            | undefined;
          if (bar) {
            gsap.fromTo(
              bar.scale,
              { x: 1.25, y: 1.25 },
              { x: 1, y: 1, duration: 0.25, ease: "elastic.out(1, 0.4)" },
            );
          }
        },
      });

      gsap.to(flyIcon, {
        alpha: 0.7,
        width: 18,
        height: 18,
        duration: 0.55,
        ease: "power2.in",
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
