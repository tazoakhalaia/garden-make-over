export type CropCategory = "plant" | "ground" | "animal";

export interface CropEntry {
  label: string;
  price: number;
  reward: number;
  category: CropCategory;
}

export const CROP_CONFIG: Record<string, CropEntry> = {
  ground: { label: "🟫 Buy Ground", price: 1, reward: 0, category: "ground" },
  fence: { label: "🪵 Buy Fence", price: 2, reward: 0, category: "ground" },
  corn: { label: "🌽 Corn", price: 1, reward: 5, category: "plant" },
  grape: { label: "🍇 Grape", price: 2, reward: 8, category: "plant" },
  strawberry: {
    label: "🍓 Strawberry",
    price: 3,
    reward: 12,
    category: "plant",
  },
  tomato: { label: "🍅 Tomato", price: 2, reward: 7, category: "plant" },
  chicken: { label: "🐔 Chicken", price: 3, reward: 0, category: "animal" },
  sheep: { label: "🐑 Sheep", price: 4, reward: 0, category: "animal" },
  cow: { label: "🐄 Cow", price: 5, reward: 0, category: "animal" },
};
