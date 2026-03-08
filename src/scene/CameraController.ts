import gsap from "gsap";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export const DEFAULT_CAM = { x: 0, y: 22, z: 15 };
export const DEFAULT_LOOKAT = { x: 0, y: 0, z: 0 };

export class CameraController {
  readonly camera: PerspectiveCamera;
  private lookAt: Vector3;
  private orbitControl?: OrbitControls;

  constructor(width: number, height: number) {
    this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);
    this.camera.lookAt(DEFAULT_LOOKAT.x, DEFAULT_LOOKAT.y, DEFAULT_LOOKAT.z);
    this.lookAt = new Vector3(
      DEFAULT_LOOKAT.x,
      DEFAULT_LOOKAT.y,
      DEFAULT_LOOKAT.z,
    );
  }

  zoomTo(worldPos: Vector3) {
    if (this.orbitControl) this.orbitControl.enabled = false;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.camera.position, {
      x: worldPos.x,
      y: 12,
      z: worldPos.z + 8,
      duration: 0.6,
      ease: "power2.inOut",
    });
    gsap.to(this.lookAt, {
      x: worldPos.x,
      y: 0,
      z: worldPos.z,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () =>
        void this.orbitControl?.target.set(
          this.lookAt.x,
          this.lookAt.y,
          this.lookAt.z,
        ),
    });
  }

  zoomOut() {
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookAt);
    gsap.to(this.camera.position, {
      x: DEFAULT_CAM.x,
      y: DEFAULT_CAM.y,
      z: DEFAULT_CAM.z,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        if (this.orbitControl) this.orbitControl.enabled = true;
      },
    });
    gsap.to(this.lookAt, {
      x: DEFAULT_LOOKAT.x,
      y: DEFAULT_LOOKAT.y,
      z: DEFAULT_LOOKAT.z,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () =>
        void this.orbitControl?.target.set(
          this.lookAt.x,
          this.lookAt.y,
          this.lookAt.z,
        ),
    });
  }

  toScreen(worldPos: Vector3): { x: number; y: number } {
    const vec = worldPos.clone().project(this.camera);
    return {
      x: ((vec.x + 1) / 2) * window.innerWidth,
      y: ((-vec.y + 1) / 2) * window.innerHeight,
    };
  }

  tick() {
    this.camera.lookAt(this.lookAt);
    this.orbitControl?.update();
  }
}
