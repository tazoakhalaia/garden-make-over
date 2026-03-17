export const config = {
  pixiAssets: {
    LuckiestGuy: "fonts/LuckiestGuy-Regular.ttf",
    chicken: "images/chicken.png",
  },

  threeModels: {
    ground: "models/ground.glb",
    farmObjects: "models/objects2.glb",
    chicken: "models/chicken.glb",
    sheep: "models/sheep.glb",
    cow: "models/cow.glb",
  },

  sounds: {
    chickenSound: "sounds/chicken.mp3",
    sheepSound: "sounds/sheep.mp3",
    cowSound: "sounds/cow.mp3",
    click: "sounds/click_003.mp3",
    mainTheme: "sounds/theme.mp3",
  },

  placeholderCords: [
    { x: -70, y: 25, z: -40 },
    { x: -70, y: 25, z: 20 },
    { x: 40, y: 25, z: 20 },
  ],

  baseScreenSize: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
};
