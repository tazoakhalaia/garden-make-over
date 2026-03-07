import gsap from "gsap";
import { Object3D, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
let loadedScene: Object3D | null = null;

loader.load("/models/objects.glb", (gltf) => {
  loadedScene = gltf.scene;
});

const objects = [
  "placeholder",
  "grape_1",
  "grape_2",
  "grape_3",
  "fence",
  "chicken_1",
  "cow_1",
  "sheep_1",
  "corn_1",
  "corn_2",
  "corn_3",
  "strawberry_1",
  "strawberry_2",
  "strawberry_3",
  "tomato_1",
  "tomato_2",
  "tomato_3",
  "ground",
];

export function spawnObject(
  scene: Scene,
  x: number,
  y: number,
  z: number,
  itemName: string,
) {
  if (!loadedScene) return;

  const index = objects.indexOf(itemName);

  if (index === -1) {
    return;
  }
  const object = loadedScene.children[index].clone();
  object.position.set(x, y + 0.1, z);
  object.scale.set(0, 0, 0);
  object.rotation.y = Math.PI / 2;
  object.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(object);

  gsap.to(object.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 0.5,
    ease: "back.out(1.7)",
  });
}
