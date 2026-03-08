import { Container, Graphics } from "pixi.js";
import { CROP_CONFIG, type CropCategory } from "./cropConfig";
import { buildHeader, HEADER_H } from "./Panelheader";
import { buildCropItem, ITEM_H } from "./Cropitem";
import { buildCloseButton } from "./Closebutton";

const PANEL_W = 400;
const GAP = 10;
const SIDE_PAD = 24;
const FOOTER_H = 72;

export class CropSelector {
  private container = new Container();
  private onSelect: (crop: string) => void;
  private onClose?: () => void;

  constructor(onSelect: (crop: string) => void, onClose?: () => void) {
    this.onSelect = onSelect;
    this.onClose = onClose;
  }

  show(
    stage: Container,
    _x: number,
    _y: number,
    coins: number,
    categories: CropCategory[],
    keepOpen = false,
    disableClose = false,
  ) {
    this.hideOnly();

    const W = window.innerWidth;
    const H = window.innerHeight;

    const overlay = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x020b05, alpha: 0.82 });
    overlay.eventMode = "static";
    overlay.on("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(overlay);

    const filtered = Object.entries(CROP_CONFIG).filter(([, v]) =>
      categories.includes(v.category),
    );

    const panelH =
      HEADER_H + filtered.length * (ITEM_H + GAP) - GAP + FOOTER_H + 20;
    const panelX = Math.round(W / 2 - PANEL_W / 2);
    const panelY = Math.round(H / 2 - panelH / 2);

    buildHeader(this.container, panelX, panelY, PANEL_W, panelH, coins);

    filtered.forEach(([key, crop], i) => {
      const btnY = panelY + HEADER_H + 12 + i * (ITEM_H + GAP);
      const btnX = panelX + SIDE_PAD;
      const btnW = PANEL_W - SIDE_PAD * 2;
      buildCropItem(
        this.container,
        key,
        crop,
        btnX,
        btnY,
        btnW,
        coins >= crop.price,
        (k) => this.onSelect(k),
        keepOpen,
        () => this.hide(),
      );
    });

    buildCloseButton(
      this.container,
      panelX,
      panelY,
      PANEL_W,
      panelH,
      disableClose,
      () => this.hide(),
    );

    stage.addChild(this.container);
  }

  private hideOnly() {
    this.container.removeChildren();
    void this.container.parent?.removeChild(this.container);
  }

  hide() {
    this.container.removeChildren();
    void this.container.parent?.removeChild(this.container);
    this.onClose?.();
  }
}
