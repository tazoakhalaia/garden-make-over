import { Container } from "pixi.js";
import { Raycaster, Vector2, type PerspectiveCamera, type Scene } from "three";
import type { AnimalFence, Placeholder } from "../scene";
import type { Plant } from "../scene/plant";
import type { PixiUI } from "../ui";

export class ClickHandler {
  private raycaster = new Raycaster();
  private mouse = new Vector2();

  private storeCordinates: { x: number; y: number; z: number } | null = null;

  public setupClickHandler(
    pixiCanvas: HTMLCanvasElement,
    perspectiveCamera: PerspectiveCamera,
    scene: Scene,
    uiLayer: Container,
    placeholder: Placeholder,
    animalFence: AnimalFence,
    plant: Plant,
    pixiUI: PixiUI,
  ) {
    pixiCanvas.addEventListener("pointerup", (e) => {
      let pixiHit = false;

      uiLayer.children.forEach((child) => {
        const bounds = (child as Container).getBounds();

        const hit =
          e.clientX >= bounds.x &&
          e.clientX <= bounds.x + bounds.width &&
          e.clientY >= bounds.y &&
          e.clientY <= bounds.y + bounds.height;

        if (hit) {
          pixiHit = true;
          const id = (child as Container).label;

          switch (id) {
            case "PLANT":
              if (this.storeCordinates)
                plant.placePlantAt(
                  this.storeCordinates.x,
                  this.storeCordinates.y,
                  this.storeCordinates.z,
                );
              pixiUI.hideMarket();
              break;
            case "ANIMAL":
              if (this.storeCordinates)
                animalFence.placeFenceAt(
                  this.storeCordinates.x,
                  this.storeCordinates.y,
                  this.storeCordinates.z,
                );
              pixiUI.hideMarket();
              break;
          }
        }
      });

      if (pixiHit) return;

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
          const worldPos = hit.parent!.position;
          placeholder.removePlaceholder(hit);
          pixiUI.showMarket();
          this.storeCordinates = {
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z,
          };
        }
      }
    });
  }
}
