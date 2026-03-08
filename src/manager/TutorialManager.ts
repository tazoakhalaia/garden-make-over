import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";

interface TutorialStep {
  message: string;
  targetX: number;
  targetY: number;
}

export class Tutorial {
  private container = new Container();
  private finger: Text;
  private bubble: Container = new Container();
  private steps: TutorialStep[] = [];
  private currentStep = 0;
  private onComplete?: () => void;
  private baseTargetY = 0;

  constructor() {
    this.finger = new Text({ text: "👆", style: { fontSize: 40 } });
  }

  start(stage: Container, steps: TutorialStep[], onComplete?: () => void) {
    this.steps = steps;
    this.currentStep = 0;
    this.onComplete = onComplete;
    stage.addChild(this.container);
    this.showStep();
  }

  private showStep() {
    this.container.removeChildren();
    this.bubble = new Container();

    const step = this.steps[this.currentStep];

    const pad = 16;
    const label = new Text({
      text: step.message,
      style: {
        fontSize: 15,
        fill: 0xffffff,
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: 200,
      },
    });
    const bg = new Graphics()
      .roundRect(0, 0, label.width + pad * 2, label.height + pad * 2, 12)
      .fill({ color: 0x222222, alpha: 0.9 });

    this.bubble.addChild(bg);
    label.position.set(pad, pad);
    this.bubble.addChild(label);

    this.bubble.position.set(
      step.targetX - this.bubble.width / 2,
      step.targetY - 100,
    );
    this.container.addChild(this.bubble);

    this.baseTargetY = step.targetY;
    this.finger.position.set(step.targetX - 16, step.targetY);
    this.container.addChild(this.finger);

    gsap.killTweensOf(this.finger);
    gsap.to(this.finger, {
      y: step.targetY + 12,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  updateTarget(x: number, y: number) {
    if (!this.steps.length) return;

    this.steps[this.currentStep].targetX = x;
    this.steps[this.currentStep].targetY = y;

    this.bubble.position.set(x - this.bubble.width / 2, y - 100);

    this.baseTargetY = y;
    this.finger.position.set(x - 16, y);

    gsap.killTweensOf(this.finger);
    gsap.to(this.finger, {
      y: y + 12,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  next() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.end();
      return;
    }
    this.showStep();
  }

  end() {
    gsap.killTweensOf(this.finger);
    this.container.removeChildren();
    this.container.parent?.removeChild(this.container);
    this.onComplete?.();
  }
}
