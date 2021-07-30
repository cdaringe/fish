import "./index.css";
import Phaser from "phaser";
import OceanScene from "./scenes/OceanScene";
import React from "react";
import { render } from "react-dom";

const App: React.FC = () => {
  const [names, setNames] = React.useState<string[] | null>(null);
  React.useEffect(() => {
    const rawNames = new URLSearchParams(window.location.search).get("names");
    if (!rawNames) return setNames([]);
    try {
      setNames(rawNames.split(","));
    } catch {
      setNames([]);
    }
  }, []);
  React.useEffect(() => {
    if (!names) return;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: "100%",
      height: "100%",
      parent: "game",
      physics: {
        default: "arcade",
        arcade: {
          debug: true,
          gravity: { y: 0 },
        },
      },
      transparent: true,
    };
    const game = new Phaser.Game(config);
    const autoStart = true;
    game.scene.add("ocean", OceanScene, autoStart, { names });
  }, [names]);
  return (
    <>
      <div
        id="game"
        style={{ position: "static", width: "100vw", height: "100vh" }}
      />
      <ol
        style={{
          position: "static",
          top: 0,
          right: -200,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {names?.map((name) => (
          <li key={name} children={name} />
        ))}
      </ol>
    </>
  );
};

render(<App />, document.body);
