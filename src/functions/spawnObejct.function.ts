import gsap from "gsap";
import { Object3D, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const objectMap = new Map<string, Object3D>();
const animalMap = new Map<string, Object3D>();

const ANIMAL_SCALES: Record<string, number> = {
  cow: 0.4,
  chicken: 1,
  sheep: 1,
};

loader.load("/models/objects.glb", (gltf) => {
  gltf.scene.children.forEach((child) => objectMap.set(child.name, child));
});

loader.load("/models/cow.glb", (gltf) => animalMap.set("cow", gltf.scene));
loader.load("/models/chicken.glb", (gltf) =>
  animalMap.set("chicken", gltf.scene),
);
loader.load("/models/sheep.glb", (gltf) => animalMap.set("sheep", gltf.scene));

export function spawnPlant(
  scene: Scene,
  x: number,
  y: number,
  z: number,
  itemName: string,
) {
  const template = objectMap.get(itemName);
  if (!template) return;

  const object = template.clone();
  object.position.set(x, y, z);
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

export function spawnAnimal(
  scene: Scene,
  x: number,
  z: number,
  animalName: string,
) {
  const template = animalMap.get(animalName);
  if (!template) {
    return;
  }

  const scale = ANIMAL_SCALES[animalName] ?? 1;
  const object = template.clone();

  object.name = animalName;
  object.position.set(x, 0, z);
  object.scale.set(0, 0, 0);
  object.rotation.y = Math.random() * Math.PI * 2;
  object.traverse((child: any) => {
    child.name = animalName;
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(object);
  gsap.to(object.scale, {
    x: scale,
    y: scale,
    z: scale,
    duration: 0.5,
    ease: "back.out(1.7)",
  });
}
