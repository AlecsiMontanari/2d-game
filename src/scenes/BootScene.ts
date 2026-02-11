import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Try to load real assets, fallback to placeholders if not found
        // Player spritesheet (adjust frameWidth/Height based on your actual sprite)
        this.load.on('loaderror', () => {
            console.log('Asset not found, using placeholders');
        });

        // Load player idle spritesheet
        // IMPORTANT: Adjust frameWidth and frameHeight to match your actual sprite dimensions
        this.load.spritesheet('player_idle', 'src/assets/player-idle.png', {
            frameWidth: 32,  // Width of each frame - AJUSTE ISSO!
            frameHeight: 48  // Height of each frame - AJUSTE ISSO!
        });

        // Optional: Load other spritesheets
        this.load.spritesheet('player_run', 'src/assets/player-run.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('player_jump', 'src/assets/player-jump.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('player_attack', 'src/assets/player-attack.png', { frameWidth: 32, frameHeight: 48 });

        // Enemy spritesheet (6 frames em grid 2x3: 3 colunas, 2 linhas)
        // IMPORTANT: Adjust frameWidth and frameHeight to match your actual sprite dimensions
        this.load.spritesheet('enemy', 'src/assets/enemy.png', {
            frameWidth: 32,  // Width of each frame - AJUSTE ISSO!
            frameHeight: 32  // Height of each frame - AJUSTE ISSO!
        });

        // Background image
        this.load.image('background', 'src/assets/background.png');

        // Fallback: Generate placeholders (will be used if assets fail to load)
        this.load.on('complete', () => {
            // Check if player_idle loaded, if not create placeholder
            if (!this.textures.exists('player_idle')) {
                const playerGraphics = this.make.graphics({ x: 0, y: 0 });
                playerGraphics.fillStyle(0x0000ff);
                playerGraphics.fillRect(0, 0, 32, 48);
                playerGraphics.generateTexture('player_idle', 32, 48);
                console.log('Using placeholder for player');
            }
        });

        // Player placeholder (Blue rectangle, slightly taller)
        const playerGraphics = this.make.graphics({ x: 0, y: 0 });
        playerGraphics.fillStyle(0x0000ff); // Blue
        playerGraphics.fillRect(0, 0, 32, 48);
        playerGraphics.generateTexture('player_placeholder', 32, 48);

        // Platform placeholder (Green rectangle)
        const platformGraphics = this.make.graphics({ x: 0, y: 0 });
        platformGraphics.fillStyle(0x00ff00); // Green
        platformGraphics.fillRect(0, 0, 32, 32);
        platformGraphics.generateTexture('platform_placeholder', 32, 32);

        // Obstacle placeholder (Red square)
        const obstacleGraphics = this.make.graphics({ x: 0, y: 0 });
        obstacleGraphics.fillStyle(0xff0000); // Red
        obstacleGraphics.fillRect(0, 0, 32, 32);
        obstacleGraphics.generateTexture('obstacle_placeholder', 32, 32);

        // Collectible placeholder (Yellow circle)
        const starGraphics = this.make.graphics({ x: 0, y: 0 });
        starGraphics.fillStyle(0xffff00); // Yellow
        starGraphics.fillCircle(12, 12, 12);
        starGraphics.generateTexture('star_placeholder', 24, 24);

        // Projectile placeholder (Orange small rectangle)
        const projectileGraphics = this.make.graphics({ x: 0, y: 0 });
        projectileGraphics.fillStyle(0xffa500); // Orange
        projectileGraphics.fillRect(0, 0, 10, 5);
        projectileGraphics.generateTexture('projectile_placeholder', 10, 5);

        // Enemy placeholder (Purple square)
        const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
        enemyGraphics.fillStyle(0x800080); // Purple
        enemyGraphics.fillRect(0, 0, 32, 32);
        enemyGraphics.generateTexture('enemy_placeholder', 32, 32);
    }

    create() {
        // Create idle animation (4 frames)
        if (this.textures.exists('player_idle') && this.anims.exists('idle') === false) {
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Create jump animation (2 frames)
        if (this.textures.exists('player_jump') && this.anims.exists('jump') === false) {
            this.anims.create({
                key: 'jump',
                frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 1 }),
                frameRate: 10,
                repeat: 0  // Play once
            });
        }

        // Create attack animation (3 frames)
        if (this.textures.exists('player_attack') && this.anims.exists('attack') === false) {
            this.anims.create({
                key: 'attack',
                frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 2 }),
                frameRate: 12,
                repeat: 0  // Play once
            });
        }

        // Create run animation (2 linhas x 3 colunas = 6 frames)
        // Grid: 3 colunas, 2 linhas
        if (this.textures.exists('player_run') && this.anims.exists('run') === false) {
            this.anims.create({
                key: 'run',
                frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }), // 6 frames total (0-5)
                frameRate: 10,
                repeat: -1
            });
        }

        // Create enemy animation (6 frames em grid 2x3)
        if (this.textures.exists('enemy') && this.anims.exists('enemy_move') === false) {
            this.anims.create({
                key: 'enemy_move',
                frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }), // 6 frames total (0-5)
                frameRate: 8,
                repeat: -1
            });
        }

        this.scene.start('MainMenuScene');
    }
}
