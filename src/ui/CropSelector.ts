import { Container, Graphics, Text } from "pixi.js";
import { Scene } from "three";
import { CROP_CONFIG, type CropCategory } from "../config/CropConfig";
import type { PlantManager } from "../manager";
import { placedItemsStore } from "../manager/PlaceItemStore";
import { SellPanel } from "../manager/SellPanelManager";
import type { CameraController } from "../scene/CameraController";
import type { SelectorState } from "../scene/SelectorFactory";
import { buildCloseButton } from "./Closebutton";
import type { CoinUI } from "./CoinUi";
import { buildCropItem, ITEM_H } from "./Cropitem";
import { drawGradientCard } from "./drawUtils";
import { buildHeader, HEADER_H } from "./Panelheader";

const PANEL_W = 400;
const GAP = 10;
const SIDE_PAD = 24;
const FOOTER_H = 72 + 58;

export class CropSelector {
  private container = new Container();
  private onSelect: (crop: string) => void;
  private onClose?: () => void;
  private sellPanel?: SellPanel;
  private scene?: Scene;
  private coinUI?: CoinUI;

  constructor(onSelect: (crop: string) => void, onClose?: () => void) {
    this.onSelect = onSelect;
    this.onClose = onClose;
  }

  setContext(
    scene: Scene,
    coinUI: CoinUI,
    onRestorePlaceholder?: (x: number, z: number) => void,
    plantManager?: PlantManager,
    cam?: CameraController,
    selectorState?: SelectorState,
  ) {
    this.scene = scene;
    this.coinUI = coinUI;
    this.sellPanel = new SellPanel(
      () => {},
      onRestorePlaceholder,
      plantManager,
      cam,
      selectorState,
    );
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
      .fill({ color: 0x020b05, alpha: 0.2 });
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

    this.buildSellButton(stage, panelX, panelY, PANEL_W, panelH);

    stage.addChild(this.container);
  }

  private buildSellButton(
    stage: Container,
    panelX: number,
    panelY: number,
    panelW: number,
    panelH: number,
  ) {
    const btnW = panelW - SIDE_PAD * 2;
    const btnH = 44;
    const btnX = panelX + SIDE_PAD;
    const closeBtnY = panelY + panelH - 44 - 14;
    const btnY = closeBtnY - 54;

    const hasSellable = placedItemsStore.getSellable().length > 0;

    const shadow = new Graphics()
      .roundRect(2, 3, btnW, btnH, 13)
      .fill({ color: 0x000000, alpha: 0.3 });
    shadow.position.set(btnX, btnY);
    this.container.addChild(shadow);

    const btn = new Graphics();
    drawGradientCard(
      btn,
      btnW,
      btnH,
      13,
      hasSellable ? 0x1a3a1a : 0x111111,
      hasSellable ? 0x0f250f : 0x0a0a0a,
      6,
    );
    btn.position.set(btnX, btnY);
    btn.eventMode = hasSellable ? "dynamic" : "none";
    btn.cursor = hasSellable ? "pointer" : "default";
    btn.alpha = hasSellable ? 1 : 0.38;
    this.container.addChild(btn);

    const border = new Graphics().roundRect(0, 0, btnW, btnH, 13).stroke({
      color: hasSellable ? 0xffd700 : 0x333333,
      width: 1.2,
      alpha: 0.55,
    });
    border.position.set(btnX, btnY);
    this.container.addChild(border);

    const label = new Text({
      text: hasSellable ? "💰  SELL ITEMS" : "💰  NOTHING TO SELL",
      style: {
        fontSize: 15,
        fill: hasSellable ? 0xffeaa0 : 0x555555,
        fontWeight: "bold",
        letterSpacing: 3,
        fontFamily: "Georgia, serif",
      },
    });
    label.anchor.set(0.5);
    label.position.set(btnX + btnW / 2, btnY + btnH / 2);
    this.container.addChild(label);

    if (hasSellable && this.scene && this.coinUI) {
      const scene = this.scene;
      const coinUI = this.coinUI;

      btn.on("pointerover", () => {
        btn.alpha = 0.8;
        border
          .clear()
          .roundRect(0, 0, btnW, btnH, 13)
          .stroke({ color: 0xffd700, width: 1.8, alpha: 0.9 });
      });
      btn.on("pointerout", () => {
        btn.alpha = 1;
        border
          .clear()
          .roundRect(0, 0, btnW, btnH, 13)
          .stroke({ color: 0xffd700, width: 1.2, alpha: 0.55 });
      });

      btn.on("pointerdown", (e) => {
        e.stopPropagation();
        this.hideOnly();
        this.sellPanel?.show(stage, scene, coinUI);
      });
    }
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
