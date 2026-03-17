import { Howl, Howler } from "howler";
import { config } from "./config";

export type AnimalSoundKey = "chicken" | "sheep" | "cow";
export type SfxKey = "click";

export class AudioManager {
  private music!: Howl;
  private animals: Record<AnimalSoundKey, Howl>;
  private sfx: Record<SfxKey, Howl>;
  private muted = false;
  private musicReady = false;
  private sounds = config.sounds;

  constructor() {
    this.animals = {
      chicken: this.makeSound(this.sounds.chickenSound, 0.8),
      sheep: this.makeSound(this.sounds.sheepSound, 0.8),
      cow: this.makeSound(this.sounds.cowSound, 0.8),
    };

    this.sfx = {
      click: this.makeSound(this.sounds.click, 0.5),
    };

    this.music = new Howl({
      src: [this.sounds.mainTheme],
      loop: true,
      volume: 0.35,
      onload: () => {
        this.musicReady = true;
      },
    });
  }

  playMusic(): void {
    if (this.muted) return;
    if (this.music.playing()) return;
    this.music.play();
  }

  stopMusic(): void {
    this.music.stop();
  }

  playAnimal(id: AnimalSoundKey): void {
    this.animals[id]?.play();
  }

  playSfx(key: SfxKey): void {
    this.sfx[key]?.play();
  }

  toggleMute(): boolean {
    this.applyMute(!this.muted);
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private applyMute(mute: boolean): void {
    this.muted = mute;
    Howler.mute(mute);
    if (!mute && this.musicReady && !this.music.playing()) {
      this.music.play();
    }
  }

  private makeSound(src: string, volume: number): Howl {
    return new Howl({ src: [src], volume, preload: true });
  }
}
