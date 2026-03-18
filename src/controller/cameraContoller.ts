import gsap from "gsap";
import type { PerspectiveCamera } from "three";
import { Vector3 } from "three";
import type { GameEvents } from "../config";

export class CameraControls {
  private camera!: PerspectiveCamera;
  private isDragging = false;
  private hasDragged = false;
  private enabled = true;
  private lastX = 0;
  private lastY = 0;
  private speed = 0.5;

  private target = new Vector3(0, 0, 0);
  private offset = new Vector3(0, 200, 80);

  private savedTarget = new Vector3();
  private savedPosition = new Vector3();

  init(
    camera: PerspectiveCamera,
    canvas: HTMLCanvasElement,
    gameEvents: GameEvents,
  ) {
    this.camera = camera;

    gameEvents.addEventListener("ui:opened", () => this.setEnabled(false));
    gameEvents.addEventListener("ui:closed", () => this.setEnabled(true));

    window.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("mouseup", () => this.onMouseUp());
    window.addEventListener("touchstart", (e) => this.onTouchStart(e));
    window.addEventListener("touchmove", (e) => this.onTouchMove(e));
    window.addEventListener("touchend", () => this.onTouchEnd());
  }

  zoomToPosition(x: number, y: number, z: number) {
    this.savedTarget.copy(this.target);
    this.savedPosition.copy(this.camera.position);

    const zoomedOffset = new Vector3(0, 80, 30);
    const targetPos = { x, y, z };
    const cameraPos = {
      x: x + zoomedOffset.x,
      y: y + zoomedOffset.y,
      z: z + zoomedOffset.z,
    };

    gsap.to(this.camera.position, {
      x: cameraPos.x,
      y: cameraPos.y,
      z: cameraPos.z,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.lookAt(targetPos.x, targetPos.y, targetPos.z);
      },
    });

    gsap.to(this.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }

  resetPosition() {
    gsap.to(this.camera.position, {
      x: this.savedPosition.x,
      y: this.savedPosition.y,
      z: this.savedPosition.z,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.lookAt(
          this.savedTarget.x,
          this.savedTarget.y,
          this.savedTarget.z,
        );
      },
    });

    gsap.to(this.target, {
      x: this.savedTarget.x,
      y: this.savedTarget.y,
      z: this.savedTarget.z,
      duration: 0.8,
      ease: "power2.inOut",
    });
  }

  private move(deltaX: number, deltaY: number) {
    if (!this.enabled) return;
    this.target.x -= deltaX * this.speed;
    this.target.z -= deltaY * this.speed;
    this.camera.position.set(
      this.target.x + this.offset.x,
      this.target.y + this.offset.y,
      this.target.z + this.offset.z,
    );
    this.camera.lookAt(this.target);
  }

  private onMouseDown(e: MouseEvent) {
    if (!this.enabled) return;
    this.isDragging = true;
    this.hasDragged = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.hasDragged = true;
    this.move(e.clientX - this.lastX, e.clientY - this.lastY);
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onTouchStart(e: TouchEvent) {
    if (!this.enabled) return;
    const touch = e.touches[0];
    this.isDragging = true;
    this.hasDragged = false;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    const touch = e.touches[0];
    this.hasDragged = true;
    this.move(touch.clientX - this.lastX, touch.clientY - this.lastY);
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
  }

  private onTouchEnd() {
    if (this.hasDragged) {
      window.addEventListener("click", this.suppressClick, {
        capture: true,
        once: true,
      });
    }
    this.isDragging = false;
  }

  private suppressClick = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
  };

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  getHasDragged(): boolean {
    return this.hasDragged;
  }

  clamp(minX: number, maxX: number, minZ: number, maxZ: number) {
    if (!this.camera) return;
    this.target.x = Math.max(minX, Math.min(maxX, this.target.x));
    this.target.z = Math.max(minZ, Math.min(maxZ, this.target.z));
    this.camera.position.set(
      this.target.x + this.offset.x,
      this.target.y + this.offset.y,
      this.target.z + this.offset.z,
    );
    this.camera.lookAt(this.target);
  }
}
