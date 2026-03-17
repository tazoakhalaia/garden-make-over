import type { PerspectiveCamera } from "three";
import { Vector3 } from "three";

export class CameraControls {
  private camera!: PerspectiveCamera;
  private isDragging = false;
  private hasDragged = false;
  private lastX = 0;
  private lastY = 0;
  private speed = 0.5;

  private target = new Vector3(0, 0, 0);

  private offset = new Vector3(0, 200, 80);

  init(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;

    window.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("mouseup", () => this.onMouseUp());

    window.addEventListener("touchstart", (e) => this.onTouchStart(e));
    window.addEventListener("touchmove", (e) => this.onTouchMove(e));
    window.addEventListener("touchend", () => this.onMouseUp());
  }

  private move(deltaX: number, deltaY: number) {
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
    const touch = e.touches[0];
    this.isDragging = true;
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    const touch = e.touches[0];
    this.move(touch.clientX - this.lastX, touch.clientY - this.lastY);
    this.lastX = touch.clientX;
    this.lastY = touch.clientY;
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
