// https://codepen.io/yaluye/pen/yzrXbR
import Phaser from "phaser";

export default class OceanScene extends Phaser.Scene {
  public fishies: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] = [];
  public hookedFish: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null =
    null;
  private _hook: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null = null;
  private hookup: Phaser.Physics.Arcade.Group | null = null;

  constructor() {
    super("ocean");
  }

  get hook() {
    if (!this._hook) throw new Error("_hook uninitialized");
    return this._hook;
  }

  preload() {
    this.load.image("fishy_b", "public/fishy_a.svg");
    this.load.image("bubble", "public/bubbleo.svg");
    this.load.image("hook", "public/hook.svg");
  }

  create() {
    this.fishies = [...Array(5)].map((_, i) => {
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

      const fish = this.physics.add.image(50 * i, 50 * i, "fishy_b");
      fish.setBounce(0.35, 0.35);
      fish.setCollideWorldBounds(true);
      emitters.forEach((em) => {
        em.stop();
        setTimeout(() => {
          em.start();
        }, Math.random() * 2_000);
        em.startFollow(fish);
      });
      fish.setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50);
      fish.body.setMaxVelocity(150, 150);
      fish.setBounce(1, 1);
      (fish as any).emitters = emitters;
      return fish;
    });

    const hook = this.physics.add.image(100, 100, "hook");
    hook.setScale(0.04);
    hook.setSize(200, 200);
    hook.setOffset(-100, 1200);
    hook.setCollideWorldBounds();
    hook.setVelocity(Math.random() * 500 - 50, Math.random() * 500 - 50);
    this._hook = hook;

    this.fishies.forEach((fish) => {
      this.physics.add.collider(fish, hook, () => {
        if (this.hookedFish) return;
        this.hookedFish = fish;
        fish.body.setEnable(false);
        this.hookup = this.physics.add.group([fish, hook]);
      });
    });
  }
  update() {
    const sprites = [
      ...this.fishies.map((fish) => [fish, "fish"] as const),
      [this.hook, "hook"] as const,
    ];
    for (const [sprite, type] of sprites) {
      if (sprite === this.hookedFish || !sprite.body) {
        continue;
      } else {
        const hookedFish = this.hookedFish;
        if (hookedFish) {
          hookedFish.setVelocity(0, 0);
          this.hookup?.setVelocityY(-400);
          const { x, y } = this.hook.body.position;
          hookedFish.setPosition(x, y);
          if (y <= 0) {
            this.fishies = this.fishies.filter((fish) => fish !== hookedFish);
            (
              (hookedFish as any)
                .emitters as Phaser.GameObjects.Particles.ParticleEmitter[]
            ).forEach((emitter) => emitter.remove());
            hookedFish.destroy();
            this.hookup?.clear();
            this.hook.setCollideWorldBounds();
            this.hookup = null;
            this.hookedFish = null;
            this.hook.setVelocityY(100);
          }
        }
      }
      const isOnCeiling = sprite.body.onCeiling();
      if (isOnCeiling || sprite.body.onFloor()) {
        sprite.body.acceleration.y *= -1;
      } else if (sprite.body.onWall()) {
        sprite.body.acceleration.x *= -1;
      }
      const dir = Math.random() >= 0.5 ? 1 : -1;
      const isRandomizingX = Math.random() <= 0.5;
      const rand = Math.random();
      const { x, y } = sprite.body.acceleration;
      if (isRandomizingX) {
        sprite.body.setAccelerationX(x + dir * rand * 10);
      } else {
        sprite.body.setAccelerationY(y + dir * rand * 10);
      }
    }
  }
}
