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

export type GameEventMap = {
  "placeholder:clicked": PlaceholderClickedEvent;
  "market:item-selected": MarketItemSelectedEvent;
  "fence:clicked": FenceClickedEvent;
};

export class GameEvents extends EventDispatcher<GameEventMap> {}
