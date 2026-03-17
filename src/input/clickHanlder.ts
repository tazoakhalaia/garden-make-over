import { Container } from "pixi.js";
import { PerspectiveCamera, Raycaster, Vector2, type Scene } from "three";
import type { GameEvents } from "../config/gameEvents";
import { plantOrAnimal } from "../enums";
import type { AnimalFence, Placeholder } from "../scene";
import type { Plant } from "../scene/plant";

export class ClickHandler {
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private pendingCoords: { x: number; y: number; z: number } | null = null;
  private animalCords: { x: number; y: number; z: number } | null = null;
  private plantCords: { x: number; y: number; z: number } | null = null;

  private checkClickEvent(
    container: Container,
    e: PointerEvent,
  ): string | null {
    const validLabels = [...Object.values(plantOrAnimal), "BACKGROUND"];

    for (let i = container.children.length - 1; i >= 0; i--) {
      const c = container.children[i] as Container;

      const found = this.checkClickEvent(c, e);
      if (found) return found;

      const bounds = c.getBounds();
      const hit =
        e.clientX >= bounds.x &&
        e.clientX <= bounds.x + bounds.width &&
        e.clientY >= bounds.y &&
        e.clientY <= bounds.y + bounds.height;

      if (hit && validLabels.includes(c.label)) return c.label;
    }
    return null;
  }

  public setupClickHandler(
    pixiCanvas: HTMLCanvasElement,
    perspectiveCamera: PerspectiveCamera,
    scene: Scene,
    uiLayer: Container,
    placeholder: Placeholder,
    animalFence: AnimalFence,
    plant: Plant,
    gameEvents: GameEvents,
  ) {
    pixiCanvas.addEventListener("pointerup", (e) => {
      const id = this.checkClickEvent(uiLayer, e);
      if (id === plantOrAnimal.BACKGROUND) return;
      if (id === plantOrAnimal.PLANT || id === plantOrAnimal.ANIMAL) {
        if (this.pendingCoords) {
          gameEvents.dispatchEvent({
            type: "market:item-selected",
            id,
            ...this.pendingCoords,
          });
        }
        return;
      }

      if (
        id === plantOrAnimal.COW ||
        id === plantOrAnimal.CHICKEN ||
        id === plantOrAnimal.SHEEP
      ) {
        if (this.animalCords) {
          gameEvents.dispatchEvent({
            type: "animalMarket:item-selected",
            id,
            ...this.animalCords,
          });
        }
        return;
      }

      if (id === plantOrAnimal.PLANTMARKET) {
        if (this.plantCords) {
          gameEvents.dispatchEvent({
            type: "buyPlant:item-selected",
            id,
            ...this.plantCords,
          });
        }
        return;
      }

      this.mouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      );

      this.raycaster.setFromCamera(this.mouse, perspectiveCamera);
      const intersects = this.raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;

        const isPlaceholder = placeholder.getPlaceholders().includes(hit);
        if (isPlaceholder) {
          const { x, y, z } = hit.parent!.position;
          placeholder.removePlaceholder(hit);
          this.pendingCoords = { x, y, z };
          gameEvents.dispatchEvent({ type: "placeholder:clicked", x, y, z });
        }

        const clickedFenceIndex = animalFence
          .getHitBoxes()
          .findIndex((box) => box === hit);

        if (clickedFenceIndex !== -1) {
          const { x, y, z } = intersects[0].point;
          this.animalCords = { x, y, z };
          gameEvents.dispatchEvent({
            type: "fence:clicked",
          });
          return;
        }

        const clickedPlant = plant.getHitBoxes().find((box) => box === hit);

        if (clickedPlant) {
          const { x, y, z } = intersects[0].point;
          this.plantCords = { x, y, z };
          gameEvents.dispatchEvent({ type: "plantGround:clicked" });
          return;
        }
      }
    });
  }
}
