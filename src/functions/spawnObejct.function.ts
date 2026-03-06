import { Scene, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

const loader = new GLTFLoader();
let plantModel: Object3D | null = null;

loader.load("/models/objects.glb", (gltf) => {
  plantModel = gltf.scene.children[8];
});

export function spawnObject(scene: Scene, x: number, y: number, z: number) {
  if (!plantModel) return;

  const plant = plantModel.clone();
  plant.position.set(x, y + 0.1, z);

  plant.scale.set(0, 0, 0);

  scene.add(plant);

  gsap.to(plant.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.5,
    ease: "back.out(1.7)",
  });
}
