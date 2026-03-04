import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";

export function spawnObject(scene: Scene, x: number, z: number) {
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshStandardMaterial({ color: "white" });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(x, 0.5, z);
  scene.add(mesh);
}
