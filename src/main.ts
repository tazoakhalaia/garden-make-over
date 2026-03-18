import { AudioManager } from "./config/audioManager";
import { GameController } from "./controller";
import "./style.css";
import { LoadingScreen } from "./ui/loading";

class App {
  private gameController: GameController;
  private threeCanvas = document.getElementById(
    "three-canvas",
  )! as HTMLCanvasElement;
  private pixiCanvas = document.getElementById(
    "pixi-canvas",
  )! as HTMLCanvasElement;
  private audioManager = new AudioManager();

  constructor() {
    this.gameController = new GameController(this.pixiCanvas, this.threeCanvas);
  }

  async start() {
    const loader = new LoadingScreen();
    loader.show();

    loader.setProgress(0.05);

    let fakeProgress = 0.05;
    let animationFrameId: number;

    const tick = () => {
      fakeProgress = Math.min(fakeProgress + 0.015, 0.85);
      loader.setProgress(fakeProgress);
      if (fakeProgress < 0.85) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };
    animationFrameId = requestAnimationFrame(tick);

    await this.gameController.init();

    cancelAnimationFrame(animationFrameId);
    loader.setProgress(1.0);

    await this.wait(400);

    const wantsMusic = await loader.showMusicPrompt();

    if (wantsMusic) {
      this.audioManager.playMusic();
    } else {
      this.audioManager.toggleMute();
    }

    loader.hide();
  }

  private wait(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }
}

const app = new App();
app.start();
