import { Color, Fog, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GameEvents, LoadModels, Spawner } from "../config";
import { CameraControls } from "../controller";
import { AnimalFence } from "./animalFence";
import { Ground } from "./Ground";
import { Lights } from "./lights";
import { Placeholder } from "./placeholder";
import { Plant } from "./plant";
import { Snow } from "./snow";

export class ThreeScene {
  private ground = new Ground();
  public loadAllModels = new LoadModels();
  public lights = new Lights();
  public placeholder = new Placeholder();
  public animalFence = new AnimalFence();
  public plant = new Plant();
  public spawner = new Spawner();
  public cameraController = new CameraControls();
  public snow = new Snow();

  public scene!: Scene;
  public perspectiveCamera!: PerspectiveCamera;
  public renderer!: WebGLRenderer;

  async initThree(
    canvas: HTMLCanvasElement,
    gameEvents: GameEvents,
  ): Promise<void> {
    this.scene = new Scene();
    this.scene.background = new Color(0x87ceeb);
    this.scene.fog = new Fog(0x87ceeb, 100, 500);

    this.perspectiveCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000,
    );
    this.perspectiveCamera.position.set(0, 200, 80);
    this.perspectiveCamera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    await this.loadAllModels.loadAll().then(() => {
      this.lights.sceneLights(this.scene);
      this.animate();
      this.onResize();
      window.addEventListener("resize", () => this.onResize());
      this.cameraController.init(this.perspectiveCamera, canvas, gameEvents);
      this.ground.init(this.scene, this.loadAllModels);
      this.placeholder.createPlaceholder(this.scene, this.loadAllModels);
      this.animalFence.createFence(this.scene, this.loadAllModels);
      this.plant.createPlant(this.scene, this.loadAllModels);
      this.spawner.init(this.scene, this.loadAllModels);
      this.snow.init(this.scene);
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

  animate = () => {
    requestAnimationFrame(this.animate);
    this.cameraController.clamp(-150, 150, -150, 150);
    this.renderer.render(this.scene, this.perspectiveCamera);
  };
}
