import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const { width, height } = this.scale;

        // Title
        this.add.text(width / 2, height * 0.3, 'Infinity Runner', {
            fontSize: '48px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(width / 2, height * 0.45, 'Tap Left to Jump / Tap Right to Shoot', {
            fontSize: '24px',
            color: '#aaa'
        }).setOrigin(0.5);
        this.add.text(width / 2, height * 0.5, 'Desktop: Space/Up to Jump, Z to Shoot', {
            fontSize: '20px',
            color: '#aaa'
        }).setOrigin(0.5);

        // Start Button
        const startButton = this.add.text(width / 2, height * 0.7, 'START GAME', {
            fontSize: '32px',
            color: '#0f0',
            backgroundColor: '#333',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Hover effects
        startButton.on('pointerover', () => startButton.setStyle({ fill: '#ff0' }));
        startButton.on('pointerout', () => startButton.setStyle({ fill: '#0f0' }));
    }
}
