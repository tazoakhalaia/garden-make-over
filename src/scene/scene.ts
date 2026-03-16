import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { LoadModels, Spawner } from "../config";
import { AnimalFence } from "./animalFence";
import { Ground } from "./ground";
import { Placeholder } from "./placeholder";
import { Plant } from "./plant";

export class ThreeScene {
  private ground = new Ground();
  private loadAllModels = new LoadModels();
  public placeholder = new Placeholder();
  public animalFence = new AnimalFence();
  public plant = new Plant();
  public spawner = new Spawner();

  public scene!: Scene;
  public perspectiveCamera!: PerspectiveCamera;
  public renderer!: WebGLRenderer;

  async initThree(canvas: HTMLCanvasElement): Promise<void> {
    this.scene = new Scene();
    this.perspectiveCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );
    this.perspectiveCamera.position.set(0, 200, 80);
    this.perspectiveCamera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor("cyan");
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    await this.loadAllModels.loadAll().then(() => {
      this.initLights();
      this.animate();
      this.onResize();
      window.addEventListener("resize", () => this.onResize());

      this.ground.init(this.scene, this.loadAllModels);
      this.placeholder.createPlaceholder(this.scene, this.loadAllModels);
      this.animalFence.createFence(this.scene, this.loadAllModels);
      this.plant.createPlant(this.scene, this.loadAllModels);
      this.spawner.init(this.scene, this.loadAllModels);
    });
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
  }

  private initLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.5);

    const directionalLight = new DirectionalLight(0xffffff, 4);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;

    this.scene.add(ambientLight, directionalLight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.perspectiveCamera);
  };
}
