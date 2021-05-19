// https://codepen.io/yaluye/pen/yzrXbR
import Phaser from "phaser";

export default class OceanScene extends Phaser.Scene {
  public fishies: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
  constructor() {
    super("ocean");
  }

  preload() {
    this.load.image("fishy_b", "public/fishy_b.svg");
    this.load.image("bubble", "public/bubbleo.svg");
  }

  create() {
    const particles = this.add.particles("bubble");
    const emitters = [
      particles.createEmitter({
        active: true,
        scale: { start: 0.5, end: 0 },
        frequency: 2000,
        blendMode: "ADD",
        gravityY: -200,
      }),
      particles.createEmitter({
        active: true,
        scale: { start: 0.3, end: 0 },
        frequency: 1000,
        blendMode: "ADD",
        gravityY: -350,
      }),
    ];

    const fish = this.physics.add.image(400, 100, "fishy_b");
    fish.setBounce(0.35, 0.35);
    fish.setCollideWorldBounds(true);
    emitters.forEach((em) => em.startFollow(fish));
    fish.setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50);
    fish.body.setMaxVelocity(150, 150);
    this.fishies.push(fish);
  }
  update() {
    for (const fish of this.fishies) {
      const isOnCeiling = fish.body.onCeiling();
      if (isOnCeiling || fish.body.onFloor()) {
        fish.body.acceleration.y *= -1;
        // fish.body.velocity.y *= -1;
        // if (fish.body.position.y === 0) fish.body.position.y = 1;
        // else {
        //   fish.body.position.y -= 1;
        // }
      } else if (fish.body.onWall()) {
        fish.body.acceleration.x *= -1;
        // fish.body.velocity.x *= -1;
        // if (fish.body.position.x === 0) fish.body.position.x = 1;
        // else {
        //   fish.body.position.x -= 1;
        // }
      }
      // } else {
      const dir = Math.random() >= 0.5 ? 1 : -1;
      const adjustX = Math.random() <= 0.5;
      const rand = Math.random();
      const { x, y } = fish.body.acceleration;
      if (adjustX) {
        fish.body.setAccelerationX(x + dir * rand * 10);
      } else {
        fish.body.setAccelerationY(y + dir * rand * 10);
      }
      fish.flipX = fish.body.velocity.x < 0;
      // }
    }
  }
}
