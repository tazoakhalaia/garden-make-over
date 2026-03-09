type SoundKey =
  | "chicken"
  | "cow"
  | "sheep"
  | "click"
  | "popup"
  | "theme"
  | "throw";

const SOUND_SRC: Record<SoundKey, string> = {
  chicken: "/sounds/chicken.mp3",
  cow: "/sounds/cow.mp3",
  sheep: "/sounds/sheep.mp3",
  click: "/sounds/click_003.mp3",
  popup: "/sounds/popup_chest.mp3",
  theme: "/sounds/theme.mp3",
  throw: "/sounds/throw_spear.mp3",
};

class SoundManager {
  private cache = new Map<SoundKey, HTMLAudioElement>();
  private enabled = false;
  private themeAudio: HTMLAudioElement | null = null;

  enable() {
    this.enabled = true;
    for (const [key, src] of Object.entries(SOUND_SRC) as [
      SoundKey,
      string,
    ][]) {
      if (!this.cache.has(key)) {
        this.cache.set(key, new Audio(src));
      }
    }
  }

  disable() {
    this.enabled = false;
    this.stopTheme();
  }

  get isEnabled() {
    return this.enabled;
  }

  play(key: SoundKey, volume = 1) {
    if (!this.enabled) return;
    const audio = this.cache.get(key);
    if (!audio) return;
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = Math.min(1, Math.max(0, volume));
    clone
      .play()
      .catch((err) => console.warn(`[SoundManager] "${key}" failed:`, err));
  }

  playTheme() {
    if (!this.enabled || this.themeAudio) return;
    this.themeAudio = new Audio(SOUND_SRC.theme);
    this.themeAudio.loop = true;
    this.themeAudio.volume = 0.4;
    this.themeAudio
      .play()
      .catch((err) => console.warn("[SoundManager] theme failed:", err));
  }

  stopTheme() {
    if (!this.themeAudio) return;
    this.themeAudio.pause();
    this.themeAudio.currentTime = 0;
    this.themeAudio = null;
  }
}

export const soundManager = new SoundManager();
