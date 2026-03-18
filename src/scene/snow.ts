import gsap from "gsap";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  type Scene,
} from "three";

export class Snow {
  private scene!: Scene;
  private fallingParticles!: Points;
  private groundMeshes: Mesh[] = [];
  private isSnowing = false;
  private animationId: number | null = null;

  private readonly PARTICLE_COUNT = 2000;
  private readonly SPREAD = 300;
  private readonly HEIGHT = 200;

  init(scene: Scene) {
    this.scene = scene;
  }

  toggle() {
    if (this.isSnowing) {
      this.stop();
    } else {
      this.start();
    }
  }

  private start() {
    this.isSnowing = true;
    this.createFallingSnow();
    this.createGroundSnow();
    this.animate();
  }

  private stop() {
    this.isSnowing = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.fallingParticles) {
      gsap.to(this.fallingParticles.material as PointsMaterial, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          this.scene.remove(this.fallingParticles);
          this.fallingParticles.geometry.dispose();
          (this.fallingParticles.material as PointsMaterial).dispose();
        },
      });
    }

    this.groundMeshes.forEach((mesh) => {
      gsap.to(mesh.material as MeshBasicMaterial, {
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
          this.scene.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as MeshBasicMaterial).dispose();
        },
      });
    });
    this.groundMeshes = [];
  }

  private createFallingSnow() {
    const positions = new Float32Array(this.PARTICLE_COUNT * 3);
    const speeds = new Float32Array(this.PARTICLE_COUNT);

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.SPREAD;
      positions[i * 3 + 1] = Math.random() * this.HEIGHT;
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.SPREAD;
      speeds[i] = 0.1 + Math.random() * 0.3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.userData.speeds = speeds;

    const material = new PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    this.fallingParticles = new Points(geometry, material);
    this.scene.add(this.fallingParticles);

    gsap.to(material, { opacity: 0.85, duration: 1.5 });
  }

  private createGroundSnow() {
    const patches = [
      { x: 0, z: 0, size: 280 },
      { x: 80, z: 80, size: 120 },
      { x: -80, z: 60, size: 100 },
      { x: 60, z: -80, size: 110 },
      { x: -60, z: -60, size: 90 },
    ];

    patches.forEach(({ x, z, size }) => {
      const geometry = new PlaneGeometry(size, size);
      const material = new MeshBasicMaterial({
        color: 0xeef6ff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

      const mesh = new Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, 0.5, z);
      this.scene.add(mesh);
      this.groundMeshes.push(mesh);

      gsap.to(material, {
        opacity: 0.6,
        duration: 2,
        delay: Math.random() * 0.5,
      });
    });
  }

  private animate() {
    if (!this.isSnowing) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    const positions = this.fallingParticles.geometry.attributes.position
      .array as Float32Array;
    const speeds = this.fallingParticles.geometry.userData
      .speeds as Float32Array;

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      positions[i * 3 + 1] -= speeds[i];

      positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.02;

      if (positions[i * 3 + 1] < 0) {
        positions[i * 3] = (Math.random() - 0.5) * this.SPREAD;
        positions[i * 3 + 1] = this.HEIGHT;
        positions[i * 3 + 2] = (Math.random() - 0.5) * this.SPREAD;
      }
    }

    this.fallingParticles.geometry.attributes.position.needsUpdate = true;
  }
}
