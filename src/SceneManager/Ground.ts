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
        ground.name = "ground";
        ground.scale.set(1, 1, 1);
        ground.position.set(0, 0, 0);

        ground.traverse((child: any) => {
          if (child.isMesh) {
            child.name = "ground";
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
