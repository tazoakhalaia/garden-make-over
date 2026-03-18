import { Application, Assets, Container } from "pixi.js";
import { config, type GameEvents } from "../config";
import { Match3MiniGame } from "../mini-game";
import { AnimalMarket } from "./animalMarket";
import { CoinUI } from "./coinUI";
import { DayNightToggler } from "./dayNightToggler";
import { MiniGameBubble } from "./miniGameBubble";
import { PlantMarket } from "./plantMarket";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";
import { ProgressBar } from "./progressBar";
import { WolfWarningUI } from "./wolfWarningUI";

export class PixiUI {
  private app = new Application();
  public uiLayer = new Container();
  public coinUI = new CoinUI();
  private gameEvents!: GameEvents;

  public plantOrAnimalMarket = new PlantOrAnimalMarket();
  public animalMarket = new AnimalMarket();
  public plantMarket = new PlantMarket();
  public match3!: Match3MiniGame;
  private miniGameBubble = new MiniGameBubble();
  public dayNight = new DayNightToggler();
  private progressBar = new ProgressBar();
  private wolfWarningUI = new WolfWarningUI();

  public threeSnowToggle: (() => void) | null = null;
  public onWolfCoinDrain: (() => void) | null = null;
  public onReady: (() => void) | null = null;

  private screenSize = config.baseScreenSize;

  constructor() {
    Assets.addBundle("Assets", config.pixiAssets);
  }

  initPixi(canvas: HTMLCanvasElement, gameEvents: GameEvents) {
    this.gameEvents = gameEvents;

    Assets.loadBundle(["Assets"]).then(async () => {
      await this.app.init({
        canvas,
        width: this.screenSize.width,
        height: this.screenSize.height,
        backgroundAlpha: 0,
      });

      this.uiLayer.eventMode = "static";
      this.uiLayer.interactiveChildren = true;
      this.app.stage.addChild(this.uiLayer);

      this.coinUI.create(this.uiLayer, 2000);

      this.match3 = new Match3MiniGame(this.uiLayer, {
        onClose: (coinsEarned: number) => {
          this.gameEvents.dispatchEvent({ type: "ui:closed" });
          if (coinsEarned > 0) {
            this.gameEvents.dispatchEvent({
              type: "minigame:coins",
              coins: coinsEarned,
            });
          }
        },
      });

      this.miniGameBubble.create(
        this.uiLayer,
        () => this.showMatch3(),
        () => this.threeSnowToggle?.(),
      );

      this.dayNight.create(this.uiLayer);
      this.progressBar.init(this.uiLayer, this.gameEvents);
      this.wolfWarningUI.init(this.uiLayer, this.gameEvents, () =>
        this.onWolfCoinDrain?.(),
      );

      this.onResize();
      window.addEventListener("resize", this.onResize);
      this.onReady?.();
    });
  }

  showMatch3() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.match3.open();
  }

  hideMatch3() {
    this.match3.close(0);
  }

  showMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.plantOrAnimalMarket.createFarmMarket(this.uiLayer);
  }

  hideMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.plantOrAnimalMarket.destroy();
  }

  showAnimalMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.animalMarket.createAnimalMarket(this.uiLayer, this.gameEvents);
  }

  hideAnimalMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.animalMarket.destroy();
  }

  showPlantMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.plantMarket.createPlantMarket(this.uiLayer, this.gameEvents);
  }

  hidePlantMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.plantMarket.destroy();
  }

  onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);
    this.match3?.resize();
    this.dayNight.reposition();
  };

  destroy() {
    this.match3?.destroy();
    this.miniGameBubble.destroy();
    this.dayNight.destroy();
    this.progressBar.destroy();
    this.wolfWarningUI.destroy();
    window.removeEventListener("resize", this.onResize);
  }
}
