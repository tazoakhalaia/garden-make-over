import type { PlacementType } from "../types";

export class PlacementManager {
  public static selected?: PlacementType = null;

  static selectedType(type: PlacementType) {
    this.selected = type;
  }
}
