// https://codepen.io/yaluye/pen/yzrXbR
import Phaser from "phaser";

enum SpriteTypes {
  Fish,
  Hook,
}
const FISH_VARIANTS = ["a", "b"] as const;

export default class OceanScene extends Phaser.Scene {
  public fishies: Phaser.GameObjects.Container[] = [];
  public hookedFish: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null =
    null;
  private _hook: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null = null;
  private hookup: Phaser.Physics.Arcade.Group | null = null;
  private flipXBySprite: WeakMap<
    Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
    boolean
  > = new WeakMap();
  private names: string[] = [];

  constructor() {
    super("ocean");
  }

  get hook() {
    if (!this._hook) throw new Error("_hook uninitialized");
    return this._hook;
  }

  preload() {
    FISH_VARIANTS.forEach(([v]) => {
      this.load.image(`fishy_${v}`, `public/fishy_${v}.svg`);
    });
    this.load.image("bubble", "public/bubbleo.svg");
    this.load.image("hook", "public/hook.svg");
  }

  init({ names }) {
    this.names = names;
  }

  create() {
    this.fishies = this.names.map((name, i) => {
      const fishVariant = FISH_VARIANTS[i % FISH_VARIANTS.length][0];
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
      // const fish = this.physics.add.image(0, 0, `fishy_${fishVariant}`);
      const fishImage = this.add.image(0, 0, `fishy_${fishVariant}`);
      const textNode = this.add.text(0, 0, name);
      const fish = this.add.container(50 * i, 50 * i, [fishImage, textNode]);
      fish.setSize(fishImage.width, fishImage.height);
      this.physics.world.enable(fish);
      this.flipXBySprite.set(fish, fishVariant === "a");
      fish.body.setBounce(0.35, 0.35);
      fish.body.setCollideWorldBounds(true);
      // start bubbling at a random time, follow the fish
      emitters.forEach((em) => {
        em.stop();
        setTimeout(() => em.start(), Math.random() * 2_000);
        em.startFollow(fish);
      });
      fish.body.setVelocity(Math.random() * 100 - 50, Math.random() * 100 - 50);
      fish.body.setMaxVelocity(150, 150);
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

    this.fishies.reduce(
      (acc, fish) => {
        const next = acc.filter((f) => f !== fish);
        next.forEach((f) => {
          this.physics.add.collider(fish, f);
        });
        return next;
      },
      [...this.fishies]
    );
    // add hook collider
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
    const spriteMetas = [
      ...this.fishies.map(
        (container) => [container, SpriteTypes.Fish] as const
      ),
      [this.hook, SpriteTypes.Hook] as const,
    ];
    for (const [sprite, type] of spriteMetas) {
      if (sprite === this.hookedFish || !sprite.body) continue;
      const hookedFish = this.hookedFish;
      if (hookedFish) {
        hookedFish.body.checkCollision.none = true;
        this.hook.body.checkCollision.none = true;
        hookedFish.body.setVelocity(0, 0);
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
          this.hook.body.checkCollision.none = false;
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
      const isFlipX = this.flipXBySprite.get(sprite)!;

      sprite.flipX =
        type === SpriteTypes.Fish &&
        (sprite.body.velocity.x >= 0 ? isFlipX : !isFlipX); //hello
    }
  }
}
