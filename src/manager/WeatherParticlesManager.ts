import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
  Vector3,
  type Scene,
} from "three";
type WeatherMode = "none" | "rain" | "leaves";
const PARTICLE_COUNT = 600;

export class WeatherParticles {
  private points?: Points;
  private velocities: Vector3[] = [];
  private mode: WeatherMode = "none";

  update() {
    if (!this.points || this.mode === "none") return;

    const pos = this.points.geometry.attributes.position as BufferAttribute;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const vel = this.velocities[i];

      pos.array[ix] += vel.x;
      pos.array[ix + 1] += vel.y;
      pos.array[ix + 2] += vel.z;

      if (pos.array[ix + 1] < -1) {
        pos.array[ix] = (Math.random() - 0.5) * 30;
        pos.array[ix + 1] = 14 + Math.random() * 4;
        pos.array[ix + 2] = (Math.random() - 0.5) * 30;
      }
    }

    pos.needsUpdate = true;

    if (this.mode === "leaves") {
      const t = Date.now() * 0.001;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        this.velocities[i].x = Math.sin(t + i) * 0.02;
      }
    }
  }

  setMode(scene: Scene, mode: WeatherMode) {
    if (this.points) {
      scene.remove(this.points);
      this.points.geometry.dispose();
      (this.points.material as PointsMaterial).dispose();
      this.points = undefined;
      this.velocities = [];
    }

    this.mode = mode;
    if (mode === "none") return;

    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      this.velocities.push(
        mode === "rain"
          ? new Vector3(0.01, -0.25, 0)
          : new Vector3(0.02, -0.06, 0.01),
      );
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));

    const mat = new PointsMaterial({
      color: mode === "rain" ? new Color(0xadd8e6) : new Color(0xe07b39),
      size: mode === "rain" ? 0.08 : 0.18,
      transparent: true,
      opacity: mode === "rain" ? 0.7 : 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    this.points = new Points(geo, mat);
    scene.add(this.points);
  }
}
