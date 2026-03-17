import { Application, Assets, Container } from "pixi.js";
import { config, type GameEvents } from "../config";
import { Match3MiniGame } from "../mini-game";
import { AnimalMarket } from "./animalMarket";
import { CoinUI } from "./coinUI";
import { DayNightToggler } from "./dayNightToggler";
import { MiniGameBubble } from "./miniGameBubble";
import { PlantMarket } from "./plantMarket";
import { PlantOrAnimalMarket } from "./plantOrAnimalMarket";

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

      this.miniGameBubble.create(this.uiLayer, () => this.showMatch3());
      this.dayNight.create(this.uiLayer);

      this.onResize();
      window.addEventListener("resize", this.onResize);
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
    this.animalMarket.createAnimalMarket(this.uiLayer);
  }

  hideAnimalMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:closed" });
    this.animalMarket.destroy();
  }

  showPlantMarket() {
    this.gameEvents.dispatchEvent({ type: "ui:opened" });
    this.plantMarket.createPlantMarket(this.uiLayer);
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
    this.miniGameBubble.reposition();
    this.dayNight.reposition();
  };

  destroy() {
    this.match3?.destroy();
    this.miniGameBubble.destroy();
    this.dayNight.destroy();
    window.removeEventListener("resize", this.onResize);
  }
}
