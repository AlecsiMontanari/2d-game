import Phaser from 'phaser';
import { Player } from '../objects/Player';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private platforms!: Phaser.Physics.Arcade.Group; // Changed to Group for movement
    private obstacles!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private projectiles!: Phaser.Physics.Arcade.Group;
    private stars!: Phaser.Physics.Arcade.Group;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private gameSpeed: number = 200;
    private background!: Phaser.GameObjects.TileSprite;

    private gameOver: boolean = false;
    private difficultyTimer: number = 0;

    constructor() {
        super('GameScene');
    }

    create() {
        this.gameOver = false;
        this.difficultyTimer = 0;
        this.score = 0;

        // Add background (will tile/repeat if needed)
        if (this.textures.exists('background')) {
            this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');
            this.background.setOrigin(0, 0);
            this.background.setDepth(-1); // Behind everything
        }

        this.add.text(16, 16, 'Game Started', { fontSize: '32px', color: '#fff' });
        this.scoreText = this.add.text(16, 50, 'Score: 0', { fontSize: '24px', color: '#fff' });

        // Platforms (Dynamic group to move them)
        this.platforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Initialize ground
        this.createGround();

        // Player (Fixed X position)
        this.player = new Player(this, 100, 400);
        this.physics.add.collider(this.player, this.platforms);

        // Groups
        this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
        this.enemies = this.physics.add.group({ allowGravity: false }); // Enemies might have gravity? Let's say yes for now or flying
        this.projectiles = this.physics.add.group({ allowGravity: false });
        this.stars = this.physics.add.group({ allowGravity: false });

        // Collisions
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.hitObstacle, undefined, this); // Enemy hits player same as obstacle
        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        // Projectile collisions
        this.physics.add.collider(this.projectiles, this.enemies, this.hitEnemy, undefined, this);
        this.physics.add.collider(this.projectiles, this.platforms, (projectile) => projectile.destroy());
        this.physics.add.collider(this.projectiles, this.obstacles, (projectile) => projectile.destroy());
        this.physics.add.collider(this.enemies, this.platforms);

        // Listener for player shoot
        this.events.on('player-shoot', this.fireProjectile, this);

        // Controls
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.x > this.scale.width / 2) {
                this.player.handleTouchShoot();
            } else {
                this.player.handleTouchJump();
            }
        });

        // Spawners
        this.time.addEvent({ delay: 2000, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 3500, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1500, callback: this.spawnPlatform, callbackScope: this, loop: true }); // Infinite ground
    }

    update(_time: number, delta: number) {
        if (this.gameOver) return;

        this.player.update();

        // Progressive difficulty: increase speed every 10 seconds
        this.difficultyTimer += delta;
        if (this.difficultyTimer > 10000) {
            this.gameSpeed = Math.min(this.gameSpeed + 20, 400); // Cap at 400
            this.difficultyTimer = 0;
        }

        // Parallax scrolling: background moves slower (30% of game speed)
        if (this.background) {
            this.background.tilePositionX += this.gameSpeed * 0.3 * (delta / 1000);
        }

        // Move everything left
        const speed = -this.gameSpeed;

        this.platforms.setVelocityX(speed);
        this.obstacles.setVelocityX(speed);
        this.enemies.setVelocityX(speed - 50); // Enemies move slightly faster/slower?
        this.stars.setVelocityX(speed);

        // Cleanup
        this.cleanupGroup(this.platforms);
        this.cleanupGroup(this.obstacles);
        this.cleanupGroup(this.enemies);
        this.cleanupGroup(this.projectiles);
        this.cleanupGroup(this.stars);
    }

    private createGround() {
        const groundY = this.scale.height - 32;
        // Initial ground
        for (let i = 0; i < Math.ceil(this.scale.width / 32) + 5; i++) {
            const platform = this.platforms.create(i * 32, groundY, 'platform_placeholder');
            platform.setOrigin(0, 0);
            platform.body.updateFromGameObject(); // Important for static/dynamic body sizing
        }
    }

    private spawnPlatform() {
        // Simple infinite floor: check if we need more floor at the right
        // Actually, better strategy for runner: spawn segments.
        // For now, let's just spam blocks at the far right.
        const groundY = this.scale.height - 32;
        const rightmost = this.platforms.getChildren().reduce((max: number, p: any) => Math.max(max, p.x), 0);

        if (rightmost < this.scale.width + 100) {
            const platform = this.platforms.create(rightmost + 32, groundY, 'platform_placeholder');
            platform.setOrigin(0, 0);
            platform.body.updateFromGameObject();
        }
    }

    private spawnObstacle() {
        const groundY = this.scale.height - 32;
        const x = this.scale.width + 50;
        const obstacle = this.obstacles.create(x, groundY, 'obstacle_placeholder');
        obstacle.setOrigin(0, 1);
    }

    private spawnEnemy() {
        const x = this.scale.width + 50;
        const y = Phaser.Math.Between(200, 450);

        // Use enemy spritesheet if available, fallback to placeholder
        const spriteKey = this.textures.exists('enemy') ? 'enemy' : 'enemy_placeholder';
        const enemy = this.enemies.create(x, y, spriteKey);
        enemy.setBounce(0);

        // Play enemy animation if available
        if (this.anims.exists('enemy_move')) {
            enemy.play('enemy_move');
        }
    }

    private fireProjectile(x: number, y: number) {
        const projectile = this.projectiles.create(x + 20, y, 'projectile_placeholder');
        projectile.setVelocityX(400);
    }

    private cleanupGroup(group: Phaser.Physics.Arcade.Group) {
        group.getChildren().forEach((child: any) => {
            if (child.x < -50 || child.x > this.scale.width + 100 || child.y > this.scale.height + 50) {
                if (child.active && (child.x < -50 || child.y > this.scale.height)) {
                    child.destroy();
                }
            }
        });
    }

    private hitObstacle(_player: any, _obstacle: any) {
        if (this.gameOver) return;

        this.gameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);

        const { width, height } = this.scale;

        // Game Over text
        this.add.text(width / 2, height * 0.3, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Final score
        this.add.text(width / 2, height * 0.45, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);

        // Restart button
        const restartBtn = this.add.text(width / 2, height * 0.6, 'RESTART', {
            fontSize: '32px',
            color: '#0f0',
            backgroundColor: '#333',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => this.scene.restart());
        restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#ff0' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#0f0' }));

        // Main Menu button
        const menuBtn = this.add.text(width / 2, height * 0.75, 'MAIN MENU', {
            fontSize: '28px',
            color: '#aaa',
            backgroundColor: '#222',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#fff' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#aaa' }));
    }

    private hitEnemy(projectile: any, enemy: any) {
        projectile.destroy();
        enemy.destroy();
        this.score += 20;
        this.scoreText.setText('Score: ' + this.score);
    }

    private collectStar(_player: any, star: any) {
        star.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }
}
