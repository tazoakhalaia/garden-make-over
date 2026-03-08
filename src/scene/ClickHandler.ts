import { Application, Container } from "pixi.js";
import { Scene, Vector3 } from "three";
import type { RaycastManager } from "../Manager";
import { soundManager } from "../Manager/SoundManager";
import type { CoinUI } from "../ui/CoinUi";
import type { CropSelector } from "../ui/CropSelector";
import { CameraController } from "./CameraController";
import type { SelectorState } from "./SelectorFactory";

const STEP_CLICK_PLACEHOLDER = 0;

export interface ClickHandlerDeps {
  app: Application;
  stage: Container;
  scene: Scene;
  cam: CameraController;
  raycast: RaycastManager;
  coinUI: CoinUI;
  cropSelector: CropSelector;
  animalSelector: CropSelector;
  pixiCanvas: HTMLCanvasElement;
  state: SelectorState;
  tutorialState: { active: boolean; step: number };
  onAdvanceTutorial: () => void;
}

export function handleClick(e: PointerEvent, deps: ClickHandlerDeps) {
  const { clientX: x, clientY: y } = e;
  const {
    app,
    stage,
    scene,
    cam,
    raycast,
    coinUI,
    cropSelector,
    animalSelector,
    pixiCanvas,
    state,
    tutorialState,
    onAdvanceTutorial,
  } = deps;

  if (isPixiObjectAt(app, stage, x, y)) return;
  if (state.isSelectorOpen || state.isAnimalSelectorOpen) return;

  if (state.selectorJustClosed) {
    state.selectorJustClosed = false;
    return;
  }
  if (state.animalSelectorJustClosed) {
    state.animalSelectorJustClosed = false;
    return;
  }

  const result = raycast.clickWithPriority(
    x,
    y,
    pixiCanvas,
    cam.camera,
    scene.children,
    "placeholder",
  );
  if (!result) return;

  const { object: hit } = result;

  if (hit.name === "fence_trigger") {
    const center = new Vector3();
    hit.getWorldPosition(center);
    state.pendingPosition = new Vector3(center.x, 0, center.z);
    state.pendingHit = hit;
    state.isAnimalSelectorOpen = true;
    cam.zoomTo(center);
    soundManager.play("popup");
    animalSelector.show(stage, x, y, coinUI.total, ["animal"], false, false);
  } else if (hit.name === "placeholder") {
    const pos = new Vector3();
    hit.getWorldPosition(pos);
    state.pendingPosition = new Vector3(pos.x, 0, pos.z);
    state.pendingHit = hit;
    state.isSelectorOpen = true;
    cam.zoomTo(pos);
    soundManager.play("popup");
    cropSelector.show(
      stage,
      x,
      y,
      coinUI.total,
      ["ground"],
      false,
      tutorialState.active,
    );
    if (tutorialState.active && tutorialState.step === STEP_CLICK_PLACEHOLDER) {
      setTimeout(() => onAdvanceTutorial(), 150);
    }
  } else if (hit.name.startsWith("ground")) {
    const pos = new Vector3();
    hit.getWorldPosition(pos);
    state.pendingPosition = new Vector3(pos.x, 0, pos.z);
    state.pendingHit = hit;
    state.isSelectorOpen = true;
    cam.zoomTo(pos);
    soundManager.play("popup");
    cropSelector.show(
      stage,
      x,
      y,
      coinUI.total,
      ["plant"],
      false,
      tutorialState.active,
    );
  }
}

function isPixiObjectAt(
  app: Application,
  stage: Container,
  x: number,
  y: number,
): boolean {
  const hits = app.renderer.events.rootBoundary.hitTest(x, y);
  return hits !== null && hits !== stage;
}
