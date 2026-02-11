import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpKey: Phaser.Input.Keyboard.Key;
    private shootKey!: Phaser.Input.Keyboard.Key;
    private lastFired: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Use 'player_idle' if available, fallback to placeholder
        const spriteKey = scene.textures.exists('player_idle') ? 'player_idle' : 'player_placeholder';
        super(scene, x, y, spriteKey);

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setBounce(0.0); // No bounce for runner usually
        this.setGravityY(0);

        // Play idle animation if it exists
        if (scene.anims.exists('idle')) {
            this.play('idle');
        }

        // Setup inputs
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        } else {
            // Fallback if keyboard not available (shouldn't happen in most cases)
            this.cursors = {} as any;
            this.jumpKey = {} as any;
        }
    }

    update() {
        if (!this.body) return;

        // Runner: Fixed X velocity (0 relative to camera, but world moves)
        // Actually, we keep player stationary in X, world moves left.
        this.setVelocityX(0);

        // Animation logic based on state
        const onGround = this.body.touching.down;
        const isAttacking = this.anims.currentAnim?.key === 'attack' && this.anims.isPlaying;

        // Don't interrupt attack animation
        if (!isAttacking) {
            if (!onGround) {
                // In air - play jump
                if (this.scene.anims.exists('jump') && this.anims.currentAnim?.key !== 'jump') {
                    this.play('jump');
                }
            } else {
                // On ground
                // For infinity runner, always show run animation (or idle if run doesn't exist)
                if (this.scene.anims.exists('run') && this.anims.currentAnim?.key !== 'run') {
                    this.play('run');
                } else if (this.scene.anims.exists('idle') && this.anims.currentAnim?.key !== 'idle') {
                    this.play('idle');
                }
            }
        }

        // Jump
        if ((this.cursors?.up?.isDown || this.jumpKey?.isDown) && this.body.touching.down) {
            this.setVelocityY(-400);
        }

        // Shoot
        if (this.shootKey?.isDown) {
            this.shoot();
        }
    }

    shoot() {
        const time = this.scene.time.now;
        if (time > this.lastFired) {
            // Play attack animation if available
            if (this.scene.anims.exists('attack')) {
                this.play('attack');
            }

            this.scene.events.emit('player-shoot', this.x, this.y);
            this.lastFired = time + 300; // Fire rate
        }
    }

    // Method to handle touch input
    handleTouchJump() {
        if (this.body && this.body.touching.down) {
            this.setVelocityY(-400);
        }
    }

    handleTouchShoot() {
        this.shoot();
    }
}
