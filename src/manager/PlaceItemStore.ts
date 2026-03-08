import { Object3D } from "three";

export interface PlacedItem {
  id: string;
  type: "ground" | "fence";
  object: Object3D;
  fenceTrigger?: Object3D;
  price: number;
  label: string;
  x: number;
  z: number;
}

class PlacedItemsStore {
  private items: PlacedItem[] = [];

  add(item: PlacedItem) {
    this.items.push(item);
  }

  getAll(): PlacedItem[] {
    return [...this.items];
  }

  getByType(type: "ground" | "fence"): PlacedItem[] {
    return this.items.filter((i) => i.type === type);
  }

  getSellable(): PlacedItem[] {
    return this.items.filter((i) => i.type === "ground" || i.type === "fence");
  }

  remove(id: string): PlacedItem | undefined {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const [item] = this.items.splice(idx, 1);
    return item;
  }

  count(): number {
    return this.items.length;
  }
}

export const placedItemsStore = new PlacedItemsStore();
