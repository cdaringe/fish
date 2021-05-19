import "./index.css";
import Phaser from "phaser";
import OceanScene from "./scenes/OceanScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: "100%",
  height: "100%",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  transparent: true,
  scene: [OceanScene],
};

const game = new Phaser.Game(config);
export default game;
