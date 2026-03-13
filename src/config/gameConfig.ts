export const GAME_CONFIG = {
    physics: {
        gravityY: 300,
        debug: import.meta.env.DEV
    },
    player: {
        jumpVelocity: 400,
        shootCooldownMs: 300
    },
    world: {
        initialGameSpeed: 200,
        maxGameSpeed: 400,
        speedIncreaseStep: 20,
        speedIncreaseIntervalMs: 10000,
        enemySpeedOffset: -50
    },
    spawn: {
        obstacleDelayMs: 2000,
        enemyDelayMs: 3500,
        platformDelayMs: 1500
    },
    projectile: {
        speed: 400
    }
} as const;

export enum GameState {
    MENU = 'menu',
    RUNNING = 'running',
    PAUSED = 'paused',
    GAME_OVER = 'gameover'
}
