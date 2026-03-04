import { Mesh, MeshStandardMaterial, PlaneGeometry, type Scene } from "three";

export class Ground {
  private groundMesh?: Mesh;
  private geometry?: PlaneGeometry;
  private material?: MeshStandardMaterial;

  createGround(scene: Scene) {
    this.geometry = new PlaneGeometry(15, 15);
    this.material = new MeshStandardMaterial({
      color: '#34ebae',
    });
    this.groundMesh = new Mesh(this.geometry, this.material);
    this.groundMesh.name = "ground";
    this.groundMesh.rotation.x = -Math.PI / 2;
    scene.add(this.groundMesh);
  }
}
  