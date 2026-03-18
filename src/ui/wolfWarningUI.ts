import { Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";
import type { GameEvents } from "../config";

export class WolfWarningUI {
  private container = new Container();
  private warningText!: Text;
  private countdownText!: Text;
  private bgGraphic!: Graphics;
  private ticker = new Ticker();

  private countdownSeconds = 10;
  private elapsedMs = 0;
  private isWarningVisible = false;
  private isWaveActive = false;

  private coinDrainElapsedMs = 0;
  private readonly COIN_DRAIN_INTERVAL = 5000;
  private readonly COIN_DRAIN_AMOUNT = 10;
  private onDrainCoins?: () => void;

  init(uiLayer: Container, gameEvents: GameEvents, onDrainCoins: () => void) {
    this.onDrainCoins = onDrainCoins;
    uiLayer.addChild(this.container);
    this.buildUI();

    gameEvents.addEventListener("wolf:countdown-start" as any, () => {
      this.startCountdown();
    });

    gameEvents.addEventListener("wolf:wave-start" as any, () => {
      this.startWaveWarning();
    });

    gameEvents.addEventListener("wolf:wave-end" as any, () => {
      this.stopWaveWarning();
    });

    this.ticker.add((t) => this.onTick(t.deltaMS));
    this.ticker.start();

    window.addEventListener("resize", this.onResize);
  }

  private onResize = () => this.buildUI();

  private buildUI() {
    this.container.removeChildren();

    const screenWidth = window.innerWidth;
    const scale = Math.min(Math.max(screenWidth / 900, 0.55), 1.3);

    const panelWidth = Math.round(200 * scale);
    const panelHeight = Math.round(60 * scale);
    const panelX = screenWidth - panelWidth - Math.round(16 * scale);
    const panelY = Math.round(200 * scale);

    this.bgGraphic = new Graphics()
      .roundRect(panelX, panelY, panelWidth, panelHeight, 12 * scale)
      .fill({ color: 0x1a0000, alpha: 0.85 })
      .stroke({ color: 0xff3333, width: 2 * scale, alpha: 0.8 });

    this.warningText = new Text({
      text: "⚠️ WOLVES INCOMING",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(9, Math.round(11 * scale)),
        fill: "#ff4444",
        align: "center",
      }),
    });
    this.warningText.anchor.set(0.5, 0);
    this.warningText.x = panelX + panelWidth / 2;
    this.warningText.y = panelY + Math.round(8 * scale);

    this.countdownText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(10, Math.round(18 * scale)),
        fill: "#ffffff",
        align: "center",
      }),
    });
    this.countdownText.anchor.set(0.5, 0);
    this.countdownText.x = panelX + panelWidth / 2;
    this.countdownText.y = panelY + Math.round(26 * scale);

    this.container.addChild(
      this.bgGraphic,
      this.warningText,
      this.countdownText,
    );

    this.container.visible = this.isWarningVisible;
    if (this.isWaveActive) {
      this.warningText.text = "🐺 WOLVES ATTACKING!";
      this.countdownText.text = "-10 Coins/5s Hit wolf";
    } else if (this.isWarningVisible) {
      this.warningText.text = "⚠️ WOLVES INCOMING";
      this.updateCountdownText();
    }
  }

  private onTick(deltaMs: number) {
    if (!this.isWarningVisible) return;

    if (!this.isWaveActive) {
      this.elapsedMs += deltaMs;
      if (this.elapsedMs >= 1000) {
        this.elapsedMs -= 1000;
        this.countdownSeconds = Math.max(0, this.countdownSeconds - 1);
        this.updateCountdownText();
      }

      if (this.countdownSeconds <= 5) {
        this.bgGraphic.alpha = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
      }
    } else {
      this.coinDrainElapsedMs += deltaMs;
      if (this.coinDrainElapsedMs >= this.COIN_DRAIN_INTERVAL) {
        this.coinDrainElapsedMs -= this.COIN_DRAIN_INTERVAL;
        this.onDrainCoins?.();
      }

      this.warningText.alpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    }
  }

  private updateCountdownText() {
    if (this.countdownText) {
      this.countdownText.text = `🐺 ${this.countdownSeconds}s`;
    }
  }

  startCountdown(seconds = 10) {
    this.countdownSeconds = seconds;
    this.elapsedMs = 0;
    this.isWaveActive = false;
    this.isWarningVisible = true;
    this.container.visible = true;
    this.bgGraphic?.stroke({ color: 0xff3333, width: 2, alpha: 0.8 });
    this.warningText.text = "⚠️ WOLVES INCOMING";
    this.updateCountdownText();
  }

  startWaveWarning() {
    this.isWaveActive = true;
    this.coinDrainElapsedMs = 0;
    this.isWarningVisible = true;
    this.container.visible = true;
    this.warningText.text = "🐺 WOLVES ATTACKING!";
    this.countdownText.text = "-10 Coins/5s Hit wolf";
  }

  stopWaveWarning() {
    this.isWaveActive = false;
    this.isWarningVisible = false;
    this.container.visible = false;
    this.coinDrainElapsedMs = 0;
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.ticker.destroy();
    this.container.removeFromParent();
  }
}
