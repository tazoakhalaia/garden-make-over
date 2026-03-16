import { Container } from "pixi.js";
import { Raycaster, Vector2, type PerspectiveCamera, type Scene } from "three";
import type { GameEvents } from "../config/gameEvents";
import { plantOrAnimal } from "../enums";
import type { Placeholder } from "../scene";

export class ClickHandler {
  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private pendingCoords: { x: number; y: number; z: number } | null = null;

  private hitTest(container: Container, e: PointerEvent): string | null {
    const validLabels = Object.values(plantOrAnimal);

    for (const child of container.children) {
      const c = child as Container;

      const found = this.hitTest(c, e);
      if (found) return found;

      const bounds = c.getBounds();
      const hit =
        e.clientX >= bounds.x &&
        e.clientX <= bounds.x + bounds.width &&
        e.clientY >= bounds.y &&
        e.clientY <= bounds.y + bounds.height;

      if (hit && validLabels.includes(c.label as plantOrAnimal)) return c.label;
    }
    return null;
  }

  public setupClickHandler(
    pixiCanvas: HTMLCanvasElement,
    perspectiveCamera: PerspectiveCamera,
    scene: Scene,
    uiLayer: Container,
    placeholder: Placeholder,
    gameEvents: GameEvents,
  ) {
    pixiCanvas.addEventListener("pointerup", (e) => {
      const id = this.hitTest(uiLayer, e);

      if (id === "PLANT" || id === "ANIMAL") {
        if (this.pendingCoords) {
          gameEvents.dispatchEvent({
            type: "market:item-selected",
            id,
            ...this.pendingCoords,
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
      }
    });
  }
}
