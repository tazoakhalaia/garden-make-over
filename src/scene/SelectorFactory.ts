import { Container } from "pixi.js";
import { Scene, Vector3 } from "three";
import type { PlantManager } from "../Manager";
import type { PlaceHolder } from "../Manager/Placeholder";
import { soundManager } from "../Manager/SoundManager";
import { spawnAnimal, spawnPlant } from "../functions";
import type { CoinUI } from "../ui/CoinUi";
import { CropSelector } from "../ui/CropSelector";
import { CROP_CONFIG } from "../ui/cropConfig";
import { CameraController } from "./CameraController";

export const ANIMAL_CROPS = ["chicken", "sheep", "cow"];

export interface SelectorState {
  isSelectorOpen: boolean;
  selectorJustClosed: boolean;
  isAnimalSelectorOpen: boolean;
  animalSelectorJustClosed: boolean;
  pendingPosition: Vector3 | null;
  pendingHit: any | null;
}

const ANIMAL_SOUND_MAP: Record<string, "chicken" | "cow" | "sheep"> = {
  chicken: "chicken",
  cow: "cow",
  sheep: "sheep",
};

export function createAnimalSelector(
  state: SelectorState,
  scene: Scene,
  coinUI: CoinUI,
  cam: CameraController,
  spawnFence: (x: number, z: number) => void,
): CropSelector {
  return new CropSelector(
    (crop) => {
      if (!ANIMAL_CROPS.includes(crop)) return;
      const config = CROP_CONFIG[crop];
      if (!coinUI.spend(config.price)) return;
      if (!state.pendingPosition) return;

      const sound = ANIMAL_SOUND_MAP[crop];
      if (sound) soundManager.play(sound);

      const offsetX = (Math.random() - 0.5) * 4;
      const offsetZ = (Math.random() - 0.5) * 4;
      spawnAnimal(
        scene,
        state.pendingPosition.x + offsetX,
        state.pendingPosition.z + offsetZ,
        crop,
      );
    },
    () => {
      state.isAnimalSelectorOpen = false;
      state.animalSelectorJustClosed = true;
      state.pendingPosition = null;
      cam.zoomOut();
    },
  );
}

export function createCropSelector(
  state: SelectorState,
  scene: Scene,
  coinUI: CoinUI,
  cam: CameraController,
  plantManager: PlantManager,
  placeHolder: PlaceHolder,
  stage: Container,
  threeCanvas: HTMLCanvasElement,
  spawnFence: (x: number, z: number) => void,
  onTutorialCornClick: () => void,
): CropSelector {
  return new CropSelector(
    (crop) => {
      state.isSelectorOpen = false;
      state.selectorJustClosed = true;
      cam.zoomOut();
      onTutorialCornClick();

      if (!state.pendingPosition) return;
      const config = CROP_CONFIG[crop];
      if (!coinUI.spend(config.price)) return;

      soundManager.play("click");

      if (crop === "ground" || crop === "fence") {
        if (state.pendingHit?.name === "placeholder") {
          placeHolder.removePlaceholder(scene, state.pendingHit);
        }
        spawnPlant(
          scene,
          state.pendingPosition.x,
          0,
          state.pendingPosition.z,
          crop,
        );
        if (crop === "fence")
          spawnFence(state.pendingPosition.x, state.pendingPosition.z);
      } else {
        plantManager.plant(
          scene,
          new Vector3(state.pendingPosition.x, 0, state.pendingPosition.z),
          crop,
          stage,
          cam.camera,
          threeCanvas,
          coinUI,
          config.reward,
        );
      }

      state.pendingPosition = null;
      state.pendingHit = null;
    },
    () => {
      state.isSelectorOpen = false;
      state.selectorJustClosed = true;
      cam.zoomOut();
    },
  );
}
