import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";

export function tryGetTexture(key: string): Texture | null {
  try {
    const tex = Assets.get<Texture>(key);
    if (!tex || tex === Texture.WHITE) return null;
    return tex;
  } catch {
    return null;
  }
}

export function addCoinSprite(
  container: Container,
  x: number,
  y: number,
  size: number,
): void {
  const tex = tryGetTexture("coin");
  if (tex) {
    const sprite = new Sprite(tex);
    sprite.width = size;
    sprite.height = size;
    sprite.anchor.set(0.5);
    sprite.position.set(x, y);
    container.addChild(sprite);
  } else {
    const dot = new Graphics().circle(0, 0, size / 2).fill({ color: 0xffe082 });
    dot.position.set(x, y);
    container.addChild(dot);
  }
}

export function drawGradientCard(
  g: Graphics,
  w: number,
  h: number,
  r: number,
  colorTop: number,
  colorBot: number,
  steps = 12,
) {
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r1 =
      ((colorTop >> 16) & 0xff) +
      t * (((colorBot >> 16) & 0xff) - ((colorTop >> 16) & 0xff));
    const g1 =
      ((colorTop >> 8) & 0xff) +
      t * (((colorBot >> 8) & 0xff) - ((colorTop >> 8) & 0xff));
    const b1 = (colorTop & 0xff) + t * ((colorBot & 0xff) - (colorTop & 0xff));
    const color =
      (Math.round(r1) << 16) | (Math.round(g1) << 8) | Math.round(b1);
    const sliceY = (h / steps) * i;
    const sliceH = h / steps + 1;
    if (i === 0 || i === steps - 1) {
      g.roundRect(0, sliceY, w, sliceH, r).fill({ color });
    } else {
      g.rect(0, sliceY, w, sliceH).fill({ color });
    }
  }
}
