import * as PIXI from "pixi.js";
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
import { OrbitControls } from "three/examples/jsm/Addons.js";

export class SceneManager {
  private scene: Scene;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  private container: HTMLElement;

  private pixiApp: PIXI.Application;
  private pixiContainer = new PIXI.Container();

  private ground = new Ground();
  private lights = new Lights();
  private raycaster = new Raycaster();
  private mouse = new Vector2();

  private orbitControls?: OrbitControls;

  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 25, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#87ceeb");
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener("click", this.sceneClick);

    this.pixiApp = new PIXI.Application();
    this.initPixi();
    // this.orbitController();

    this.lights.createLights(this.scene);
    this.ground.createGround(this.scene);
    this.animate();
  }

  private async initPixi() {
    await this.pixiApp.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
    });

    const pixiCanvas = this.pixiApp.canvas;

    pixiCanvas.style.position = "absolute";
    pixiCanvas.style.top = "0";
    pixiCanvas.style.left = "0";
    pixiCanvas.style.pointerEvents = "none";

    this.container.appendChild(pixiCanvas);
    this.pixiApp.stage.addChild(this.pixiContainer);
  }

  orbitController() {
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.orbitControls.enableZoom = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.minPolarAngle = 0;
    this.orbitControls.minZoom = 0;
    this.orbitControls.maxZoom = 50;
  }

  private sceneClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true,
    );
    const groundHit = intersects.find((i) => i.object.name === "ground");

    if (groundHit && PlacementManager.selected) {
      const point = groundHit.point;
      spawnObject(
        this.scene,
        Math.round(point.x),
        point.y,
        Math.round(point.z),
      );
    }
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
