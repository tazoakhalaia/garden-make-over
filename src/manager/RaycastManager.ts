import { Camera, Object3D, Raycaster, Vector2, Vector3 } from "three";

export class RaycastManager {
  clickWithPriority(
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement,
    camera: Camera,
    sceneChildren: any[],
    priorityName: string,
  ): { object: Object3D; point: Vector3 } | null {
    const rect = canvas.getBoundingClientRect();
    const mouse = new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sceneChildren, true);

    const priority = intersects.find((i) => i.object.name === priorityName);
    if (priority) return { object: priority.object, point: priority.point };

    if (intersects.length > 0) {
      return { object: intersects[0].object, point: intersects[0].point };
    }

    return null;
  }
}
