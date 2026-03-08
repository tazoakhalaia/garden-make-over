import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
import { Scene } from "three";
import type { PlantManager } from "../Manager";
import { soundManager } from "../Manager/SoundManager";
import type { CameraController } from "../scene/CameraController";
import type { SelectorState } from "../scene/SelectorFactory";
import type { CoinUI } from "../ui/CoinUi";
import { drawGradientCard } from "../ui/drawUtils";
import { placedItemsStore, type PlacedItem } from "./PlaceItemStore";

const PANEL_W = 400;
const SIDE_PAD = 24;
const ITEM_H = 52;
const GAP = 8;
const HEADER_H = 80;
const FOOTER_H = 68;

export class SellPanel {
  private container = new Container();
  private onClose?: () => void;
  private onRestorePlaceholder?: (x: number, z: number) => void;
  private plantManager?: PlantManager;
  private cam?: CameraController;
  private selectorState?: SelectorState;

  constructor(
    onClose?: () => void,
    onRestorePlaceholder?: (x: number, z: number) => void,
    plantManager?: PlantManager,
    cam?: CameraController,
    selectorState?: SelectorState,
  ) {
    this.onClose = onClose;
    this.onRestorePlaceholder = onRestorePlaceholder;
    this.plantManager = plantManager;
    this.cam = cam;
    this.selectorState = selectorState;
  }

  show(stage: Container, scene: Scene, coinUI: CoinUI) {
    this.hide();

    const W = window.innerWidth;
    const H = window.innerHeight;

    const overlay = new Graphics()
      .rect(0, 0, W, H)
      .fill({ color: 0x020b05, alpha: 0.2 });
    overlay.eventMode = "static";
    overlay.on("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(overlay);

    const items = placedItemsStore.getSellable();
    const listH =
      items.length > 0 ? items.length * (ITEM_H + GAP) - GAP : ITEM_H;

    const panelH = HEADER_H + 16 + listH + 16 + FOOTER_H;
    const panelX = Math.round(W / 2 - PANEL_W / 2);
    const panelY = Math.round(H / 2 - panelH / 2);

    for (let s = 5; s >= 1; s--) {
      const shadow = new Graphics()
        .roundRect(panelX + s * 3, panelY + s * 4, PANEL_W, panelH, 22)
        .fill({ color: 0x000000, alpha: 0.18 * s });
      this.container.addChild(shadow);
    }

    const panelBg = new Graphics();
    drawGradientCard(panelBg, PANEL_W, panelH, 22, 0x0e2016, 0x09160d, 16);
    panelBg.position.set(panelX, panelY);
    panelBg.eventMode = "static";
    panelBg.on("pointerdown", (e) => e.stopPropagation());
    this.container.addChild(panelBg);

    this.container.addChild(
      new Graphics()
        .roundRect(panelX, panelY, PANEL_W, panelH, 22)
        .stroke({ color: 0xffd700, width: 1.5, alpha: 0.55 }),
    );
    this.container.addChild(
      new Graphics()
        .roundRect(panelX + 2, panelY + 2, PANEL_W - 4, panelH - 4, 20)
        .stroke({ color: 0xffe88a, width: 0.8, alpha: 0.12 }),
    );

    const headerBar = new Graphics();
    drawGradientCard(headerBar, PANEL_W, HEADER_H, 22, 0x3a2800, 0x1e1600, 8);
    headerBar.position.set(panelX, panelY);
    this.container.addChild(headerBar);

    this.container.addChild(
      new Graphics()
        .rect(panelX + 24, panelY + HEADER_H - 1, PANEL_W - 48, 1)
        .fill({ color: 0xffd700, alpha: 0.3 }),
    );

    const icon = new Text({ text: "💰", style: { fontSize: 26 } });
    icon.anchor.set(0.5);
    icon.position.set(panelX + PANEL_W / 2 - 68, panelY + HEADER_H / 2);
    this.container.addChild(icon);

    const title = new Text({
      text: "SELL",
      style: {
        fontSize: 30,
        fill: 0xffeaa0,
        fontWeight: "bold",
        letterSpacing: 8,
        fontFamily: "Georgia, serif",
      },
    });
    title.anchor.set(0, 0.5);
    title.position.set(panelX + PANEL_W / 2 - 48, panelY + HEADER_H / 2);
    this.container.addChild(title);

    if (items.length === 0) {
      const empty = new Text({
        text: "Nothing to sell yet",
        style: {
          fontSize: 15,
          fill: 0x6fcf8a,
          fontFamily: "monospace",
          letterSpacing: 1,
        },
      });
      empty.anchor.set(0.5);
      empty.position.set(
        panelX + PANEL_W / 2,
        panelY + HEADER_H + 16 + ITEM_H / 2,
      );
      this.container.addChild(empty);
    } else {
      items.forEach((item, i) => {
        const btnY = panelY + HEADER_H + 16 + i * (ITEM_H + GAP);
        const btnX = panelX + SIDE_PAD;
        const btnW = PANEL_W - SIDE_PAD * 2;
        this.buildSellItem(item, btnX, btnY, btnW, scene, coinUI, stage);
      });
    }

    this.buildCloseButton(panelX, panelY, panelH);
    stage.addChild(this.container);
  }

  private buildSellItem(
    item: PlacedItem,
    btnX: number,
    btnY: number,
    btnW: number,
    scene: Scene,
    coinUI: CoinUI,
    stage: Container,
  ) {
    const shadow = new Graphics()
      .roundRect(2, 3, btnW, ITEM_H, 12)
      .fill({ color: 0x000000, alpha: 0.25 });
    shadow.position.set(btnX, btnY);
    this.container.addChild(shadow);

    const btn = new Graphics();
    drawGradientCard(btn, btnW, ITEM_H, 12, 0x1a2e1a, 0x0f1f0f, 6);
    btn.position.set(btnX, btnY);
    btn.eventMode = "dynamic";
    btn.cursor = "pointer";
    this.container.addChild(btn);

    const border = new Graphics()
      .roundRect(0, 0, btnW, ITEM_H, 12)
      .stroke({ color: 0xffd700, width: 1.1, alpha: 0.4 });
    border.position.set(btnX, btnY);
    this.container.addChild(border);

    const label = new Text({
      text: item.label,
      style: {
        fontSize: 15,
        fill: 0xc8ffd9,
        fontWeight: "bold",
        fontFamily: "Georgia, serif",
      },
    });
    label.anchor.set(0, 0.5);
    label.position.set(btnX + 16, btnY + ITEM_H / 2);
    this.container.addChild(label);

    const refund = new Text({
      text: `+${item.price} 🪙`,
      style: {
        fontSize: 14,
        fill: 0xffd700,
        fontWeight: "bold",
        fontFamily: "monospace",
      },
    });
    refund.anchor.set(1, 0.5);
    refund.position.set(btnX + btnW - 16, btnY + ITEM_H / 2);
    this.container.addChild(refund);

    btn.on("pointerover", () => {
      btn.alpha = 0.8;
      border
        .clear()
        .roundRect(0, 0, btnW, ITEM_H, 12)
        .stroke({ color: 0xffd700, width: 1.8, alpha: 0.9 });
    });
    btn.on("pointerout", () => {
      btn.alpha = 1;
      border
        .clear()
        .roundRect(0, 0, btnW, ITEM_H, 12)
        .stroke({ color: 0xffd700, width: 1.1, alpha: 0.4 });
    });

    btn.on("pointerdown", (e) => {
      e.stopPropagation();

      const sold = placedItemsStore.remove(item.id);
      if (!sold) return;

      gsap.to(sold.object.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          scene.remove(sold.object);
          if (sold.fenceTrigger) scene.remove(sold.fenceTrigger);
        },
      });

      this.plantManager?.removeAllAtPosition(scene, sold.x, sold.z);

      this.cam?.zoomOut();

      if (this.selectorState) {
        this.selectorState.isSelectorOpen = false;
        this.selectorState.isAnimalSelectorOpen = false;
        this.selectorState.selectorJustClosed = false;
        this.selectorState.animalSelectorJustClosed = false;
        this.selectorState.pendingPosition = null;
        this.selectorState.pendingHit = null;
      }

      coinUI.add(sold.price);
      soundManager.play("click");

      this.onRestorePlaceholder?.(sold.x, sold.z);

      this.hide();
      this.show(stage, scene, coinUI);
    });
  }

  private buildCloseButton(panelX: number, panelY: number, panelH: number) {
    const btnW = PANEL_W - SIDE_PAD * 2;
    const btnH = 44;
    const btnX = panelX + SIDE_PAD;
    const btnY = panelY + panelH - btnH - 14;

    const shadow = new Graphics()
      .roundRect(2, 3, btnW, btnH, 13)
      .fill({ color: 0x000000, alpha: 0.3 });
    shadow.position.set(btnX, btnY);
    this.container.addChild(shadow);

    const btn = new Graphics();
    drawGradientCard(btn, btnW, btnH, 13, 0x5c1a1a, 0x3a0f0f, 6);
    btn.position.set(btnX, btnY);
    btn.eventMode = "dynamic";
    btn.cursor = "pointer";
    this.container.addChild(btn);

    const border = new Graphics()
      .roundRect(0, 0, btnW, btnH, 13)
      .stroke({ color: 0xff6b6b, width: 1.2, alpha: 0.55 });
    border.position.set(btnX, btnY);
    this.container.addChild(border);

    const label = new Text({
      text: "✕  CLOSE",
      style: {
        fontSize: 15,
        fill: 0xff9999,
        fontWeight: "bold",
        letterSpacing: 3,
        fontFamily: "Georgia, serif",
      },
    });
    label.anchor.set(0.5);
    label.position.set(btnX + btnW / 2, btnY + btnH / 2);
    this.container.addChild(label);

    btn.on("pointerdown", (e) => {
      e.stopPropagation();
      if (this.selectorState) {
        this.selectorState.isSelectorOpen = false;
        this.selectorState.isAnimalSelectorOpen = false;
        this.selectorState.selectorJustClosed = false;
        this.selectorState.animalSelectorJustClosed = false;
        this.selectorState.pendingPosition = null;
        this.selectorState.pendingHit = null;
      }
      this.cam?.zoomOut();
      this.hide();
      this.onClose?.();
    });
  }

  hide() {
    this.container.removeChildren();
    this.container.parent?.removeChild(this.container);
  }
}
