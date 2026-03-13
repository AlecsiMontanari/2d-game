import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { GAME_CONFIG, GameState } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private platforms!: Phaser.Physics.Arcade.Group;
    private obstacles!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private projectiles!: Phaser.Physics.Arcade.Group;
    private stars!: Phaser.Physics.Arcade.Group;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private gameSpeed: number = GAME_CONFIG.world.initialGameSpeed;
    private background?: Phaser.GameObjects.TileSprite;

    private gameState: GameState = GameState.MENU;
    private difficultyTimer: number = 0;
    private pauseButton?: Phaser.GameObjects.Text;
    private pauseOverlay?: Phaser.GameObjects.Container;

    constructor() {
        super('GameScene');
    }

    create() {
        this.gameState = GameState.RUNNING;
        this.difficultyTimer = 0;
        this.score = 0;
        this.gameSpeed = GAME_CONFIG.world.initialGameSpeed;

        if (this.textures.exists('background')) {
            this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background');
            this.background.setOrigin(0, 0);
            this.background.setDepth(-1);
        }

        this.add.text(16, 16, 'Game Started', { fontSize: '32px', color: '#fff' });
        this.scoreText = this.add.text(16, 50, 'Score: 0', { fontSize: '24px', color: '#fff' });
        this.pauseButton = this.add.text(this.scale.width - 16, 16, 'PAUSE', {
            fontSize: '20px',
            color: '#fff',
            backgroundColor: '#222',
            padding: { left: 10, right: 10, top: 6, bottom: 6 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        this.pauseButton.on('pointerdown', () => this.togglePause());

        this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
        this.createGround();

        this.player = new Player(this, 100, 400);
        this.physics.add.collider(this.player, this.platforms);

        this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
        this.enemies = this.physics.add.group({ allowGravity: false });
        this.projectiles = this.physics.add.group({ allowGravity: false });
        this.stars = this.physics.add.group({ allowGravity: false });

        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.hitObstacle, undefined, this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);

        this.physics.add.collider(this.projectiles, this.enemies, this.hitEnemy, undefined, this);
        this.physics.add.collider(this.projectiles, this.platforms, (projectile) => projectile.destroy());
        this.physics.add.collider(this.projectiles, this.obstacles, (projectile) => projectile.destroy());
        this.physics.add.collider(this.enemies, this.platforms);

        this.events.on('player-shoot', this.fireProjectile, this);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.gameState !== GameState.RUNNING) return;
            if (pointer.x > this.scale.width / 2) {
                this.player.handleTouchShoot();
            } else {
                this.player.handleTouchJump();
            }
        });

        this.input.keyboard?.on('keydown-P', () => this.togglePause());

        this.time.addEvent({ delay: GAME_CONFIG.spawn.obstacleDelayMs, callback: this.spawnObstacle, callbackScope: this, loop: true });
        this.time.addEvent({ delay: GAME_CONFIG.spawn.enemyDelayMs, callback: this.spawnEnemy, callbackScope: this, loop: true });
        this.time.addEvent({ delay: GAME_CONFIG.spawn.platformDelayMs, callback: this.spawnPlatform, callbackScope: this, loop: true });
    }

    update(_time: number, delta: number) {
        if (this.gameState !== GameState.RUNNING) return;

        this.player.update();

        this.difficultyTimer += delta;
        if (this.difficultyTimer > GAME_CONFIG.world.speedIncreaseIntervalMs) {
            this.gameSpeed = Math.min(this.gameSpeed + GAME_CONFIG.world.speedIncreaseStep, GAME_CONFIG.world.maxGameSpeed);
            this.difficultyTimer = 0;
        }

        if (this.background) {
            this.background.tilePositionX += this.gameSpeed * 0.3 * (delta / 1000);
        }

        const speed = -this.gameSpeed;
        this.platforms.setVelocityX(speed);
        this.obstacles.setVelocityX(speed);
        this.enemies.setVelocityX(speed + GAME_CONFIG.world.enemySpeedOffset);
        this.stars.setVelocityX(speed);

        this.cleanupGroup(this.platforms);
        this.cleanupGroup(this.obstacles);
        this.cleanupGroup(this.enemies);
        this.cleanupGroup(this.projectiles);
        this.cleanupGroup(this.stars);
    }

    private togglePause() {
        if (this.gameState === GameState.GAME_OVER) return;

        if (this.gameState === GameState.RUNNING) {
            this.gameState = GameState.PAUSED;
            this.physics.world.pause();
            this.createPauseOverlay();
            return;
        }

        if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.RUNNING;
            this.physics.world.resume();
            this.pauseOverlay?.destroy();
            this.pauseOverlay = undefined;
        }
    }

    private createPauseOverlay() {
        const { width, height } = this.scale;
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
        const title = this.add.text(width / 2, height * 0.4, 'PAUSADO', {
            fontSize: '48px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const resumeBtn = this.add.text(width / 2, height * 0.55, 'RETOMAR', {
            fontSize: '30px',
            color: '#0f0',
            backgroundColor: '#222',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        resumeBtn.on('pointerdown', () => this.togglePause());

        const restartBtn = this.add.text(width / 2, height * 0.67, 'REINICIAR', {
            fontSize: '28px',
            color: '#fff',
            backgroundColor: '#333',
            padding: { left: 16, right: 16, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        restartBtn.on('pointerdown', () => this.scene.restart());

        this.pauseOverlay = this.add.container(0, 0, [bg, title, resumeBtn, restartBtn]);
        this.pauseOverlay.setDepth(1000);
    }

    private createGround() {
        const groundY = this.scale.height - 32;
        for (let i = 0; i < Math.ceil(this.scale.width / 32) + 5; i++) {
            const platform = this.platforms.create(i * 32, groundY, 'platform_placeholder');
            platform.setOrigin(0, 0);
            platform.body.updateFromGameObject();
        }
    }

    private spawnPlatform() {
        if (this.gameState !== GameState.RUNNING) return;
        const groundY = this.scale.height - 32;
        const rightmost = this.platforms.getChildren().reduce((max: number, p: any) => Math.max(max, p.x), 0);

        if (rightmost < this.scale.width + 100) {
            const platform = this.platforms.create(rightmost + 32, groundY, 'platform_placeholder');
            platform.setOrigin(0, 0);
            platform.body.updateFromGameObject();
        }
    }

    private spawnObstacle() {
        if (this.gameState !== GameState.RUNNING) return;
        const groundY = this.scale.height - 32;
        const x = this.scale.width + 50;
        const obstacle = this.obstacles.create(x, groundY, 'obstacle_placeholder');
        obstacle.setOrigin(0, 1);
    }

    private spawnEnemy() {
        if (this.gameState !== GameState.RUNNING) return;
        const x = this.scale.width + 50;
        const y = Phaser.Math.Between(200, 450);

        const spriteKey = this.textures.exists('enemy') ? 'enemy' : 'enemy_placeholder';
        const enemy = this.enemies.create(x, y, spriteKey);
        enemy.setBounce(0);

        if (this.anims.exists('enemy_move')) {
            enemy.play('enemy_move');
        }
    }

    private fireProjectile(x: number, y: number) {
        const projectile = this.projectiles.create(x + 20, y, 'projectile_placeholder');
        projectile.setVelocityX(GAME_CONFIG.projectile.speed);
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
        if (this.gameState === GameState.GAME_OVER) return;

        this.gameState = GameState.GAME_OVER;
        this.physics.pause();
        this.pauseOverlay?.destroy();
        this.player.setTint(0xff0000);

        const { width, height } = this.scale;

        this.add.text(width / 2, height * 0.3, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.45, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);

        const restartBtn = this.add.text(width / 2, height * 0.6, 'RESTART', {
            fontSize: '32px',
            color: '#0f0',
            backgroundColor: '#333',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartBtn.on('pointerdown', () => this.scene.restart());
        restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#ff0' }));
        restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#0f0' }));

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
