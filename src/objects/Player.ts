import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpKey: Phaser.Input.Keyboard.Key;
    private shootKey!: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        const spriteKey = scene.textures.exists('player_idle') ? 'player_idle' : 'player_placeholder';
        super(scene, x, y, spriteKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0.0);
        this.setGravityY(0);

        if (scene.anims.exists('idle')) {
            this.play('idle');
        }

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        } else {
            this.cursors = {} as any;
            this.jumpKey = {} as any;
        }
    }

    update() {
        if (!this.body) return;

        this.setVelocityX(0);

        const onGround = this.body.touching.down;
        const isAttacking = this.anims.currentAnim?.key === 'attack' && this.anims.isPlaying;

        if (!isAttacking) {
            if (!onGround) {
                if (this.scene.anims.exists('jump') && this.anims.currentAnim?.key !== 'jump') {
                    this.play('jump');
                }
            } else if (this.scene.anims.exists('run') && this.anims.currentAnim?.key !== 'run') {
                this.play('run');
            } else if (this.scene.anims.exists('idle') && this.anims.currentAnim?.key !== 'idle') {
                this.play('idle');
            }
        }

        if ((this.cursors?.up?.isDown || this.jumpKey?.isDown) && this.body.touching.down) {
            this.setVelocityY(-GAME_CONFIG.player.jumpVelocity);
        }

        if (this.shootKey?.isDown) {
            this.shoot();
        }
    }

    shoot() {
        const time = this.scene.time.now;
        if (time > this.lastFired) {
            if (this.scene.anims.exists('attack')) {
                this.play('attack');
            }

            this.scene.events.emit('player-shoot', this.x, this.y);
            this.lastFired = time + GAME_CONFIG.player.shootCooldownMs;
        }
    }

    handleTouchJump() {
        if (this.body && this.body.touching.down) {
            this.setVelocityY(-GAME_CONFIG.player.jumpVelocity);
        }
    }

    handleTouchShoot() {
        this.shoot();
    }
}
