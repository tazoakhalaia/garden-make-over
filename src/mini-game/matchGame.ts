import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";

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

const COLS = 7;
const ROWS = 7;
const TARGET = 500;
const MOVES_TOTAL = 20;

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
  step: number;
  boardPxW: number;
  boardPxH: number;
  pad: number;
  panelW: number;
  panelH: number;
  panelX: number;
  panelY: number;
  hudY: number;
  hudBoxW: number;
  hudBoxH: number;
  barY: number;
  barH: number;
  msgY: number;
  msgH: number;
  boardY: number;
  btnY: number;
  btnH: number;
  fs: {
    title: number;
    hudLabel: number;
    hudVal: number;
    msg: number;
    btn: number;
    tile: number;
  };
}

function calcLayout(sw: number, sh: number): Layout {
  const tileFromW = Math.floor((sw * 0.94 - (COLS - 1) * 4) / COLS);
  const tileFromH = Math.floor((sh * 0.56 - (ROWS - 1) * 4) / ROWS);
  const tileSize = Math.max(30, Math.min(64, tileFromW, tileFromH));
  const tileGap = Math.max(3, Math.round(tileSize * 0.08));
  const step = tileSize + tileGap;
  const boardPxW = COLS * step - tileGap;
  const boardPxH = ROWS * step - tileGap;
  const pad = Math.max(10, Math.round(tileSize * 0.28));
  const s = tileSize / 64;
  const fs = {
    title: Math.max(13, Math.round(20 * s)),
    hudLabel: Math.max(8, Math.round(10 * s)),
    hudVal: Math.max(10, Math.round(16 * s)),
    msg: Math.max(9, Math.round(13 * s)),
    btn: Math.max(9, Math.round(13 * s)),
    tile: Math.max(13, Math.round(28 * s)),
  };
  const hudBoxW = Math.max(70, Math.round(100 * s));
  const hudBoxH = Math.max(30, Math.round(40 * s));
  const hudY = pad + Math.round(24 * s);
  const barH = Math.max(5, Math.round(12 * s));
  const barY = hudY + hudBoxH + Math.round(6 * s);
  const msgH = Math.max(20, Math.round(28 * s));
  const msgY = barY + barH + Math.round(5 * s);
  const boardY = msgY + msgH + Math.round(4 * s);
  const btnH = Math.max(28, Math.round(44 * s));
  const btnY = boardY + boardPxH + pad;
  const panelW = boardPxW + pad * 2;
  const panelH = btnY + btnH + pad;
  const panelX = Math.round((sw - panelW) / 2);
  const panelY = Math.round((sh - panelH) / 2);
  return {
    tileSize,
    tileGap,
    step,
    boardPxW,
    boardPxH,
    pad,
    panelW,
    panelH,
    panelX,
    panelY,
    hudY,
    hudBoxW,
    hudBoxH,
    barY,
    barH,
    msgY,
    msgH,
    boardY,
    btnY,
    btnH,
    fs,
  };
}

export class Match3MiniGame {
  private app: Application;
  private options: Match3Options;

  private root!: Container;
  private panel!: Container;
  private boardCt!: Container;
  private barFill!: Graphics;
  private msgText!: Text;
  private scoreText!: Text;
  private movesText!: Text;
  private resultPanel!: Container;
  private resultTitle!: Text;
  private resultSub!: Text;
  private resultCoins!: Text;

  private board: number[][] = [];
  private tiles: (Container | null)[][] = [];
  private selected: { r: number; c: number } | null = null;
  private busy = false;
  private score = 0;
  private moves = MOVES_TOTAL;
  private coins = 0;
  private built = false;
  private isOpen = false;
  private L!: Layout;

  private savedMsg = "tap a crop to start!";
  private savedMsgColor = 0xaad4aa;
  private resultVisible = false;

  constructor(app: Application, options: Match3Options = {}) {
    this.app = app;
    this.options = options;
  }

  open(): void {
    this.isOpen = true;
    this.rebuild();
    this.root.visible = true;
    this.newGame();
  }

  close(coinsEarned = 0): void {
    this.isOpen = false;
    if (this.root) this.root.visible = false;
    this.options.onClose?.(coinsEarned);
  }

  resize(): void {
    if (!this.isOpen) return;
    this.rebuild();
    this.root.visible = true;
    this.renderBoard();
    this.updateHUD();
    this.setMsg(this.savedMsg, this.savedMsgColor);
    if (this.resultVisible) this.restoreResult();
  }

  destroy(): void {
    if (this.root) {
      this.app.stage.removeChild(this.root);
      this.root.destroy({ children: true });
      this.built = false;
    }
  }

  private rebuild(): void {
    if (this.built) {
      this.app.stage.removeChild(this.root);
      this.root.destroy({ children: true });
      this.built = false;
    }
    this.build();
  }

  private build(): void {
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    this.L = calcLayout(sw, sh);
    const L = this.L;

    this.root = new Container();
    this.root.visible = false;
    this.root.eventMode = "static";
    this.root.interactiveChildren = true;
    this.app.stage.addChild(this.root);

    const dim = new Graphics();
    dim.rect(0, 0, sw, sh).fill({ color: 0x000000, alpha: 0.55 });
    dim.eventMode = "static";
    dim.cursor = "default";
    dim.on("pointerdown", (e) => e.stopPropagation());
    this.root.addChild(dim);

    const panelBg = new Graphics();
    panelBg
      .roundRect(0, 0, L.panelW, L.panelH, 18)
      .fill({ color: 0x1a2e1a })
      .stroke({ color: 0x4caf50, width: 2 });

    this.panel = new Container();
    this.panel.x = L.panelX;
    this.panel.y = L.panelY;
    this.panel.addChild(panelBg);
    this.root.addChild(this.panel);

    const title = new Text({
      text: "🌾 Harvest Match",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: L.fs.title,
        fontWeight: "bold",
        fill: 0xffe066,
      }),
    });
    title.anchor.set(0.5, 0);
    title.x = L.panelW / 2;
    title.y = L.pad - 4;
    this.panel.addChild(title);

    this.scoreText = this.makeHudBox(
      L.pad,
      L.hudY,
      "SCORE",
      String(this.score),
    );
    this.makeHudBox(
      L.panelW / 2 - L.hudBoxW / 2,
      L.hudY,
      "GOAL",
      String(TARGET),
    );
    this.movesText = this.makeHudBox(
      L.panelW - L.pad - L.hudBoxW,
      L.hudY,
      "MOVES",
      String(this.moves),
    );

    const barBg = new Graphics();
    barBg.roundRect(0, 0, L.boardPxW, L.barH, 4).fill({ color: 0x2e4a2e });
    barBg.x = L.pad;
    barBg.y = L.barY;
    this.panel.addChild(barBg);

    this.barFill = new Graphics();
    this.barFill.x = L.pad;
    this.barFill.y = L.barY;
    this.panel.addChild(this.barFill);

    this.msgText = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: L.fs.msg,
        fill: 0xaad4aa,
      }),
    });
    this.msgText.anchor.set(0.5, 0);
    this.msgText.x = L.panelW / 2;
    this.msgText.y = L.msgY;
    this.panel.addChild(this.msgText);

    this.boardCt = new Container();
    this.boardCt.x = L.pad;
    this.boardCt.y = L.boardY;
    this.panel.addChild(this.boardCt);

    const gap = Math.round(L.pad * 0.4);
    const bw1 = Math.round(L.boardPxW * 0.38);
    const bw2 = Math.round(L.boardPxW * 0.27);
    const bw3 = L.boardPxW - bw1 - bw2 - gap * 2;
    this.makeBtn(L.pad, L.btnY, bw1, L.btnH, "🔄 New", 0x2d5a27, () =>
      this.newGame(),
    );
    this.makeBtn(
      L.pad + bw1 + gap,
      L.btnY,
      bw2,
      L.btnH,
      "💡 Hint",
      0x5a4a27,
      () => this.hint(),
    );
    this.makeBtn(
      L.pad + bw1 + gap + bw2 + gap,
      L.btnY,
      bw3,
      L.btnH,
      "✖ Close",
      0x5a2727,
      () => this.close(this.coins),
    );

    this.buildResultPanel();
    this.built = true;
  }

  private makeHudBox(x: number, y: number, label: string, value: string): Text {
    const L = this.L;
    const box = new Graphics();
    box.roundRect(0, 0, L.hudBoxW, L.hudBoxH, 8).fill({ color: 0x2e4a2e });
    box.x = x;
    box.y = y;
    this.panel.addChild(box);
    const lbl = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: L.fs.hudLabel,
        fill: 0x88bb88,
      }),
    });
    lbl.x = 5;
    lbl.y = 4;
    box.addChild(lbl);
    const val = new Text({
      text: value,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: L.fs.hudVal,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    val.x = 5;
    val.y = L.hudBoxH * 0.44;
    box.addChild(val);
    return val;
  }

  private makeBtn(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    color: number,
    cb: () => void,
  ): Container {
    const ct = new Container();
    ct.x = x;
    ct.y = y;
    ct.eventMode = "static";
    ct.cursor = "pointer";
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 8).fill({ color });
    ct.addChild(bg);
    const txt = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: this.L.fs.btn,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    txt.anchor.set(0.5);
    txt.x = w / 2;
    txt.y = h / 2;
    ct.addChild(txt);
    ct.on("pointerdown", () => {
      ct.alpha = 0.7;
    });
    ct.on("pointerup", () => {
      ct.alpha = 1.0;
      cb();
    });
    ct.on("pointerupoutside", () => {
      ct.alpha = 1.0;
    });
    this.panel.addChild(ct);
    return ct;
  }

  private buildResultPanel(): void {
    const L = this.L;
    const ow = Math.min(Math.round(L.panelW * 0.88), 320);
    const oh = Math.round(ow * 0.56);
    const ox = Math.round((L.panelW - ow) / 2);
    const oy = Math.round((L.panelH - oh) / 2);
    const tFs = Math.max(12, L.fs.title);
    const sFs = Math.max(9, L.fs.msg);
    const cFs = Math.max(13, Math.round(tFs * 1.15));

    const bg = new Graphics();
    bg.roundRect(0, 0, ow, oh, 16)
      .fill({ color: 0x0d1f0d, alpha: 0.97 })
      .stroke({ color: 0xffd700, width: 2 });

    this.resultPanel = new Container();
    this.resultPanel.x = ox;
    this.resultPanel.y = oy;
    this.resultPanel.addChild(bg);
    this.resultPanel.visible = false;
    this.panel.addChild(this.resultPanel);

    this.resultTitle = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: tFs,
        fontWeight: "bold",
        fill: 0xffe066,
        align: "center",
      }),
    });
    this.resultTitle.anchor.set(0.5, 0);
    this.resultTitle.x = ow / 2;
    this.resultTitle.y = oh * 0.1;
    this.resultPanel.addChild(this.resultTitle);

    this.resultSub = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: sFs,
        fill: 0xaad4aa,
        align: "center",
      }),
    });
    this.resultSub.anchor.set(0.5, 0);
    this.resultSub.x = ow / 2;
    this.resultSub.y = oh * 0.36;
    this.resultPanel.addChild(this.resultSub);

    this.resultCoins = new Text({
      text: "",
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: cFs,
        fontWeight: "bold",
        fill: 0xffd700,
        align: "center",
      }),
    });
    this.resultCoins.anchor.set(0.5, 0);
    this.resultCoins.x = ow / 2;
    this.resultCoins.y = oh * 0.53;
    this.resultPanel.addChild(this.resultCoins);

    const bw = Math.round(ow * 0.38);
    const bh = Math.max(24, Math.round(oh * 0.22));
    const by = oh - bh - Math.round(oh * 0.08);

    const playBtn = this.makeResultBtn(
      Math.round(ow * 0.06),
      by,
      bw,
      bh,
      "▶ Play Again",
      0x2d5a27,
      sFs,
    );
    playBtn.on("pointerup", () => {
      this.resultPanel.visible = false;
      this.resultVisible = false;
      this.newGame();
    });
    this.resultPanel.addChild(playBtn);

    const colBtn = this.makeResultBtn(
      ow - Math.round(ow * 0.06) - bw,
      by,
      bw,
      bh,
      "✔ Collect",
      0x5a7a27,
      sFs,
    );
    colBtn.on("pointerup", () => this.close(this.coins));
    this.resultPanel.addChild(colBtn);
  }

  private makeResultBtn(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    color: number,
    fs: number,
  ): Container {
    const ct = new Container();
    ct.x = x;
    ct.y = y;
    ct.eventMode = "static";
    ct.cursor = "pointer";
    const bg = new Graphics();
    bg.roundRect(0, 0, w, h, 8).fill({ color });
    ct.addChild(bg);
    const txt = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: "LuckiestGuy Regular",
        fontSize: fs,
        fontWeight: "bold",
        fill: 0xffffff,
      }),
    });
    txt.anchor.set(0.5);
    txt.x = w / 2;
    txt.y = h / 2;
    ct.addChild(txt);
    ct.on("pointerdown", () => {
      ct.alpha = 0.7;
    });
    ct.on("pointerupoutside", () => {
      ct.alpha = 1.0;
    });
    return ct;
  }

  private newGame(): void {
    this.score = 0;
    this.moves = MOVES_TOTAL;
    this.coins = 0;
    this.selected = null;
    this.busy = false;
    this.resultVisible = false;
    this.resultPanel.visible = false;
    let tries = 0;
    do {
      this.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () =>
          Math.floor(Math.random() * CROP_KEYS.length),
        ),
      );
      tries++;
    } while ((this.findMatches().length > 0 || !this.hasMove()) && tries < 200);
    this.renderBoard();
    this.updateHUD();
    this.setMsg("tap a crop to start!", 0xaad4aa);
  }

  private renderBoard(): void {
    const L = this.L;
    this.boardCt.removeChildren();
    this.tiles = [];
    for (let r = 0; r < ROWS; r++) {
      this.tiles[r] = [];
      for (let c = 0; c < COLS; c++) {
        const tile = this.makeTile(this.board[r][c]);
        tile.x = c * L.step + L.tileSize / 2;
        tile.y = r * L.step + L.tileSize / 2;
        this.boardCt.addChild(tile);
        this.tiles[r][c] = tile;
        tile.eventMode = "static";
        tile.cursor = "pointer";
        tile.on("pointerdown", () => this.onTap(r, c));
      }
    }
  }

  private makeTile(cropIdx: number): Container {
    const T = this.L.tileSize;
    const fs = this.L.fs.tile;
    const ct = new Container();
    ct.pivot.set(T / 2, T / 2);
    const tex = this.options.textures?.[CROP_KEYS[cropIdx]];
    if (tex) {
      const sp = new Sprite(tex);
      sp.width = T - 4;
      sp.height = T - 4;
      sp.x = 2;
      sp.y = 2;
      ct.addChild(sp);
    } else {
      const bg = new Graphics();
      bg.roundRect(0, 0, T, T, Math.round(T * 0.18)).fill({
        color: CROP_COLORS[cropIdx],
        alpha: 0.9,
      });
      ct.addChild(bg);
      const label = new Text({
        text: CROP_EMOJI[cropIdx],
        style: new TextStyle({ fontSize: fs }),
      });
      label.anchor.set(0.5);
      label.x = T / 2;
      label.y = T / 2;
      ct.addChild(label);
    }
    const ring = new Graphics();
    ring
      .roundRect(1, 1, T - 2, T - 2, Math.round(T * 0.18))
      .stroke({ color: 0xffff00, width: Math.max(2, Math.round(T * 0.05)) });
    ring.visible = false;
    ring.label = "ring";
    ct.addChild(ring);
    return ct;
  }

  private onTap(r: number, c: number): void {
    if (this.busy) return;
    if (!this.selected) {
      this.selectTile(r, c);
      return;
    }
    const { r: sr, c: sc } = this.selected;
    if (sr === r && sc === c) {
      this.deselectAll();
      return;
    }
    const adjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;
    if (!adjacent) {
      this.deselectAll();
      this.selectTile(r, c);
      return;
    }
    this.deselectAll();
    this.doSwap(sr, sc, r, c);
  }

  private selectTile(r: number, c: number): void {
    this.selected = { r, c };
    const tile = this.tiles[r]?.[c];
    if (!tile) return;
    const ring = tile.children.find((ch) => ch.label === "ring") as
      | Graphics
      | undefined;
    if (ring) ring.visible = true;
    this.tweenScale(tile, 1.12, 80);
  }

  private deselectAll(): void {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const tile = this.tiles[r]?.[c];
        if (!tile) continue;
        const ring = tile.children.find((ch) => ch.label === "ring") as
          | Graphics
          | undefined;
        if (ring) ring.visible = false;
        this.tweenScale(tile, 1.0, 80);
      }
    this.selected = null;
  }

  private async doSwap(
    r1: number,
    c1: number,
    r2: number,
    c2: number,
  ): Promise<void> {
    this.busy = true;
    this.swapData(r1, c1, r2, c2);
    await this.animSwap(r1, c1, r2, c2);
    if (this.findMatches().length === 0) {
      this.swapData(r1, c1, r2, c2);
      await this.animSwap(r1, c1, r2, c2);
      this.setMsg("no match there!", 0xff6b6b);
      this.busy = false;
      return;
    }
    this.moves--;
    this.updateHUD();
    await this.resolveChain();
    if (this.score >= TARGET) {
      this.showResult(true);
      return;
    }
    if (this.moves <= 0) {
      this.showResult(false);
      return;
    }
    if (!this.hasMove()) {
      await this.reshuffle();
    }
    this.setMsg("", 0xaad4aa);
    this.busy = false;
  }

  private async resolveChain(): Promise<void> {
    let chain = 0;
    while (true) {
      const matches = this.findMatches();
      if (matches.length === 0) break;
      chain++;
      const pts = matches.length * (10 + (chain - 1) * 5);
      this.score += pts;
      this.setMsg(
        `+${pts} pts${chain > 1 ? ` chain ×${chain}!` : ""}`,
        chain > 1 ? 0xffd700 : 0x90ee90,
      );
      await this.animPop(matches);
      this.dropDown();
      this.fillTop();
      this.renderBoard();
      this.updateHUD();
      await this.wait(100);
    }
  }

  private swapData(r1: number, c1: number, r2: number, c2: number): void {
    const tmp = this.board[r1][c1];
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = tmp;
  }

  private findMatches(): [number, number][] {
    const matched = new Set<number>();
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS - 2; c++) {
        const v = this.board[r][c];
        if (v === null) continue;
        if (v === this.board[r][c + 1] && v === this.board[r][c + 2]) {
          let e = c + 2;
          while (e + 1 < COLS && this.board[r][e + 1] === v) e++;
          for (let k = c; k <= e; k++) matched.add(r * COLS + k);
        }
      }
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS - 2; r++) {
        const v = this.board[r][c];
        if (v === null) continue;
        if (v === this.board[r + 1][c] && v === this.board[r + 2][c]) {
          let e = r + 2;
          while (e + 1 < ROWS && this.board[e + 1][c] === v) e++;
          for (let k = r; k <= e; k++) matched.add(k * COLS + c);
        }
      }
    return [...matched].map((i) => [Math.floor(i / COLS), i % COLS]);
  }

  private dropDown(): void {
    for (let c = 0; c < COLS; c++) {
      let empty = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (this.board[r][c] !== null) {
          this.board[empty][c] = this.board[r][c];
          if (empty !== r) this.board[r][c] = null as unknown as number;
          empty--;
        }
      }
      for (let r = empty; r >= 0; r--)
        this.board[r][c] = null as unknown as number;
    }
  }

  private fillTop(): void {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (this.board[r][c] === null)
          this.board[r][c] = Math.floor(Math.random() * CROP_KEYS.length);
  }

  private hasMove(): boolean {
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (c < COLS - 1) {
          this.swapData(r, c, r, c + 1);
          const ok = this.findMatches().length > 0;
          this.swapData(r, c, r, c + 1);
          if (ok) return true;
        }
        if (r < ROWS - 1) {
          this.swapData(r, c, r + 1, c);
          const ok = this.findMatches().length > 0;
          this.swapData(r, c, r + 1, c);
          if (ok) return true;
        }
      }
    return false;
  }

  private async reshuffle(): Promise<void> {
    this.setMsg("reshuffling board...", 0xffd700);
    await this.wait(500);
    let tries = 0;
    do {
      this.board = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () =>
          Math.floor(Math.random() * CROP_KEYS.length),
        ),
      );
      tries++;
    } while ((this.findMatches().length > 0 || !this.hasMove()) && tries < 200);
    this.renderBoard();
  }

  private hint(): void {
    if (this.busy) return;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        if (c < COLS - 1) {
          this.swapData(r, c, r, c + 1);
          const ok = this.findMatches().length > 0;
          this.swapData(r, c, r, c + 1);
          if (ok) {
            this.flashHint([
              [r, c],
              [r, c + 1],
            ]);
            return;
          }
        }
        if (r < ROWS - 1) {
          this.swapData(r, c, r + 1, c);
          const ok = this.findMatches().length > 0;
          this.swapData(r, c, r + 1, c);
          if (ok) {
            this.flashHint([
              [r, c],
              [r + 1, c],
            ]);
            return;
          }
        }
      }
  }

  private flashHint(cells: [number, number][]): void {
    let count = 0;
    const iv = setInterval(() => {
      cells.forEach(([r, c]) => {
        const t = this.tiles[r]?.[c];
        if (t) t.alpha = t.alpha > 0.6 ? 0.35 : 1.0;
      });
      if (++count >= 6) {
        clearInterval(iv);
        cells.forEach(([r, c]) => {
          const t = this.tiles[r]?.[c];
          if (t) t.alpha = 1.0;
        });
      }
    }, 150);
  }

  private showResult(won: boolean): void {
    this.coins = Math.max(0, Math.floor(this.score / 10));
    this.resultVisible = true;
    this.updateHUD();
    this.resultTitle.text = won ? "🌾 Harvest Complete!" : "💀 Out of Moves!";
    this.resultSub.text = won
      ? `Score: ${this.score}  •  Moves left: ${this.moves}`
      : `Score: ${this.score}  •  Goal: ${TARGET}`;
    this.resultCoins.text = `🪙 ${this.coins} coins earned`;
    this.resultPanel.visible = true;
    this.busy = true;
  }

  private restoreResult(): void {
    this.resultTitle.text =
      this.score >= TARGET ? "🌾 Harvest Complete!" : "💀 Out of Moves!";
    this.resultSub.text =
      this.score >= TARGET
        ? `Score: ${this.score}  •  Moves left: ${this.moves}`
        : `Score: ${this.score}  •  Goal: ${TARGET}`;
    this.resultCoins.text = `🪙 ${this.coins} coins earned`;
    this.resultPanel.visible = true;
  }

  private updateHUD(): void {
    const pct = Math.min(1, this.score / TARGET);
    this.scoreText.text = String(this.score);
    this.movesText.text = String(this.moves);
    this.barFill
      .clear()
      .roundRect(0, 0, Math.round(this.L.boardPxW * pct), this.L.barH, 4)
      .fill({ color: 0x4caf50 });
  }

  private setMsg(text: string, color: number = 0xaad4aa): void {
    this.savedMsg = text;
    this.savedMsgColor = color;
    this.msgText.text = text;
    this.msgText.style.fill = color;
  }

  private async animSwap(
    r1: number,
    c1: number,
    r2: number,
    c2: number,
  ): Promise<void> {
    const t1 = this.tiles[r1]?.[c1];
    const t2 = this.tiles[r2]?.[c2];
    if (!t1 || !t2) return;
    const x1 = t1.x,
      y1 = t1.y,
      x2 = t2.x,
      y2 = t2.y;
    for (let i = 1; i <= 8; i++) {
      const p = i / 8;
      t1.x = x1 + (x2 - x1) * p;
      t1.y = y1 + (y2 - y1) * p;
      t2.x = x2 + (x1 - x2) * p;
      t2.y = y2 + (y1 - y2) * p;
      await this.wait(16);
    }
    this.tiles[r1][c1] = t2;
    this.tiles[r2][c2] = t1;
    t1.x = x2;
    t1.y = y2;
    t2.x = x1;
    t2.y = y1;
  }

  private async animPop(cells: [number, number][]): Promise<void> {
    const tiles = cells
      .map(([r, c]) => this.tiles[r]?.[c])
      .filter(Boolean) as Container[];
    for (let i = 1; i <= 8; i++) {
      const p = i / 8;
      const scl = Math.max(0, 1 + 0.15 * Math.sin(Math.PI * p) - p * 0.4);
      tiles.forEach((t) => {
        t.scale.set(scl);
        t.alpha = 1 - p * 0.8;
      });
      await this.wait(18);
    }
    cells.forEach(([r, c]) => {
      const t = this.tiles[r]?.[c];
      if (t) {
        this.boardCt.removeChild(t);
        t.destroy({ children: true });
      }
      if (this.tiles[r]) this.tiles[r][c] = null;
      this.board[r][c] = null as unknown as number;
    });
  }

  private tweenScale(target: Container, toScale: number, ms: number): void {
    const steps = Math.max(1, Math.round(ms / 16));
    const from = target.scale.x;
    const delta = toScale - from;
    let step = 0;
    const tick = () => {
      step++;
      target.scale.set(from + delta * (step / steps));
      if (step < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
