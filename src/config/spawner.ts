import gsap from "gsap";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3,
  type Scene,
} from "three";
import type { LoadModels } from "./loadModels";

type BuyObjectType = {
  type: "CHICKEN" | "COW" | "SHEEP" | "PLANTMARKET";
  modelName: "chicken" | "cow" | "sheep" | "farmObjects";
  scale: number;
};

export class Spawner {
  private scene!: Scene;
  private loadModel!: LoadModels;
  private buyObjects: BuyObjectType[] = [
    { type: "CHICKEN", modelName: "chicken", scale: 1 },
    { type: "COW", modelName: "cow", scale: 5 },
    { type: "SHEEP", modelName: "sheep", scale: 4 },
    { type: "PLANTMARKET", modelName: "farmObjects", scale: 4 },
  ];

  init(scene: Scene, loadModel: LoadModels) {
    this.scene = scene;
    this.loadModel = loadModel;
  }

  private spawnBurstParticles(x: number, y: number, z: number) {
    const PARTICLE_COUNT = 60;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));

    const material = new PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const particles = new Points(geometry, material);
    particles.position.set(x, y, z);
    this.scene.add(particles);

    const velocities: Vector3[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dir = new Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2,
      ).normalize();

      const speed = 2 + Math.random() * 4;
      velocities.push(dir.multiplyScalar(speed));

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const proxy = { t: 0 };
      const v = velocities[i];
      const duration = 0.4 + Math.random() * 0.5;

      gsap.to(proxy, {
        t: 1,
        duration,
        ease: "power2.out",
        onUpdate() {
          positions[i * 3] = v.x * proxy.t;
          positions[i * 3 + 1] = v.y * proxy.t;
          positions[i * 3 + 2] = v.z * proxy.t;
          geometry.attributes.position.needsUpdate = true;
        },
      });
    }

    gsap.to(material, {
      opacity: 0,
      duration: 0.5,
      delay: 0.25,
      ease: "power1.in",
      onComplete() {
        particles.removeFromParent();
        geometry.dispose();
        material.dispose();
      },
    });
  }

  private spawnShockwave(x: number, y: number, z: number) {
    const geometry = new RingGeometry(0.01, 0.15, 32);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const ring = new Mesh(geometry, material);
    ring.position.set(x, y + 0.1, z);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    gsap.to(ring.scale, {
      x: 32,
      y: 32,
      z: 32,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.to(material, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete() {
        ring.removeFromParent();
        geometry.dispose();
        material.dispose();
      },
    });
  }

  private spawnFlash(x: number, y: number, z: number) {
    const geometry = new SphereGeometry(0.5, 8, 8);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const flash = new Mesh(geometry, material);
    flash.position.set(x, y, z);
    this.scene.add(flash);

    gsap.to(flash.scale, {
      x: 22,
      y: 22,
      z: 22,
      duration: 0.2,
      ease: "power1.out",
    });

    gsap.to(material, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete() {
        flash.removeFromParent();
        geometry.dispose();
        material.dispose();
      },
    });
  }

  spawnObjects(x: number, y: number, z: number, type: string) {
    this.spawnFlash(x, y, z);
    this.spawnShockwave(x, y, z);
    this.spawnBurstParticles(x, y, z);
    let spawnObject;
    const buyObject = this.buyObjects.find((e) => e.type === type);
    if (!buyObject) return;

    if (buyObject.modelName === "farmObjects") {
      spawnObject = this.loadModel
        .getModel(buyObject.modelName)
        .scene.children[2].clone();
    } else {
      spawnObject = this.loadModel.getModel(buyObject.modelName).scene.clone();
    }

    spawnObject.scale.set(0, 0, 0);
    spawnObject.position.set(x, y, z);
    spawnObject.rotation.y = Math.random() * Math.PI * 2;
    this.scene.add(spawnObject);

    gsap.to(spawnObject.scale, {
      x: buyObject.scale,
      y: buyObject.scale,
      z: buyObject.scale,
      duration: 0.5,
      delay: 0.1,
      ease: "back.out(1.7)",
    });
  }
}
