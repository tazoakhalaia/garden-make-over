import { Assets, Texture } from "pixi.js";

const IMAGE_MANIFEST = {
  corn: "/images/corn.png",
  grape: "/images/grape.png",
  strawberry: "/images/strawberry.png",
  tomato: "/images/tomato.png",
  chicken: "/images/chicken.png",
  sheep: "/images/sheep.png",
  cow: "/images/cow.png",
  coin: "/images/money.png",
} as const;

const SOUND_MANIFEST = {
  sound_chicken: "/sounds/chicken.mp3",
  sound_cow: "/sounds/cow.mp3",
  sound_sheep: "/sounds/sheep.mp3",
  sound_click: "/sounds/click_003.mp3",
  sound_popup: "/sounds/popup_chest.mp3",
  sound_theme: "/sounds/theme.mp3",
  sound_throw: "/sounds/throw_spear.mp3",
} as const;

export type AssetKey = keyof typeof IMAGE_MANIFEST;
export type SoundAssetKey = keyof typeof SOUND_MANIFEST;

export class AssetLoader {
  private static loaded = false;

  static async loadAll(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded) return;

    const imageEntries = Object.entries(IMAGE_MANIFEST) as [AssetKey, string][];
    const toLoad = imageEntries.filter(([key]) => !Assets.cache.has(key));

    if (toLoad.length > 0) {
      for (const [alias, src] of toLoad) Assets.add({ alias, src });
      await Assets.load(
        toLoad.map(([key]) => key),
        (p: number) => onProgress?.(Math.round(p * 80)),
      );
    }

    const soundEntries = Object.entries(SOUND_MANIFEST) as [
      SoundAssetKey,
      string,
    ][];
    const total = soundEntries.length;

    await Promise.all(
      soundEntries.map(async ([, src], i) => {
        try {
          await fetch(src, { method: "GET", cache: "force-cache" });
        } catch {
          console.warn(`[AssetLoader] Could not preload sound: ${src}`);
        }
        onProgress?.(80 + Math.round(((i + 1) / total) * 20));
      }),
    );

    this.loaded = true;
    onProgress?.(100);
  }

  static get(key: AssetKey): Texture {
    try {
      return Assets.get<Texture>(key) ?? Texture.WHITE;
    } catch {
      console.warn(`[AssetLoader] Texture not found: "${key}"`);
      return Texture.WHITE;
    }
  }

  static isReady(): boolean {
    return this.loaded;
  }

  static async loadOne(key: string, src: string): Promise<Texture> {
    if (Assets.cache.has(key)) return Assets.get<Texture>(key);
    Assets.add({ alias: key, src });
    return await Assets.load(key);
  }
}
