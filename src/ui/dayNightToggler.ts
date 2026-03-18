import gsap from "gsap";
import { Container, Graphics, Text, TextStyle } from "pixi.js";
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  PointLight,
  Scene,
} from "three";

const DAY = {
  skyColor: 0x87ceeb,
  fogColor: 0x87ceeb,
  fogNear: 100,
  fogFar: 500,
  hemiSky: 0xfff4e0,
  hemiGround: 0x88aa55,
  hemiIntensity: 2.2,
  sunColor: 0xfff1c1,
  sunIntensity: 3.5,
  fillColor: 0xc8d8ff,
  fillIntensity: 0.6,
  accentColor: 0xffd580,
  accentIntensity: 2.5,
};

const NIGHT = {
  skyColor: 0x0d1b3e,
  fogColor: 0x0d1b3e,
  fogNear: 80,
  fogFar: 400,
  hemiSky: 0x2a3f7c,
  hemiGround: 0x1a1a2e,
  hemiIntensity: 0.75,
  sunColor: 0x4466cc,
  sunIntensity: 0.9,
  fillColor: 0x3355aa,
  fillIntensity: 0.5,
  accentColor: 0x88aaff,
  accentIntensity: 1.8,
};

export class DayNightToggler {
  private container: Container | null = null;
  private isDay = true;

  private scene!: Scene;
  private hemi!: HemisphereLight;
  private sun!: DirectionalLight;
  private fill!: DirectionalLight;
  private accent!: PointLight;

  initScene(
    scene: Scene,
    hemi: HemisphereLight,
    sun: DirectionalLight,
    fill: DirectionalLight,
    accent: PointLight,
  ) {
    this.scene = scene;
    this.hemi = hemi;
    this.sun = sun;
    this.fill = fill;
    this.accent = accent;
  }

  create(parent: Container): void {
    this.container = new Container();
    this.container.eventMode = "static";
    this.container.cursor = "pointer";
    this.container.x = 60

    this.drawButton();

    this.container.on("pointerdown", () => {
      this.container!.alpha = 0.75;
    });
    this.container.on("pointerupoutside", () => {
      this.container!.alpha = 1;
    });
    this.container.on("pointerup", () => {
      this.container!.alpha = 1;
      this.toggle();
    });

    parent.addChild(this.container);
    this.reposition();
  }

  reposition(): void {
    if (!this.container) return;
    const size = this.btnSize();
    const margin = this.margin();
    this.container.x = window.innerWidth - size - margin;
    this.container.y = margin + this.btnSize() + Math.round(margin * 0.6) - 60;
    this.drawButton();
  }

  destroy(): void {
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }
  }

  toggle(): void {
    this.isDay = !this.isDay;
    this.drawButton();
    this.transitionLighting(this.isDay ? DAY : NIGHT);
  }

  isDaytime(): boolean {
    return this.isDay;
  }

  private drawButton(): void {
    if (!this.container) return;
    this.container.removeChildren();

    const SIZE = this.btnSize();
    const calculateSize = SIZE / 2;

    const shadow = new Graphics();
    shadow
      .circle(calculateSize + 2, calculateSize + 3, calculateSize)
      .fill({ color: 0x000000, alpha: 0.2 });
    this.container.addChild(shadow);

    const bg = new Graphics();
    bg.circle(calculateSize, calculateSize, calculateSize).fill({
      color: this.isDay ? 0x38bdf8 : 0x0f172a,
    });
    this.container.addChild(bg);

    const ring = new Graphics();
    ring.circle(calculateSize, calculateSize, calculateSize - 1).stroke({
      color: this.isDay ? 0xfbbf24 : 0x6366f1,
      width: Math.max(2, SIZE * 0.05),
    });
    this.container.addChild(ring);

    const icon = new Text({
      text: this.isDay ? "☀️" : "🌙",
      style: new TextStyle({ fontSize: Math.round(SIZE * 0.46) }),
    });
    icon.anchor.set(0.5);
    icon.x = calculateSize;
    icon.y = calculateSize - Math.round(SIZE * 0.04);
    this.container.addChild(icon);

    if (SIZE >= 48) {
      const dayNightLabel = new Text({
        text: this.isDay ? "DAY" : "NIGHT",
        style: new TextStyle({
          fontFamily: "Arial",
          fontSize: Math.max(7, Math.round(SIZE * 0.16)),
          fill: this.isDay ? 0xfef9c3 : 0xc7d2fe,
          letterSpacing: 0.5,
        }),
      });
      dayNightLabel.anchor.set(0.5);
      dayNightLabel.x = calculateSize;
      dayNightLabel.y = calculateSize + Math.round(SIZE * 0.28);
      this.container.addChild(dayNightLabel);
    }
  }

  private transitionLighting(preset: typeof DAY, duration = 2.5): void {
    if (!this.scene || !this.hemi || !this.sun || !this.fill || !this.accent)
      return;
    if (!this.scene.fog || !this.scene.background) return;

    const bgColor = new Color(preset.skyColor);
    const fogColor = new Color(preset.fogColor);
    const hemiSky = new Color(preset.hemiSky);
    const hemiGnd = new Color(preset.hemiGround);
    const sunCol = new Color(preset.sunColor);
    const fillCol = new Color(preset.fillColor);
    const accCol = new Color(preset.accentColor);

    const proxy = { t: 0 };

    const fromBg = (this.scene.background as Color).clone();
    const fromFog = (this.scene.fog as Fog).color.clone();
    const fromHSky = this.hemi.color.clone();
    const fromHGnd = this.hemi.groundColor.clone();
    const fromHInt = this.hemi.intensity;
    const fromSCol = this.sun.color.clone();
    const fromSInt = this.sun.intensity;
    const fromFCol = this.fill.color.clone();
    const fromFInt = this.fill.intensity;
    const fromACol = this.accent.color.clone();
    const fromAInt = this.accent.intensity;
    const fromFogNear = (this.scene.fog as Fog).near;
    const fromFogFar = (this.scene.fog as Fog).far;

    gsap.to(proxy, {
      t: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = proxy.t;
        const lerp = (a: number, b: number) => a + (b - a) * t;

        (this.scene.background as Color).lerpColors(fromBg, bgColor, t);
        (this.scene.fog as Fog).color.lerpColors(fromFog, fogColor, t);
        (this.scene.fog as Fog).near = lerp(fromFogNear, preset.fogNear);
        (this.scene.fog as Fog).far = lerp(fromFogFar, preset.fogFar);

        this.hemi.color.lerpColors(fromHSky, hemiSky, t);
        this.hemi.groundColor.lerpColors(fromHGnd, hemiGnd, t);
        this.hemi.intensity = lerp(fromHInt, preset.hemiIntensity);

        this.sun.color.lerpColors(fromSCol, sunCol, t);
        this.sun.intensity = lerp(fromSInt, preset.sunIntensity);

        this.fill.color.lerpColors(fromFCol, fillCol, t);
        this.fill.intensity = lerp(fromFInt, preset.fillIntensity);

        this.accent.color.lerpColors(fromACol, accCol, t);
        this.accent.intensity = lerp(fromAInt, preset.accentIntensity);
      },
    });
  }

  private btnSize(): number {
    const w = window.innerWidth;
    if (w < 400) return 40;
    if (w < 768) return 48;
    return 54;
  }

  private margin(): number {
    return window.innerWidth < 768 ? 30 : 20;
  }
}
