import { Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";
import { GameEvents } from "../config";
import { plantOrAnimal } from "../enums";

const PLAY_STORE_URL = "https://play.google.com/store/games";
const MAXIMUM_PROGRESS = 100;

const PROGRESS_INCREMENT_VALUES = {
  placePlot: 5,
  buyAnimal: 10,
  buyPlant: 5,
  minigameCoins: 5,
};

export class ProgressBar {
  private uiLayer!: Container;
  private gameEvents!: GameEvents;

  private barContainer = new Container();
  private downloadContainer = new Container();

  private barFillGraphic!: Graphics;
  private barFillGlowGraphic!: Graphics;
  private progressLabelText!: Text;
  private progressPercentText!: Text;

  private currentProgress = 0;
  private targetProgress = 0;

  private sharedTicker = new Ticker();

  private shimmerAnimationOffset = 0;

  private isLabelFlashing = false;
  private labelFlashElapsedMs = 0;

  private isDownloadScreenVisible = false;

  private isDownloadTriggerPending = false;
  private downloadTriggerElapsedMs = 0;

  private isDownloadFadingIn = false;
  private downloadFadeInAlpha = 0;

  private isDownloadFadingOut = false;
  private downloadFadeOutAlpha = 1;

  private boundGameEventListeners: Array<{ type: string; fn: () => void }> = [];

  init(uiLayer: Container, gameEvents: GameEvents) {
    this.uiLayer = uiLayer;
    this.gameEvents = gameEvents;

    uiLayer.addChild(this.barContainer);
    this.buildBar();
    this.registerGameEventListeners();
    this.barContainer.y = 80;

    this.sharedTicker.add((ticker) => this.onTick(ticker.deltaMS));
    this.sharedTicker.start();

    window.addEventListener("resize", this.onResize);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
    this.sharedTicker.destroy();
    this.barContainer.removeFromParent();
    this.downloadContainer.removeFromParent();
    this.boundGameEventListeners.forEach(({ type, fn }) =>
      this.gameEvents.removeEventListener(type as any, fn),
    );
  }

  private onResize = () => {
    this.buildBar();
    this.updateBarFill();
    if (this.isDownloadScreenVisible) this.buildDownloadScreen();
  };

  private onTick(deltaMs: number) {
    if (Math.abs(this.currentProgress - this.targetProgress) > 0.1) {
      this.currentProgress +=
        (this.targetProgress - this.currentProgress) * 0.08;
      this.updateBarFill();
    }

    this.shimmerAnimationOffset += deltaMs * 0.001;
    if (this.barFillGlowGraphic) {
      this.barFillGlowGraphic.alpha =
        0.2 + Math.sin(this.shimmerAnimationOffset * 2) * 0.12;
    }

    if (this.isLabelFlashing) {
      this.labelFlashElapsedMs += deltaMs;
      if (this.labelFlashElapsedMs >= 300) {
        this.isLabelFlashing = false;
        this.labelFlashElapsedMs = 0;
        if (this.progressLabelText) {
          this.progressLabelText.style.fill = "#4ade80";
        }
      }
    }

    if (this.isDownloadTriggerPending) {
      this.downloadTriggerElapsedMs += deltaMs;
      if (this.downloadTriggerElapsedMs >= 800) {
        this.isDownloadTriggerPending = false;
        this.downloadTriggerElapsedMs = 0;
        this.showDownloadScreen();
      }
    }

    if (this.isDownloadFadingIn) {
      this.downloadFadeInAlpha = Math.min(
        1,
        this.downloadFadeInAlpha + deltaMs * 0.0025,
      );
      this.downloadContainer.alpha = this.downloadFadeInAlpha;
      if (this.downloadFadeInAlpha >= 1) {
        this.isDownloadFadingIn = false;
      }
    }

    if (this.isDownloadFadingOut) {
      this.downloadFadeOutAlpha = Math.max(
        0,
        this.downloadFadeOutAlpha - deltaMs * 0.004,
      );
      this.downloadContainer.alpha = this.downloadFadeOutAlpha;
      if (this.downloadFadeOutAlpha <= 0) {
        this.isDownloadFadingOut = false;
        this.isDownloadScreenVisible = false;
        this.downloadContainer.removeFromParent();
      }
    }
  }

  private registerGameEventListeners() {
    const registerListener = (eventType: string, handler: () => void) => {
      this.gameEvents.addEventListener(eventType as any, handler);
      this.boundGameEventListeners.push({ type: eventType, fn: handler });
    };

    registerListener("placeholder:clicked", () =>
      this.addProgress(PROGRESS_INCREMENT_VALUES.placePlot),
    );
    registerListener("animalMarket:item-selected", () =>
      this.addProgress(PROGRESS_INCREMENT_VALUES.buyAnimal),
    );
    registerListener("buyPlant:item-selected", () =>
      this.addProgress(PROGRESS_INCREMENT_VALUES.buyPlant),
    );
    registerListener("minigame:coins", () =>
      this.addProgress(PROGRESS_INCREMENT_VALUES.minigameCoins),
    );
  }

  private addProgress(incrementAmount: number) {
    if (this.isDownloadScreenVisible) return;

    this.targetProgress = Math.min(
      MAXIMUM_PROGRESS,
      this.targetProgress + incrementAmount,
    );

    this.isLabelFlashing = true;
    this.labelFlashElapsedMs = 0;
    if (this.progressLabelText) {
      this.progressLabelText.style.fill = "#ffffff";
    }

    if (
      this.targetProgress >= MAXIMUM_PROGRESS &&
      !this.isDownloadTriggerPending
    ) {
      this.isDownloadTriggerPending = true;
      this.downloadTriggerElapsedMs = 0;
    }
  }

  private buildBar() {
    this.barContainer.removeChildren();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scaleFactor = Math.min(
      Math.max(Math.min(screenWidth / 900, screenHeight / 700), 0.55),
      1.3,
    );

    const barWidth = Math.round(Math.min(300 * scaleFactor, screenWidth * 0.4));
    const barHeight = Math.round(22 * scaleFactor);
    const barX = Math.round((screenWidth - barWidth) / 2);
    const barY = Math.round(16 * scaleFactor);
    const barCornerRadius = Math.round(barHeight / 2);

    const trophyIconText = new Text({
      text: "🏆",
      style: new TextStyle({ fontSize: Math.round(18 * scaleFactor) }),
    });
    trophyIconText.anchor.set(0.5, 0.5);
    trophyIconText.x = barX - Math.round(18 * scaleFactor);
    trophyIconText.y = barY + barHeight / 2;

    const trackShadowGraphic = new Graphics()
      .roundRect(barX + 2, barY + 3, barWidth, barHeight, barCornerRadius)
      .fill({ color: 0x000000, alpha: 0.25 });

    const trackBackgroundGraphic = new Graphics()
      .roundRect(barX, barY, barWidth, barHeight, barCornerRadius)
      .fill({ color: 0x0f1f0f });

    const trackBorderGraphic = new Graphics()
      .roundRect(barX, barY, barWidth, barHeight, barCornerRadius)
      .stroke({
        color: 0x4ade80,
        width: Math.max(1, Math.round(1.5 * scaleFactor)),
        alpha: 0.5,
      });

    this.barFillGlowGraphic = new Graphics();

    this.barFillGraphic = new Graphics();

    this.progressPercentText = new Text({
      text: `${Math.round(this.currentProgress)}%`,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(9, Math.round(11 * scaleFactor)),
        fill: "#4ade80",
      }),
    });
    this.progressPercentText.anchor.set(0, 0.5);
    this.progressPercentText.x = barX + barWidth + Math.round(8 * scaleFactor);
    this.progressPercentText.y = barY + barHeight / 2;

    this.progressLabelText = new Text({
      text: "PROGRESS",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(7, Math.round(9 * scaleFactor)),
        fill: this.isLabelFlashing ? "#ffffff" : "#4ade80",
        letterSpacing: 1.5,
      }),
    });
    this.progressLabelText.anchor.set(0.5, 1);
    this.progressLabelText.x = barX + barWidth / 2;
    this.progressLabelText.y = barY - Math.round(3 * scaleFactor);

    this.barContainer.addChild(
      trophyIconText,
      trackShadowGraphic,
      trackBackgroundGraphic,
      trackBorderGraphic,
      this.barFillGlowGraphic,
      this.barFillGraphic,
      this.progressPercentText,
      this.progressLabelText,
    );

    this.updateBarFill();
  }

  private updateBarFill() {
    if (!this.barFillGraphic) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scaleFactor = Math.min(
      Math.max(Math.min(screenWidth / 900, screenHeight / 700), 0.55),
      1.3,
    );

    const barWidth = Math.round(Math.min(300 * scaleFactor, screenWidth * 0.4));
    const barHeight = Math.round(22 * scaleFactor);
    const barX = Math.round((screenWidth - barWidth) / 2);
    const barY = Math.round(16 * scaleFactor);
    const barCornerRadius = Math.round(barHeight / 2);

    const fillRatio = Math.max(
      0,
      Math.min(1, this.currentProgress / MAXIMUM_PROGRESS),
    );
    const fillWidth = Math.max(0, Math.round((barWidth - 4) * fillRatio));

    this.barFillGraphic.clear();
    this.barFillGlowGraphic.clear();

    if (fillWidth > 0) {
      this.barFillGlowGraphic
        .roundRect(
          barX + 2,
          barY + 2,
          fillWidth,
          barHeight - 4,
          barCornerRadius - 1,
        )
        .fill({ color: 0x4ade80, alpha: 0.25 });

      this.barFillGraphic
        .roundRect(
          barX + 2,
          barY + 2,
          fillWidth,
          barHeight - 4,
          barCornerRadius - 1,
        )
        .fill({ color: 0x16a34a });

      if (fillWidth > barCornerRadius * 2) {
        this.barFillGraphic
          .roundRect(
            barX + 2,
            barY + 2,
            fillWidth,
            Math.round((barHeight - 4) * 0.45),
            barCornerRadius - 1,
          )
          .fill({ color: 0x4ade80, alpha: 0.4 });
      }
    }

    if (this.progressPercentText) {
      this.progressPercentText.text = `${Math.round(this.currentProgress)}%`;
    }
  }

  private showDownloadScreen() {
    this.isDownloadScreenVisible = true;
    this.currentProgress = MAXIMUM_PROGRESS;
    this.targetProgress = MAXIMUM_PROGRESS;
    this.updateBarFill();

    this.buildDownloadScreen();
    this.uiLayer.addChild(this.downloadContainer);

    this.downloadFadeInAlpha = 0;
    this.downloadContainer.alpha = 0;
    this.isDownloadFadingIn = true;
    this.isDownloadFadingOut = false;
  }

  private buildDownloadScreen() {
    this.downloadContainer.removeChildren();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scaleFactor = Math.min(
      Math.max(Math.min(screenWidth / 900, screenHeight / 700), 0.55),
      1.3,
    );

    const fullScreenOverlayGraphic = new Graphics()
      .rect(0, 0, screenWidth, screenHeight)
      .fill({ color: 0x000000, alpha: 0.82 });
    fullScreenOverlayGraphic.label = plantOrAnimal.BACKGROUND;
    const cardWidth = Math.round(Math.min(420 * scaleFactor, screenWidth - 40));
    const cardHeight = Math.round(340 * scaleFactor);
    const cardX = Math.round((screenWidth - cardWidth) / 2);
    const cardY = Math.round((screenHeight - cardHeight) / 2);
    const cardCornerRadius = Math.round(28 * scaleFactor);

    const cardShadowGraphic = new Graphics()
      .roundRect(cardX + 6, cardY + 8, cardWidth, cardHeight, cardCornerRadius)
      .fill({ color: 0x000000, alpha: 0.4 });

    const cardBackgroundGraphic = new Graphics()
      .roundRect(cardX, cardY, cardWidth, cardHeight, cardCornerRadius)
      .fill({ color: 0x0f1f0f });

    const cardShineGraphic = new Graphics()
      .roundRect(
        cardX + 4,
        cardY + 4,
        cardWidth - 8,
        cardHeight * 0.3,
        cardCornerRadius - 4,
      )
      .fill({ color: 0xffffff, alpha: 0.04 });

    const cardBorderGraphic = new Graphics()
      .roundRect(cardX, cardY, cardWidth, cardHeight, cardCornerRadius)
      .stroke({
        color: 0x4ade80,
        width: Math.round(2.5 * scaleFactor),
        alpha: 0.9,
      });

    const trophyEmojiText = new Text({
      text: "🏆",
      style: new TextStyle({ fontSize: Math.round(64 * scaleFactor) }),
    });
    trophyEmojiText.anchor.set(0.5);
    trophyEmojiText.x = cardX + cardWidth / 2;
    trophyEmojiText.y = cardY + Math.round(70 * scaleFactor);

    const cardTitleText = new Text({
      text: "YOU'RE A MASTER FARMER!",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(14, Math.round(22 * scaleFactor)),
        fill: "#4ade80",
        align: "center",
        wordWrap: true,
        wordWrapWidth: cardWidth - Math.round(40 * scaleFactor),
        dropShadow: {
          color: 0x000000,
          alpha: 0.6,
          blur: 4,
          distance: 2,
          angle: Math.PI / 4,
        },
      }),
    });
    cardTitleText.anchor.set(0.5);
    cardTitleText.x = cardX + cardWidth / 2;
    cardTitleText.y = cardY + Math.round(138 * scaleFactor);

    const cardSubtitleText = new Text({
      text: "Download the full game on Google Play!",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(10, Math.round(13 * scaleFactor)),
        fill: "#86efac",
        align: "center",
        wordWrap: true,
        wordWrapWidth: cardWidth - Math.round(40 * scaleFactor),
      }),
    });
    cardSubtitleText.anchor.set(0.5);
    cardSubtitleText.x = cardX + cardWidth / 2;
    cardSubtitleText.y = cardY + Math.round(178 * scaleFactor);

    const downloadButtonWidth = Math.round(
      Math.min(260 * scaleFactor, cardWidth - 40),
    );
    const downloadButtonHeight = Math.round(54 * scaleFactor);
    const downloadButtonX =
      cardX + Math.round((cardWidth - downloadButtonWidth) / 2);
    const downloadButtonY = cardY + Math.round(210 * scaleFactor);
    const downloadButtonCornerRadius = Math.round(downloadButtonHeight / 2);

    const downloadButtonShadowGraphic = new Graphics()
      .roundRect(
        downloadButtonX + 3,
        downloadButtonY + 4,
        downloadButtonWidth,
        downloadButtonHeight,
        downloadButtonCornerRadius,
      )
      .fill({ color: 0x000000, alpha: 0.3 });

    const downloadButtonBackgroundGraphic = new Graphics()
      .roundRect(
        downloadButtonX,
        downloadButtonY,
        downloadButtonWidth,
        downloadButtonHeight,
        downloadButtonCornerRadius,
      )
      .fill({ color: 0x16a34a });

    const downloadButtonShineGraphic = new Graphics()
      .roundRect(
        downloadButtonX + 4,
        downloadButtonY + 4,
        downloadButtonWidth - 8,
        downloadButtonHeight * 0.45,
        downloadButtonCornerRadius - 2,
      )
      .fill({ color: 0xffffff, alpha: 0.12 });

    const downloadButtonBorderGraphic = new Graphics()
      .roundRect(
        downloadButtonX,
        downloadButtonY,
        downloadButtonWidth,
        downloadButtonHeight,
        downloadButtonCornerRadius,
      )
      .stroke({
        color: 0x4ade80,
        width: Math.round(2 * scaleFactor),
        alpha: 0.8,
      });

    const downloadButtonLabelText = new Text({
      text: "▶  GET IT ON GOOGLE PLAY",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(8, Math.round(12 * scaleFactor)),
        fill: "#ffffff",
        letterSpacing: 1,
        dropShadow: {
          color: 0x000000,
          alpha: 0.5,
          blur: 2,
          distance: 1,
          angle: Math.PI / 4,
        },
      }),
    });
    downloadButtonLabelText.anchor.set(0.5);
    downloadButtonLabelText.x = downloadButtonX + downloadButtonWidth / 2;
    downloadButtonLabelText.y = downloadButtonY + downloadButtonHeight / 2;

    const downloadButtonHitAreaGraphic = new Graphics()
      .roundRect(
        downloadButtonX,
        downloadButtonY,
        downloadButtonWidth,
        downloadButtonHeight,
        downloadButtonCornerRadius,
      )
      .fill({ color: 0xffffff, alpha: 0.001 });
    downloadButtonHitAreaGraphic.eventMode = "static";
    downloadButtonHitAreaGraphic.cursor = "pointer";
    downloadButtonHitAreaGraphic.on("pointerover", () => {
      downloadButtonBackgroundGraphic.tint = 0xbbffbb;
    });
    downloadButtonHitAreaGraphic.on("pointerout", () => {
      downloadButtonBackgroundGraphic.tint = 0xffffff;
    });
    downloadButtonHitAreaGraphic.on("pointerdown", () => {
      downloadButtonBackgroundGraphic.tint = 0x88cc88;
    });
    downloadButtonHitAreaGraphic.on("pointerup", () => {
      downloadButtonBackgroundGraphic.tint = 0xffffff;
      window.open(PLAY_STORE_URL, "_blank");
    });

    const maybeLaterLinkText = new Text({
      text: "Maybe later",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: Math.max(9, Math.round(11 * scaleFactor)),
        fill: "#6b7280",
      }),
    });
    maybeLaterLinkText.anchor.set(0.5);
    maybeLaterLinkText.x = cardX + cardWidth / 2;
    maybeLaterLinkText.y = cardY + Math.round(290 * scaleFactor);
    maybeLaterLinkText.eventMode = "static";
    maybeLaterLinkText.cursor = "pointer";
    maybeLaterLinkText.on("pointerover", () => {
      maybeLaterLinkText.style.fill = "#9ca3af";
    });
    maybeLaterLinkText.on("pointerout", () => {
      maybeLaterLinkText.style.fill = "#6b7280";
    });
    maybeLaterLinkText.on("pointerup", () => this.hideDownloadScreen());

    this.downloadContainer.addChild(
      fullScreenOverlayGraphic,
      cardShadowGraphic,
      cardBackgroundGraphic,
      cardShineGraphic,
      cardBorderGraphic,
      trophyEmojiText,
      cardTitleText,
      cardSubtitleText,
      downloadButtonShadowGraphic,
      downloadButtonBackgroundGraphic,
      downloadButtonShineGraphic,
      downloadButtonBorderGraphic,
      downloadButtonLabelText,
      downloadButtonHitAreaGraphic,
      maybeLaterLinkText,
    );
  }

  private hideDownloadScreen() {
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.updateBarFill();
    this.downloadFadeOutAlpha = 1;
    this.isDownloadFadingOut = true;
    this.isDownloadFadingIn = false;
  }
}
