import { Camera, Raycaster, Vector2 } from "three";

export class RaycastManager {
  click(
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
    camera: Camera,
  ) {
    const rect = canvas.getBoundingClientRect();
    const mouse = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([], true);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  clickWithPriority(
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
    camera: Camera,
    sceneChildren: any[],
    priorityName: string,
  ) {
    const rect = canvas.getBoundingClientRect();
    const mouse = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sceneChildren, true);

    const priority = intersects.find((i) => i.object.name === priorityName);
    if (priority) return priority.object;

    return intersects.length > 0 ? intersects[0].object : null;
  }
}
