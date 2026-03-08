import { Assets, Texture } from "pixi.js";

const ASSET_MANIFEST = {
  corn: "public/images/corn.png",
  grape: "public/images/grape.png",
  strawberry: "public/images/strawberry.png",
  tomato: "public/images/tomato.png",

  chicken: "public/images/cow.png",
  sheep: "public/images/sheep.png",
  cow: "public/images/cow.png",

  coin: "public/images/money.png",
} as const;

export type AssetKey = keyof typeof ASSET_MANIFEST;

export class AssetLoader {
  private static loaded = false;
  private static onProgressCallback: ((progress: number) => void) | null = null;

  static async loadAll(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded) return;

    this.onProgressCallback = onProgress ?? null;

    const entries = Object.entries(ASSET_MANIFEST) as [AssetKey, string][];

    const toLoad = entries.filter(([key]) => !Assets.cache.has(key));

    if (toLoad.length === 0) {
      this.loaded = true;
      onProgress?.(100);
      return;
    }

    for (const [alias, src] of toLoad) {
      Assets.add({ alias, src });
    }

    const keys = toLoad.map(([key]) => key);
    await Assets.load(keys, (progress: number) => {
      onProgress?.(Math.round(progress * 100));
    });

    this.loaded = true;
    onProgress?.(100);
  }

  static get(key: AssetKey): Texture {
    try {
      return Assets.get<Texture>(key) ?? Texture.WHITE;
    } catch {
      console.warn(`[AssetLoader] Texture not found for key: "${key}"`);
      return Texture.WHITE;
    }
  }
  static isReady(): boolean {
    return this.loaded;
  }

  static async loadOne(key: string, src: string): Promise<Texture> {
    if (Assets.cache.has(key)) {
      return Assets.get<Texture>(key);
    }
    Assets.add({ alias: key, src });
    return await Assets.load(key);
  }
}
