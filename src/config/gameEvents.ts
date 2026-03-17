import { EventDispatcher } from "three";

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

type UiOpenedEvent = {
  type: "ui:opened";
};

type UiClosedEvent = {
  type: "ui:closed";
};

export type GameEventMap = {
  "placeholder:clicked": PlaceholderClickedEvent;
  "market:item-selected": MarketItemSelectedEvent;
  "fence:clicked": FenceClickedEvent;
  "animalMarket:item-selected": AnimaMarketClickedEvent;
  "plantGround:clicked": PlantGroundClickedEvent;
  "buyPlant:item-selected": PlantMarketChooseEvent;
  "ui:opened": UiOpenedEvent;
  "ui:closed": UiClosedEvent;
};

export class GameEvents extends EventDispatcher<GameEventMap> {}
