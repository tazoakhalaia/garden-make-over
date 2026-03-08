import { Container, Graphics, Text } from "pixi.js";
import { addCoinSprite, drawGradientCard } from "./drawUtils";

const HEADER_H = 100;

export function buildHeader(
  container: Container,
  panelX: number,
  panelY: number,
  panelW: number,
  panelH: number,
  coins: number,
) {
  for (let s = 5; s >= 1; s--) {
    const shadow = new Graphics()
      .roundRect(panelX + s * 3, panelY + s * 4, panelW, panelH, 22)
      .fill({ color: 0x000000, alpha: 0.18 * s });
    container.addChild(shadow);
  }

  const panelBg = new Graphics();
  drawGradientCard(panelBg, panelW, panelH, 22, 0x0e2016, 0x09160d, 16);
  panelBg.position.set(panelX, panelY);
  panelBg.eventMode = "static";
  panelBg.on("pointerdown", (e) => e.stopPropagation());
  container.addChild(panelBg);

  container.addChild(
    new Graphics()
      .roundRect(panelX, panelY, panelW, panelH, 22)
      .stroke({ color: 0x3ddc6e, width: 1.5, alpha: 0.55 }),
  );
  container.addChild(
    new Graphics()
      .roundRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 20)
      .stroke({ color: 0xaaffd0, width: 0.8, alpha: 0.12 }),
  );

  const headerBar = new Graphics();
  drawGradientCard(headerBar, panelW, HEADER_H, 22, 0x1a4a28, 0x0e2016, 8);
  headerBar.position.set(panelX, panelY);
  container.addChild(headerBar);

  container.addChild(
    new Graphics()
      .rect(panelX + 24, panelY + HEADER_H - 1, panelW - 48, 1)
      .fill({ color: 0x3ddc6e, alpha: 0.3 }),
  );

  for (let d = 0; d < 5; d++) {
    const dot = new Graphics()
      .circle(0, 0, 3 - d * 0.3)
      .fill({ color: 0x3ddc6e, alpha: 0.55 - d * 0.08 });
    dot.position.set(panelX + 34 + d * 16, panelY + HEADER_H - 14);
    container.addChild(dot);
  }

  const leafIcon = new Text({ text: "🌿", style: { fontSize: 28 } });
  leafIcon.anchor.set(0.5);
  leafIcon.position.set(panelX + panelW / 2 - 72, panelY + 38);
  container.addChild(leafIcon);

  const title = new Text({
    text: "MARKET",
    style: {
      fontSize: 30,
      fill: 0xc8ffd9,
      fontWeight: "bold",
      letterSpacing: 8,
      fontFamily: "Georgia, serif",
    },
  });
  title.anchor.set(0, 0.5);
  title.position.set(panelX + panelW / 2 - 56, panelY + 38);
  container.addChild(title);

  const subtitle = new Text({
    text: `${coins} coins available`,
    style: {
      fontSize: 13,
      fill: 0x6fcf8a,
      letterSpacing: 2,
      fontFamily: "monospace",
    },
  });
  subtitle.anchor.set(0.5);
  subtitle.position.set(panelX + panelW / 2, panelY + 68);
  container.addChild(subtitle);

  addCoinSprite(
    container,
    panelX + panelW / 2 - subtitle.width / 2 - 14,
    panelY + 68,
    14,
  );
}

export { HEADER_H };

