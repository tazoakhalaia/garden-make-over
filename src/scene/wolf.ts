import gsap from "gsap";
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  type Scene
} from "three";
import type { GameEvents, LoadModels } from "../config";

const MAX_HEALTH = 100;
const DAMAGE_PER_CLICK = 25;

interface WolfEntry {
  group: Group;
  hitBox: Mesh;
  health: number;
}

export class WolfManager {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private wolves: WolfEntry[] = [];
  private countdownId: number | null = null;
  private isWaveActive = false;
  private gameEvents!: GameEvents;

  private readonly WOLF_COUNT = 5;
  private readonly SPAWN_INTERVAL = 10;
  private readonly SPAWN_RADIUS = 100;
  private readonly WOLF_Y = 20;

  init(scene: Scene, loadModel: LoadModels, gameEvents: GameEvents) {
    this.scene = scene;
    this.loadModel = loadModel;
    this.gameEvents = gameEvents;
  }

  startFirstCountdown() {
    this.startCountdown();
  }

  private startCountdown() {
    if (this.countdownId !== null) return;
    this.gameEvents.dispatchEvent({
      type: "wolf:countdown-start",
      seconds: this.SPAWN_INTERVAL,
    });
    this.countdownId = window.setTimeout(() => {
      this.countdownId = null;
      this.spawnWave();
    }, this.SPAWN_INTERVAL * 1000);
  }

  private spawnWave() {
    this.isWaveActive = true;
    this.gameEvents.dispatchEvent({ type: "wolf:wave-start" });
    for (let i = 0; i < this.WOLF_COUNT; i++) {
      this.spawnWolf();
    }
  }

  private spawnWolf() {
    const angle = Math.random() * Math.PI * 2;
    const radius = this.SPAWN_RADIUS * (0.5 + Math.random() * 0.5);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = this.WOLF_Y;

    const wolfModel = this.loadModel.getModel("wolf").scene.clone();
    wolfModel.scale.set(0, 0, 0);
    wolfModel.rotation.y = angle + Math.PI;

    const hitBox = new Mesh(
      new BoxGeometry(30, 65, 30),
      new MeshBasicMaterial({ visible: false }),
    );
    hitBox.position.set(0, 0, 0);

    const group = new Group();
    group.add(wolfModel, hitBox);
    group.position.set(x, y, z);
    this.scene.add(group);

    const entry: WolfEntry = {
      group,
      hitBox,
      health: MAX_HEALTH,
    };
    this.wolves.push(entry);

    gsap.to(wolfModel.scale, {
      x: 8,
      y: 8,
      z: 8,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
  }

  hitWolf(hitBoxMesh: Mesh) {
    const entry = this.wolves.find((w) => w.hitBox === hitBoxMesh);
    if (!entry) return;

    entry.health = Math.max(0, entry.health - DAMAGE_PER_CLICK);

    gsap.to(entry.group.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 0.08,
      yoyo: true,
      repeat: 1,
    });

    if (entry.health <= 0) {
      this.destroyWolf(entry);
    }
  }

  private destroyWolf(entry: WolfEntry) {
    gsap.to(entry.group.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.3,
      ease: "back.in(1.7)",
      onComplete: () => {
        this.scene.remove(entry.group);
      },
    });

    this.wolves = this.wolves.filter((w) => w !== entry);

    if (this.wolves.length === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.gameEvents.dispatchEvent({ type: "wolf:wave-end" });
      this.startCountdown();
    }
  }

  getHitBoxes(): Mesh[] {
    return this.wolves.map((w) => w.hitBox);
  }
}
