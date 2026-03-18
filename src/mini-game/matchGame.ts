import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";
import { plantOrAnimal } from "../enums";

interface Match3Options {
  onClose?: (coinsEarned: number) => void;
  textures?: Partial<Record<CropKey, Texture>>;
}

type CropKey =
  | "corn"
  | "tomato"
  | "carrot"
  | "strawberry"
  | "broccoli"
  | "sunflower";

const COLUMNS = 7;
const ROWS = 7;
const TARGET_SCORE = 500;
const TOTAL_MOVES = 20;

const CROP_KEYS: CropKey[] = [
  "corn",
  "tomato",
  "carrot",
  "strawberry",
  "broccoli",
  "sunflower",
];
const CROP_EMOJI = ["🌽", "🍅", "🥕", "🍓", "🥦", "🌻"];
const CROP_COLORS = [
  0xf9c74f, 0xe63946, 0xff9f1c, 0xe63975, 0x52b788, 0xffd166,
];

interface Layout {
  tileSize: number;
  tileGap: number;
  tileStep: number;
  boardPixelWidth: number;
  boardPixelHeight: number;
  padding: number;
  panelWidth: number;
  panelHeight: number;
  panelX: number;
  panelY: number;
  hudY: number;
  hudBoxWidth: number;
  hudBoxHeight: number;
  progressBarY: number;
  progressBarHeight: number;
  messageY: number;
  messageHeight: number;
  boardY: number;
  buttonY: number;
  buttonHeight: number;
  fontSizes: {
    title: number;
    hudLabel: number;
    hudValue: number;
    message: number;
    button: number;
    tile: number;
  };
}

function calculateLayout(screenWidth: number, screenHeight: number): Layout {
  const tileFromWidth = Math.floor(
    (screenWidth * 0.94 - (COLUMNS - 1) * 4) / COLUMNS,
  );
  const tileFromHeight = Math.floor(
    (screenHeight * 0.56 - (ROWS - 1) * 4) / ROWS,
  );
  const tileSize = Math.max(30, Math.min(64, tileFromWidth, tileFromHeight));
  const tileGap = Math.max(3, Math.round(tileSize * 0.08));
  const tileStep = tileSize + tileGap;
  const boardPixelWidth = COLUMNS * tileStep - tileGap;
  const boardPixelHeight = ROWS * tileStep - tileGap;
  const padding = Math.max(10, Math.round(tileSize * 0.28));
  const scale = tileSize / 64;
  const fontSizes = {
    title: Math.max(13, Math.round(20 * scale)),
    hudLabel: Math.max(8, Math.round(10 * scale)),
    hudValue: Math.max(10, Math.round(16 * scale)),
    message: Math.max(9, Math.round(13 * scale)),
    button: Math.max(9, Math.round(13 * scale)),
    tile: Math.max(13, Math.round(28 * scale)),
  };
  const hudBoxWidth = Math.max(70, Math.round(100 * scale));
  const hudBoxHeight = Math.max(30, Math.round(40 * scale));
  const hudY = padding + Math.round(24 * scale);
  const progressBarHeight = Math.max(5, Math.round(12 * scale));
  const progressBarY = hudY + hudBoxHeight + Math.round(6 * scale);
  const messageHeight = Math.max(20, Math.round(28 * scale));
  const messageY = progressBarY + progressBarHeight + Math.round(5 * scale);
  const boardY = messageY + messageHeight + Math.round(4 * scale);
  const buttonHeight = Math.max(28, Math.round(44 * scale));
  const buttonY = boardY + boardPixelHeight + padding;
  const panelWidth = boardPixelWidth + padding * 2;
  const panelHeight = buttonY + buttonHeight + padding;
  const panelX = Math.round((screenWidth - panelWidth) / 2);
  const panelY = Math.round((screenHeight - panelHeight) / 2);
  return {
    tileSize,
    tileGap,
    tileStep,
    boardPixelWidth,
    boardPixelHeight,
    padding,
    panelWidth,
    panelHeight,
    panelX,
    panelY,
    hudY,
    hudBoxWidth,
    hudBoxHeight,
    progressBarY,
    progressBarHeight,
    messageY,
    messageHeight,
    boardY,
    buttonY,
    buttonHeight,
    fontSizes,
  };
}

export class Match3MiniGame {
  private app: Application;
  private options: Match3Options;

  private rootContainer!: Container;
  private panelContainer!: Container;
  private boardContainer!: Container;
  private progressBarFill!: Graphics;
  private messageText!: Text;
  private scoreText!: Text;
  private movesText!: Text;
  private resultPanel!: Container;
  private resultTitleText!: Text;
  private resultSubText!: Text;
  private resultCoinsText!: Text;

  private board: number[][] = [];
  private tiles: (Container | null)[][] = [];
  private selectedTile: { row: number; col: number } | null = null;
  private isBusy = false;
  private currentScore = 0;
  private remainingMoves = TOTAL_MOVES;
  private coinsEarned = 0;
  private isBuilt = false;
  private isOpen = false;
  private layout!: Layout;

  private savedMessage = "tap a crop to start!";
  private savedMessageColor = 0xaad4aa;
  private isResultVisible = false;

  constructor(app: Application, options: Match3Options = {}) {
    this.app = app;
    this.options = options;
  }

  open(): void {
    this.isOpen = true;
    this.rebuild();
    this.rootContainer.visible = true;
    this.newGame();
  }

  close(coinsEarned = 0): void {
    this.isOpen = false;
    if (this.rootContainer) this.rootContainer.visible = false;
    this.options.onClose?.(coinsEarned);
  }

  resize(): void {
    if (!this.isOpen) return;
    this.rebuild();
    this.rootContainer.visible = true;
    this.renderBoard();
    this.updateHUD();
    this.setMessage(this.savedMessage, this.savedMessageColor);
    if (this.isResultVisible) this.restoreResult();
  }

  destroy(): void {
    if (this.rootContainer) {
      this.app.stage.removeChild(this.rootContainer);
      this.rootContainer.destroy({ children: true });
      this.isBuilt = false;
    }
  }

  private rebuild(): void {
    if (this.isBuilt) {
      this.app.stage.removeChild(this.rootContainer);
      this.rootContainer.destroy({ children: true });
      this.isBuilt = false;
    }
    this.build();
  }

  private build(): void {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.layout = calculateLayout(screenWidth, screenHeight);
    const layout = this.layout;

    this.rootContainer = new Container();
    this.rootContainer.visible = false;
    this.rootContainer.eventMode = "static";
    this.rootContainer.interactiveChildren = true;
    this.app.stage.addChild(this.rootContainer);

    const dimOverlay = new Graphics();
    dimOverlay.label = plantOrAnimal.BACKGROUND;
    dimOverlay
      .rect(0, 0, screenWidth, screenHeight)
      .fill({ color: 0x000000, alpha: 0.2 });
    dimOverlay.label = plantOrAnimal.BACKGROUND;
    this.rootContainer.addChild(dimOverlay);

    const panelBackground = new Graphics();
    panelBackground
      .roundRect(0, 0, layout.panelWidth, layout.panelHeight, 18)
      .fill({ color: 0x1a2e1a })
      .stroke({ color: 0x4caf50, width: 2 });

    this.panelContainer = new Container();
    this.panelContainer.x = layout.panelX;
    this.panelContainer.y = layout.panelY;
    this.panelContainer.addChild(panelBackground);
    this.rootContainer.addChild(this.panelContainer);

    const titleText = new Text({
      text: "🌾 Harvest Match",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: layout.fontSizes.title,
        fill: 0xffe066,
      }),
    });
    titleText.anchor.set(0.5, 0);
    titleText.x = layout.panelWidth / 2;
    titleText.y = layout.padding - 4;
    this.panelContainer.addChild(titleText);

    this.scoreText = this.makeHudBox(
      layout.padding,
      layout.hudY,
      "SCORE",
      String(this.currentScore),
    );
    this.makeHudBox(
      layout.panelWidth / 2 - layout.hudBoxWidth / 2,
      layout.hudY,
      "GOAL",
      String(TARGET_SCORE),
    );
    this.movesText = this.makeHudBox(
      layout.panelWidth - layout.padding - layout.hudBoxWidth,
      layout.hudY,
      "MOVES",
      String(this.remainingMoves),
    );

    const progressBarBackground = new Graphics();
    progressBarBackground
      .roundRect(0, 0, layout.boardPixelWidth, layout.progressBarHeight, 4)
      .fill({ color: 0x2e4a2e });
    progressBarBackground.x = layout.padding;
    progressBarBackground.y = layout.progressBarY;
    this.panelContainer.addChild(progressBarBackground);

    this.progressBarFill = new Graphics();
    this.progressBarFill.x = layout.padding;
    this.progressBarFill.y = layout.progressBarY;
    this.panelContainer.addChild(this.progressBarFill);

    this.messageText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: layout.fontSizes.message,
        fill: 0xaad4aa,
      }),
    });
    this.messageText.anchor.set(0.5, 0);
    this.messageText.x = layout.panelWidth / 2;
    this.messageText.y = layout.messageY;
    this.panelContainer.addChild(this.messageText);

    this.boardContainer = new Container();
    this.boardContainer.x = layout.padding;
    this.boardContainer.y = layout.boardY;
    this.panelContainer.addChild(this.boardContainer);

    const buttonGap = Math.round(layout.padding * 0.4);
    const newButtonWidth = Math.round(layout.boardPixelWidth * 0.38);
    const hintButtonWidth = Math.round(layout.boardPixelWidth * 0.27);
    const closeButtonWidth =
      layout.boardPixelWidth - newButtonWidth - hintButtonWidth - buttonGap * 2;

    this.makeButton(
      layout.padding,
      layout.buttonY,
      newButtonWidth,
      layout.buttonHeight,
      "🔄 New",
      0x2d5a27,
      () => this.newGame(),
    );
    this.makeButton(
      layout.padding + newButtonWidth + buttonGap,
      layout.buttonY,
      hintButtonWidth,
      layout.buttonHeight,
      "💡 Hint",
      0x5a4a27,
      () => this.hint(),
    );
    this.makeButton(
      layout.padding + newButtonWidth + buttonGap + hintButtonWidth + buttonGap,
      layout.buttonY,
      closeButtonWidth,
      layout.buttonHeight,
      "✖ Close",
      0x5a2727,
      () => this.close(this.coinsEarned),
    );

    this.buildResultPanel();
    this.isBuilt = true;
  }

  private makeHudBox(
    x: number,
    y: number,
    labelText: string,
    valueText: string,
  ): Text {
    const layout = this.layout;

    const hudContainer = new Container();
    hudContainer.x = x;
    hudContainer.y = y;
    this.panelContainer.addChild(hudContainer);

    const hudBox = new Graphics();
    hudBox
      .roundRect(0, 0, layout.hudBoxWidth, layout.hudBoxHeight, 8)
      .fill({ color: 0x2e4a2e });
    hudContainer.addChild(hudBox);

    const labelDisplay = new Text({
      text: labelText,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: layout.fontSizes.hudLabel,
        fill: 0x88bb88,
      }),
    });
    labelDisplay.x = 5;
    labelDisplay.y = 4;
    hudContainer.addChild(labelDisplay);

    const valueDisplay = new Text({
      text: valueText,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: layout.fontSizes.hudValue,
        fill: 0xffffff,
      }),
    });
    valueDisplay.x = 5;
    valueDisplay.y = layout.hudBoxHeight * 0.44;
    hudContainer.addChild(valueDisplay);

    return valueDisplay;
  }

  private makeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    labelText: string,
    backgroundColor: number,
    onPress: () => void,
  ): Container {
    const buttonContainer = new Container();
    buttonContainer.x = x;
    buttonContainer.y = y;
    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";

    const buttonBackground = new Graphics();
    buttonBackground
      .roundRect(0, 0, width, height, 8)
      .fill({ color: backgroundColor });
    buttonContainer.addChild(buttonBackground);

    const buttonLabel = new Text({
      text: labelText,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: this.layout.fontSizes.button,
        fill: 0xffffff,
      }),
    });
    buttonLabel.anchor.set(0.5);
    buttonLabel.x = width / 2;
    buttonLabel.y = height / 2;
    buttonContainer.addChild(buttonLabel);

    buttonContainer.on("pointerdown", () => {
      buttonContainer.alpha = 0.7;
    });
    buttonContainer.on("pointerup", () => {
      buttonContainer.alpha = 1.0;
      onPress();
    });
    buttonContainer.on("pointerupoutside", () => {
      buttonContainer.alpha = 1.0;
    });

    this.panelContainer.addChild(buttonContainer);
    return buttonContainer;
  }

  private buildResultPanel(): void {
    const layout = this.layout;
    const overlayWidth = Math.min(Math.round(layout.panelWidth * 0.88), 320);
    const overlayHeight = Math.round(overlayWidth * 0.56);
    const overlayX = Math.round((layout.panelWidth - overlayWidth) / 2);
    const overlayY = Math.round((layout.panelHeight - overlayHeight) / 2);
    const titleFontSize = Math.max(12, layout.fontSizes.title);
    const subFontSize = Math.max(9, layout.fontSizes.message);
    const coinsFontSize = Math.max(13, Math.round(titleFontSize * 1.15));

    const overlayBackground = new Graphics();
    overlayBackground
      .roundRect(0, 0, overlayWidth, overlayHeight, 16)
      .fill({ color: 0x0d1f0d, alpha: 0.97 })
      .stroke({ color: 0xffd700, width: 2 });

    this.resultPanel = new Container();
    this.resultPanel.x = overlayX;
    this.resultPanel.y = overlayY;
    this.resultPanel.addChild(overlayBackground);
    this.resultPanel.visible = false;
    this.panelContainer.addChild(this.resultPanel);

    this.resultTitleText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: titleFontSize,
        fill: 0xffe066,
        align: "center",
      }),
    });
    this.resultTitleText.anchor.set(0.5, 0);
    this.resultTitleText.x = overlayWidth / 2;
    this.resultTitleText.y = overlayHeight * 0.1;
    this.resultPanel.addChild(this.resultTitleText);

    this.resultSubText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: subFontSize,
        fill: 0xaad4aa,
        align: "center",
      }),
    });
    this.resultSubText.anchor.set(0.5, 0);
    this.resultSubText.x = overlayWidth / 2;
    this.resultSubText.y = overlayHeight * 0.36;
    this.resultPanel.addChild(this.resultSubText);

    this.resultCoinsText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: coinsFontSize,
        fill: 0xffd700,
        align: "center",
      }),
    });
    this.resultCoinsText.anchor.set(0.5, 0);
    this.resultCoinsText.x = overlayWidth / 2;
    this.resultCoinsText.y = overlayHeight * 0.53;
    this.resultPanel.addChild(this.resultCoinsText);

    const resultButtonWidth = Math.round(overlayWidth * 0.38);
    const resultButtonHeight = Math.max(24, Math.round(overlayHeight * 0.22));
    const resultButtonY =
      overlayHeight - resultButtonHeight - Math.round(overlayHeight * 0.08);

    const playAgainButton = this.makeResultButton(
      Math.round(overlayWidth * 0.06),
      resultButtonY,
      resultButtonWidth,
      resultButtonHeight,
      "▶ Play Again",
      0x2d5a27,
      subFontSize,
    );
    playAgainButton.on("pointerup", () => {
      this.resultPanel.visible = false;
      this.isResultVisible = false;
      this.newGame();
    });
    this.resultPanel.addChild(playAgainButton);

    const collectButton = this.makeResultButton(
      overlayWidth - Math.round(overlayWidth * 0.06) - resultButtonWidth,
      resultButtonY,
      resultButtonWidth,
      resultButtonHeight,
      "✔ Collect",
      0x5a7a27,
      subFontSize,
    );
    collectButton.on("pointerup", () => this.close(this.coinsEarned));
    this.resultPanel.addChild(collectButton);
  }

  private makeResultButton(
    x: number,
    y: number,
    width: number,
    height: number,
    labelText: string,
    backgroundColor: number,
    fontSize: number,
  ): Container {
    const buttonContainer = new Container();
    buttonContainer.x = x;
    buttonContainer.y = y;
    buttonContainer.eventMode = "static";
    buttonContainer.cursor = "pointer";

    const buttonBackground = new Graphics();
    buttonBackground
      .roundRect(0, 0, width, height, 8)
      .fill({ color: backgroundColor });
    buttonContainer.addChild(buttonBackground);

    const buttonLabel = new Text({
      text: labelText,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: fontSize,
        fill: 0xffffff,
      }),
    });
    buttonLabel.anchor.set(0.5);
    buttonLabel.x = width / 2;
    buttonLabel.y = height / 2;
    buttonContainer.addChild(buttonLabel);

    buttonContainer.on("pointerdown", () => {
      buttonContainer.alpha = 0.7;
    });
    buttonContainer.on("pointerupoutside", () => {
      buttonContainer.alpha = 1.0;
    });

    return buttonContainer;
  }

  private newGame(): void {
    this.currentScore = 0;
    this.remainingMoves = TOTAL_MOVES;
    this.coinsEarned = 0;
    this.selectedTile = null;
    this.isBusy = false;
    this.isResultVisible = false;
    this.resultPanel.visible = false;

    let attempts = 0;
    do {
      this.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLUMNS }, () =>
          Math.floor(Math.random() * CROP_KEYS.length),
        ),
      );
      attempts++;
    } while (
      (this.findMatches().length > 0 || !this.hasValidMove()) &&
      attempts < 200
    );

    this.renderBoard();
    this.updateHUD();
    this.setMessage("tap a crop to start!", 0xaad4aa);
  }

  private renderBoard(): void {
    const layout = this.layout;
    this.boardContainer.removeChildren();
    this.tiles = [];

    for (let row = 0; row < ROWS; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < COLUMNS; col++) {
        const tile = this.makeTile(this.board[row][col]);
        tile.x = col * layout.tileStep + layout.tileSize / 2;
        tile.y = row * layout.tileStep + layout.tileSize / 2;
        this.boardContainer.addChild(tile);
        this.tiles[row][col] = tile;
        tile.eventMode = "static";
        tile.cursor = "pointer";
        tile.on("pointerdown", () => this.onTileTap(row, col));
      }
    }
  }

  private makeTile(cropIndex: number): Container {
    const tileSize = this.layout.tileSize;
    const fontSize = this.layout.fontSizes.tile;
    const tileContainer = new Container();
    tileContainer.pivot.set(tileSize / 2, tileSize / 2);

    const texture = this.options.textures?.[CROP_KEYS[cropIndex]];
    if (texture) {
      const sprite = new Sprite(texture);
      sprite.width = tileSize - 4;
      sprite.height = tileSize - 4;
      sprite.x = 2;
      sprite.y = 2;
      tileContainer.addChild(sprite);
    } else {
      const tileBackground = new Graphics();
      tileBackground
        .roundRect(0, 0, tileSize, tileSize, Math.round(tileSize * 0.18))
        .fill({ color: CROP_COLORS[cropIndex], alpha: 0.9 });
      tileContainer.addChild(tileBackground);

      const emojiLabel = new Text({
        text: CROP_EMOJI[cropIndex],
        style: new TextStyle({ fontSize }),
      });
      emojiLabel.anchor.set(0.5);
      emojiLabel.x = tileSize / 2;
      emojiLabel.y = tileSize / 2;
      tileContainer.addChild(emojiLabel);
    }

    const selectionRing = new Graphics();
    selectionRing
      .roundRect(1, 1, tileSize - 2, tileSize - 2, Math.round(tileSize * 0.18))
      .stroke({
        color: 0xffff00,
        width: Math.max(2, Math.round(tileSize * 0.05)),
      });
    selectionRing.visible = false;
    selectionRing.label = "ring";
    tileContainer.addChild(selectionRing);

    return tileContainer;
  }

  private onTileTap(row: number, col: number): void {
    if (this.isBusy) return;

    if (!this.selectedTile) {
      this.selectTile(row, col);
      return;
    }

    const selectedRow = this.selectedTile.row;
    const selectedCol = this.selectedTile.col;

    if (selectedRow === row && selectedCol === col) {
      this.deselectAllTiles();
      return;
    }

    const isAdjacent =
      Math.abs(selectedRow - row) + Math.abs(selectedCol - col) === 1;
    if (!isAdjacent) {
      this.deselectAllTiles();
      this.selectTile(row, col);
      return;
    }

    this.deselectAllTiles();
    this.doSwap(selectedRow, selectedCol, row, col);
  }

  private selectTile(row: number, col: number): void {
    this.selectedTile = { row, col };
    const tile = this.tiles[row]?.[col];
    if (!tile) return;
    const selectionRing = tile.children.find(
      (child) => child.label === "ring",
    ) as Graphics | undefined;
    if (selectionRing) selectionRing.visible = true;
    this.tweenScale(tile, 1.12, 80);
  }

  private deselectAllTiles(): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const tile = this.tiles[row]?.[col];
        if (!tile) continue;
        const selectionRing = tile.children.find(
          (child) => child.label === "ring",
        ) as Graphics | undefined;
        if (selectionRing) selectionRing.visible = false;
        this.tweenScale(tile, 1.0, 80);
      }
    }
    this.selectedTile = null;
  }

  private async doSwap(
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ): Promise<void> {
    this.isBusy = true;
    this.swapBoardData(row1, col1, row2, col2);
    await this.animateSwap(row1, col1, row2, col2);

    if (this.findMatches().length === 0) {
      this.swapBoardData(row1, col1, row2, col2);
      await this.animateSwap(row1, col1, row2, col2);
      this.setMessage("no match there!", 0xff6b6b);
      this.isBusy = false;
      return;
    }

    this.remainingMoves--;
    this.updateHUD();
    await this.resolveMatchChain();

    if (this.currentScore >= TARGET_SCORE) {
      this.showResult(true);
      return;
    }
    if (this.remainingMoves <= 0) {
      this.showResult(false);
      return;
    }
    if (!this.hasValidMove()) {
      await this.reshuffleBoard();
    }

    this.setMessage("", 0xaad4aa);
    this.isBusy = false;
  }

  private async resolveMatchChain(): Promise<void> {
    let chainCount = 0;
    while (true) {
      const matches = this.findMatches();
      if (matches.length === 0) break;
      chainCount++;
      const pointsEarned = matches.length * (10 + (chainCount - 1) * 5);
      this.currentScore += pointsEarned;
      this.setMessage(
        `+${pointsEarned} pts${chainCount > 1 ? ` chain ×${chainCount}!` : ""}`,
        chainCount > 1 ? 0xffd700 : 0x90ee90,
      );
      await this.animatePop(matches);
      this.dropTilesDown();
      this.fillEmptyTiles();
      this.renderBoard();
      this.updateHUD();
      await this.wait(100);
    }
  }

  private swapBoardData(
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ): void {
    const temporary = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temporary;
  }

  private findMatches(): [number, number][] {
    const matchedSet = new Set<number>();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS - 2; col++) {
        const value = this.board[row][col];
        if (value === null) continue;
        if (
          value === this.board[row][col + 1] &&
          value === this.board[row][col + 2]
        ) {
          let endCol = col + 2;
          while (endCol + 1 < COLUMNS && this.board[row][endCol + 1] === value)
            endCol++;
          for (let index = col; index <= endCol; index++)
            matchedSet.add(row * COLUMNS + index);
        }
      }
    }

    for (let col = 0; col < COLUMNS; col++) {
      for (let row = 0; row < ROWS - 2; row++) {
        const value = this.board[row][col];
        if (value === null) continue;
        if (
          value === this.board[row + 1][col] &&
          value === this.board[row + 2][col]
        ) {
          let endRow = row + 2;
          while (endRow + 1 < ROWS && this.board[endRow + 1][col] === value)
            endRow++;
          for (let index = row; index <= endRow; index++)
            matchedSet.add(index * COLUMNS + col);
        }
      }
    }

    return [...matchedSet].map((index) => [
      Math.floor(index / COLUMNS),
      index % COLUMNS,
    ]);
  }

  private dropTilesDown(): void {
    for (let col = 0; col < COLUMNS; col++) {
      let emptyRow = ROWS - 1;
      for (let row = ROWS - 1; row >= 0; row--) {
        if (this.board[row][col] !== null) {
          this.board[emptyRow][col] = this.board[row][col];
          if (emptyRow !== row)
            this.board[row][col] = null as unknown as number;
          emptyRow--;
        }
      }
      for (let row = emptyRow; row >= 0; row--) {
        this.board[row][col] = null as unknown as number;
      }
    }
  }

  private fillEmptyTiles(): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        if (this.board[row][col] === null) {
          this.board[row][col] = Math.floor(Math.random() * CROP_KEYS.length);
        }
      }
    }
  }

  private hasValidMove(): boolean {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        if (col < COLUMNS - 1) {
          this.swapBoardData(row, col, row, col + 1);
          const hasMatch = this.findMatches().length > 0;
          this.swapBoardData(row, col, row, col + 1);
          if (hasMatch) return true;
        }
        if (row < ROWS - 1) {
          this.swapBoardData(row, col, row + 1, col);
          const hasMatch = this.findMatches().length > 0;
          this.swapBoardData(row, col, row + 1, col);
          if (hasMatch) return true;
        }
      }
    }
    return false;
  }

  private async reshuffleBoard(): Promise<void> {
    this.setMessage("reshuffling board...", 0xffd700);
    await this.wait(500);
    let attempts = 0;
    do {
      this.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLUMNS }, () =>
          Math.floor(Math.random() * CROP_KEYS.length),
        ),
      );
      attempts++;
    } while (
      (this.findMatches().length > 0 || !this.hasValidMove()) &&
      attempts < 200
    );
    this.renderBoard();
  }

  private hint(): void {
    if (this.isBusy) return;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        if (col < COLUMNS - 1) {
          this.swapBoardData(row, col, row, col + 1);
          const hasMatch = this.findMatches().length > 0;
          this.swapBoardData(row, col, row, col + 1);
          if (hasMatch) {
            this.flashHintTiles([
              [row, col],
              [row, col + 1],
            ]);
            return;
          }
        }
        if (row < ROWS - 1) {
          this.swapBoardData(row, col, row + 1, col);
          const hasMatch = this.findMatches().length > 0;
          this.swapBoardData(row, col, row + 1, col);
          if (hasMatch) {
            this.flashHintTiles([
              [row, col],
              [row + 1, col],
            ]);
            return;
          }
        }
      }
    }
  }

  private flashHintTiles(cells: [number, number][]): void {
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      cells.forEach(([row, col]) => {
        const tile = this.tiles[row]?.[col];
        if (tile) tile.alpha = tile.alpha > 0.6 ? 0.35 : 1.0;
      });
      if (++flashCount >= 6) {
        clearInterval(flashInterval);
        cells.forEach(([row, col]) => {
          const tile = this.tiles[row]?.[col];
          if (tile) tile.alpha = 1.0;
        });
      }
    }, 150);
  }

  private showResult(won: boolean): void {
    this.coinsEarned = Math.max(0, Math.floor(this.currentScore / 10));
    this.isResultVisible = true;
    this.updateHUD();
    this.resultTitleText.text = won
      ? "🌾 Harvest Complete!"
      : "💀 Out of Moves!";
    this.resultSubText.text = won
      ? `Score: ${this.currentScore}  •  Moves left: ${this.remainingMoves}`
      : `Score: ${this.currentScore}  •  Goal: ${TARGET_SCORE}`;
    this.resultCoinsText.text = `🪙 ${this.coinsEarned} coins earned`;
    this.resultPanel.visible = true;
    this.isBusy = true;
  }

  private restoreResult(): void {
    this.resultTitleText.text =
      this.currentScore >= TARGET_SCORE
        ? "🌾 Harvest Complete!"
        : "💀 Out of Moves!";
    this.resultSubText.text =
      this.currentScore >= TARGET_SCORE
        ? `Score: ${this.currentScore}  •  Moves left: ${this.remainingMoves}`
        : `Score: ${this.currentScore}  •  Goal: ${TARGET_SCORE}`;
    this.resultCoinsText.text = `🪙 ${this.coinsEarned} coins earned`;
    this.resultPanel.visible = true;
  }

  private updateHUD(): void {
    const progressPercent = Math.min(1, this.currentScore / TARGET_SCORE);
    this.scoreText.text = String(this.currentScore);
    this.movesText.text = String(this.remainingMoves);
    this.progressBarFill
      .clear()
      .roundRect(
        0,
        0,
        Math.round(this.layout.boardPixelWidth * progressPercent),
        this.layout.progressBarHeight,
        4,
      )
      .fill({ color: 0x4caf50 });
  }

  private setMessage(text: string, color: number = 0xaad4aa): void {
    this.savedMessage = text;
    this.savedMessageColor = color;
    this.messageText.text = text;
    this.messageText.style.fill = color;
  }

  private async animateSwap(
    row1: number,
    col1: number,
    row2: number,
    col2: number,
  ): Promise<void> {
    const tile1 = this.tiles[row1]?.[col1];
    const tile2 = this.tiles[row2]?.[col2];
    if (!tile1 || !tile2) return;

    const startX1 = tile1.x,
      startY1 = tile1.y;
    const startX2 = tile2.x,
      startY2 = tile2.y;

    for (let step = 1; step <= 8; step++) {
      const progress = step / 8;
      tile1.x = startX1 + (startX2 - startX1) * progress;
      tile1.y = startY1 + (startY2 - startY1) * progress;
      tile2.x = startX2 + (startX1 - startX2) * progress;
      tile2.y = startY2 + (startY1 - startY2) * progress;
      await this.wait(16);
    }

    this.tiles[row1][col1] = tile2;
    this.tiles[row2][col2] = tile1;
    tile1.x = startX2;
    tile1.y = startY2;
    tile2.x = startX1;
    tile2.y = startY1;
  }

  private async animatePop(cells: [number, number][]): Promise<void> {
    const tilesToPop = cells
      .map(([row, col]) => this.tiles[row]?.[col])
      .filter(Boolean) as Container[];

    for (let step = 1; step <= 8; step++) {
      const progress = step / 8;
      const scale = Math.max(
        0,
        1 + 0.15 * Math.sin(Math.PI * progress) - progress * 0.4,
      );
      tilesToPop.forEach((tile) => {
        tile.scale.set(scale);
        tile.alpha = 1 - progress * 0.8;
      });
      await this.wait(18);
    }

    cells.forEach(([row, col]) => {
      const tile = this.tiles[row]?.[col];
      if (tile) {
        this.boardContainer.removeChild(tile);
        tile.destroy({ children: true });
      }
      if (this.tiles[row]) this.tiles[row][col] = null;
      this.board[row][col] = null as unknown as number;
    });
  }

  private tweenScale(
    target: Container,
    targetScale: number,
    durationMs: number,
  ): void {
    const totalSteps = Math.max(1, Math.round(durationMs / 16));
    const startScale = target.scale.x;
    const scaleDelta = targetScale - startScale;
    let currentStep = 0;
    const tick = () => {
      currentStep++;
      target.scale.set(startScale + scaleDelta * (currentStep / totalSteps));
      if (currentStep < totalSteps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
