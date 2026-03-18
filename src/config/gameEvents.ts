import { EventDispatcher, Mesh } from "three";

type PlaceholderClickedEvent = {
  type: "placeholder:clicked";
  x: number;
  y: number;
  z: number;
};
type MarketItemSelectedEvent = {
  type: "market:item-selected";
  id: "PLANT" | "ANIMAL";
  x: number;
  y: number;
  z: number;
};

type FenceClickedEvent = {
  type: "fence:clicked";
  hitBox: Mesh;
};

type AnimaMarketClickedEvent = {
  type: "animalMarket:item-selected";
  id: string;
  x: number;
  y: number;
  z: number;
};

type PlantGroundClickedEvent = {
  type: "plantGround:clicked";
};

type PlantMarketChooseEvent = {
  type: "buyPlant:item-selected";
  id: string;
  x: number;
  y: number;
  z: number;
};

type ClosePlantMarket = {
  type: "close:plant-market";
  id: string;
};

type UiOpenedEvent = {
  type: "ui:opened";
};

type UiClosedEvent = {
  type: "ui:closed";
};

type MinigameCoinsEvent = {
  type: "minigame:coins";
  coins: number;
};

type SellFenceEvent = {
  type: "sell-fence";
};

type WolfCountdownStartEvent = {
  type: "wolf:countdown-start";
  seconds: number;
};
type WolfWaveStartEvent = { type: "wolf:wave-start" };
type WolfWaveEndEvent = { type: "wolf:wave-end" };

export type GameEventMap = {
  "placeholder:clicked": PlaceholderClickedEvent;
  "market:item-selected": MarketItemSelectedEvent;
  "fence:clicked": FenceClickedEvent;
  "animalMarket:item-selected": AnimaMarketClickedEvent;
  "plantGround:clicked": PlantGroundClickedEvent;
  "buyPlant:item-selected": PlantMarketChooseEvent;
  "ui:opened": UiOpenedEvent;
  "ui:closed": UiClosedEvent;
  "minigame:coins": MinigameCoinsEvent;
  "sell-fence": SellFenceEvent;
  "wolf:countdown-start": WolfCountdownStartEvent;
  "wolf:wave-start": WolfWaveStartEvent;
  "wolf:wave-end": WolfWaveEndEvent;
  "close:plant-market": ClosePlantMarket;
};

export class GameEvents extends EventDispatcher<GameEventMap> {}
