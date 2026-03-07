import { Mesh, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Ground {
  private loader = new GLTFLoader();
  public meshes: Mesh[] = [];

  createGround(scene: Scene) {
    this.loader.load(
      "/models/ground.glb",
      (gltf) => {
        const ground = gltf.scene;
        ground.scale.set(1.2, 1, 1);
        ground.position.set(0, -5, 0);
        ground.traverse((child: any) => {
          if (child.isMesh) {
            child.name = "main_ground";
            child.castShadow = true;
            child.receiveShadow = true;
            this.meshes.push(child);
          }
        });
        scene.add(ground);
      },
      undefined,
      (error) => {
        console.error("Error loading ground model:", error);
      },
    );
  }
}
