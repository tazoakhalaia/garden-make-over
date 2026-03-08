import { Container, Graphics, Text } from "pixi.js";
import { drawGradientCard } from "./drawUtils";

export function buildCloseButton(
  container: Container,
  panelX: number,
  panelY: number,
  panelW: number,
  panelH: number,
  disableClose: boolean,
  onClose: () => void,
) {
  const SIDE_PAD = 24;
  const btnW = panelW - SIDE_PAD * 2;
  const btnH = 44;
  const btnX = panelX + SIDE_PAD;
  const btnY = panelY + panelH - btnH - 14;

  const shadow = new Graphics()
    .roundRect(2, 3, btnW, btnH, 13)
    .fill({ color: 0x000000, alpha: 0.3 });
  shadow.position.set(btnX, btnY);
  container.addChild(shadow);

  const btn = new Graphics();
  drawGradientCard(
    btn,
    btnW,
    btnH,
    13,
    disableClose ? 0x1a1a1a : 0x5c1a1a,
    disableClose ? 0x111111 : 0x3a0f0f,
    6,
  );
  btn.position.set(btnX, btnY);
  btn.eventMode = disableClose ? "none" : "dynamic";
  btn.cursor = disableClose ? "default" : "pointer";
  btn.alpha = disableClose ? 0.38 : 1;
  container.addChild(btn);

  const border = new Graphics().roundRect(0, 0, btnW, btnH, 13).stroke({
    color: disableClose ? 0x333333 : 0xff6b6b,
    width: 1.2,
    alpha: 0.55,
  });
  border.position.set(btnX, btnY);
  container.addChild(border);

  const label = new Text({
    text: disableClose ? "🔒  LOCKED" : "✕  CLOSE",
    style: {
      fontSize: 15,
      fill: disableClose ? 0x555555 : 0xff9999,
      fontWeight: "bold",
      letterSpacing: 3,
      fontFamily: "Georgia, serif",
    },
  });
  label.anchor.set(0.5);
  label.position.set(btnX + btnW / 2, btnY + btnH / 2);
  container.addChild(label);

  if (!disableClose) {
    btn.on("pointerdown", (e) => {
      e.stopPropagation();
      onClose();
    });
  }
}
