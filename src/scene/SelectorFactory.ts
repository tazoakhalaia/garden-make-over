import { Container } from "pixi.js";
import { Scene, Vector3 } from "three";
import type { PlantManager } from "../Manager";
import { placedItemsStore } from "../Manager/PlaceItemStore";
import type { PlaceHolder } from "../Manager/Placeholder";
import { soundManager } from "../Manager/SoundManager";
import { CROP_CONFIG } from "../config/CropConfig";
import { spawnAnimal, spawnPlant } from "../functions";
import type { CoinUI } from "../ui/CoinUi";
import { CropSelector } from "../ui/CropSelector";
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

let _itemIdCounter = 0;
function nextId() {
  return `item_${++_itemIdCounter}`;
}

export function createAnimalSelector(
  state: SelectorState,
  scene: Scene,
  coinUI: CoinUI,
  cam: CameraController,
  spawnFence: (x: number, z: number) => void,
  placeHolder: PlaceHolder,
  plantManager: PlantManager,
): CropSelector {
  const selector = new CropSelector(
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

  selector.setContext(
    scene,
    coinUI,
    (x, z) => placeHolder.restorePlaceholder(scene, x, z),
    plantManager,
    cam,
    state,
  );

  return selector;
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
  const selector = new CropSelector(
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

        const spawnedObject = spawnPlant(
          scene,
          state.pendingPosition.x,
          0,
          state.pendingPosition.z,
          crop,
        );

        let fenceTriggerObj: any = undefined;
        if (crop === "fence") {
          spawnFence(state.pendingPosition.x, state.pendingPosition.z);
          fenceTriggerObj = [...scene.children]
            .reverse()
            .find((c) => c.name === "fence_trigger");
        }

        if (spawnedObject) {
          placedItemsStore.add({
            id: nextId(),
            type: crop as "ground" | "fence",
            object: spawnedObject,
            fenceTrigger: fenceTriggerObj,
            price: config.price,
            label: config.label.replace("Buy ", "Sell "),
            x: state.pendingPosition.x,
            z: state.pendingPosition.z,
          });
        }
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

  selector.setContext(
    scene,
    coinUI,
    (x, z) => placeHolder.restorePlaceholder(scene, x, z),
    plantManager,
    cam,
    state,
  );

  return selector;
}
