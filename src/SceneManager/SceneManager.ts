import {
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { Ground } from "./Ground";
import { Lights } from "./Lights";
import { PlacementManager } from "../PlacementManager";
import { spawnObject } from "../functions";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private container: HTMLElement;

  private ground = new Ground();
  private lights = new Lights();

  private raycaster = new Raycaster();
  private mouse = new Vector2();

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(5, 8, 8);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.domElement.addEventListener("click", this.sceneClick);
    this.renderer.setClearColor("#87ceeb");
    this.container.appendChild(this.renderer.domElement);

    this.lights.createLights(this.scene);
    this.ground.createGround(this.scene);
    this.resize();
    window.addEventListener("resize", this.resize);
    this.animate();
  }

  private sceneClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);
    const groundHit = intersects.find((i) => i.object.name === "ground");

    if (groundHit && PlacementManager.selected) {
      const point = intersects[0].point;
      spawnObject(this.scene, Math.round(point.x), Math.round(point.z));
    }
  };

  private resize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
