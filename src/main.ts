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

    let fakeP = 0.05;
    const ticker = setInterval(() => {
      fakeP = Math.min(fakeP + 0.015, 0.85);
      loader.setProgress(fakeP);
    }, 120);

    await this.gameController.init();

    clearInterval(ticker);
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
