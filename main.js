import * as THREE from 'three';
import { Engine } from './js/core/Engine.js';
import { InputHandler } from './js/systems/InputHandler.js';
import { AudioManager } from './js/systems/AudioManager.js';
import { Player } from './js/entities/Player.js';
import { Obstacle } from './js/entities/Obstacle.js';
import { CollisionSystem } from './js/systems/CollisionSystem.js';
import { UIManager } from './js/systems/UIManager.js';

// --- CONFIGURATION ---
const TUNNEL_RADIUS = 10;
const TUNNEL_SEGMENTS = 64;
const TUNNEL_LENGTH = 200;
const INITIAL_SPEED = 0.5;
const SPEED_INCREMENT = 0.0001;
const OBSTACLE_SPAWN_INTERVAL = 20;

/**
 * GameState enum for the state machine.
 */
const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

// --- INITIALIZATION ---
const engine = new Engine();
const inputHandler = new InputHandler();
const audioManager = new AudioManager();
const collisionSystem = new CollisionSystem();
const uiManager = new UIManager();
const player = new Player();

// --- SETUP SCENE ---
engine.scene.fog = new THREE.FogExp2(0x000000, 0.02);
engine.scene.add(player.mesh);

const neonLight = new THREE.PointLight(0x00ffff, 100, 100);
engine.camera.add(neonLight);
engine.scene.add(engine.camera);

// --- GAME STATE ---
let currentState = GameState.MENU;
let score = 0;
let level = 1;
let speed = INITIAL_SPEED;
let obstacles = [];
let tunnelSegments = [];
let lastObstacleZ = 0;

// --- TUNNEL GENERATION ---
function createTunnelSegment(z) {
    const geometry = new THREE.CylinderGeometry(TUNNEL_RADIUS, TUNNEL_RADIUS, TUNNEL_LENGTH, TUNNEL_SEGMENTS, 1, true);
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        wireframe: true,
        side: THREE.BackSide,
        emissive: 0x330033,
        emissiveIntensity: 0.5
    });
    const segment = new THREE.Mesh(geometry, material);
    segment.rotation.x = Math.PI / 2;
    segment.position.z = z;
    engine.scene.add(segment);
    return segment;
}

for (let i = 0; i < 3; i++) {
    tunnelSegments.push(createTunnelSegment(-i * TUNNEL_LENGTH));
}

// --- UI OVERLAYS ---
function createOverlay(id, title, subtitle, buttonText, callback) {
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        background: rgba(0, 0, 0, 0.85);
        color: #00ffff; font-family: 'Courier New', Courier, monospace;
        z-index: 2000; text-align: center;
        text-shadow: 0 0 10px #00ffff;
    `;

    const h1 = document.createElement('h1');
    h1.textContent = title;
    h1.style.fontSize = '4rem';
    h1.style.margin = '0';
    overlay.appendChild(h1);

    if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle;
        p.style.fontSize = '1.2rem';
        overlay.appendChild(p);
    }

    const btn = document.createElement('button');
    btn.textContent = buttonText;
    btn.style.cssText = `
        margin-top: 30px; padding: 15px 40px;
        background: transparent; color: #00ffff;
        border: 2px solid #00ffff; font-family: inherit;
        font-size: 1.5rem; cursor: pointer;
        transition: all 0.3s ease;
    `;
    btn.onmouseover = () => {
        btn.style.background = '#00ffff';
        btn.style.color = '#000';
    };
    btn.onmouseout = () => {
        btn.style.background = 'transparent';
        btn.style.color = '#00ffff';
    };
    btn.onclick = callback;
    overlay.appendChild(btn);

    document.body.appendChild(overlay);
    return overlay;
}

const menuOverlay = createOverlay(
    'main-menu', 
    'NEON SURGE', 
    'SYNC YOUR CONSCIOUSNESS TO THE GRID', 
    'INITIATE', 
    () => setGameState(GameState.PLAYING)
);

const pauseOverlay = createOverlay(
    'pause-menu', 
    'LINK SUSPENDED', 
    'NEURAL INTERFACE ON STANDBY', 
    'RESUME', 
    () => setGameState(GameState.PLAYING)
);
pauseOverlay.style.display = 'none';

// --- STATE MANAGEMENT ---
function setGameState(newState) {
    const oldState = currentState;
    currentState = newState;

    // Handle UI visibility
    menuOverlay.style.display = newState === GameState.MENU ? 'flex' : 'none';
    pauseOverlay.style.display = newState === GameState.PAUSED ? 'flex' : 'none';

    // Transition effects
    if (newState === GameState.PLAYING) {
        if (oldState === GameState.MENU) {
            audioManager.startEngine();
            audioManager.startMusic();
        }
    }
}

// --- ADVANCED SPAWNING (PATTERN-BASED) ---
function spawnPattern() {
    const patternType = Math.random();
    const z = -200; // Spawn deep in the tunnel
    
    // Weighted selection: 50% Random, 30% Wall, 20% Spiral
    if (patternType < 0.5) {
        createObstacle(z);
    } else if (patternType < 0.8) {
        // WALL PATTERN: A semi-circle of obstacles
        const count = 4;
        const baseAngle = Math.random() * Math.PI * 2;
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i * 0.5);
            createObstacle(z, angle, TUNNEL_RADIUS - 2);
        }
    } else {
        // SPIRAL PATTERN: A sequence of obstacles forming a vortex
        const count = 6;
        const startAngle = Math.random() * Math.PI * 2;
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (i * (Math.PI / 3));
            createObstacle(z - (i * 12), angle, TUNNEL_RADIUS - 3);
        }
    }
}

function createObstacle(z, angle = null, radius = null) {
    const obstacle = new Obstacle(z);
    if (angle !== null && radius !== null) {
        // Override random position with pattern position
        obstacle.mesh.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            z
        );
        obstacle.basePosition.copy(obstacle.mesh.position);
    }
    engine.scene.add(obstacle.mesh);
    obstacles.push(obstacle);
}

// --- LEVEL MILESTONES ---
function checkLevelUp() {
    const threshold = level * 500;
    if (score >= threshold) {
        level++;
        
        // Cycle environment colors
        const palette = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff00ff, 0x00ffff];
        const newColor = palette[level % palette.length];
        
        // Environment shift
        engine.scene.fog.color.setHex(newColor);
        tunnelSegments.forEach(seg => {
            seg.material.emissive.setHex(newColor);
            seg.material.emissiveIntensity = 0.5 + (level * 0.1);
        });

        // Audio intensity shift (tempo increases with level)
        audioManager.updateGameSpeed(1.0 + (level * 0.05));
        
        // Visual feedback
        uiManager.triggerGlitch();
        console.log(`SYSTEM UPGRADE: LEVEL ${level} REACHED`);
    }
}

// --- INPUT HANDLERS ---
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        if (currentState === GameState.PLAYING) {
            setGameState(GameState.PAUSED);
        } else if (currentState === GameState.PAUSED) {
            setGameState(GameState.PLAYING);
        }
    }
});

// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    if (currentState === GameState.PLAYING) {
        // Update Player
        player.update(speed, inputHandler);

        // Update Game State
        speed += SPEED_INCREMENT;
        
        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.update(speed);

            // Scoring and Cleanup
            if (obstacle.mesh.position.z > 10) {
                engine.scene.remove(obstacle.mesh);
                obstacles.splice(i, 1);
                score += 10;
                uiManager.updateScore(score);
                checkLevelUp();
            }
        }

        // Tunnel movement
        tunnelSegments.forEach((segment) => {
            segment.position.z += speed;
            if (segment.position.z > TUNNEL_LENGTH) {
                segment.position.z -= 3 * TUNNEL_LENGTH;
            }
        });

        // Advanced Spawning
        lastObstacleZ += speed;
        if (lastObstacleZ > OBSTACLE_SPAWN_INTERVAL) {
            spawnPattern();
            lastObstacleZ = 0;
        }

        // Collision detection
        if (collisionSystem.checkCollision(player.mesh, obstacles.map(o => o.mesh))) {
            gameOver();
        }

        // UI Updates
        uiManager.updateSpeed(speed);
    }

    // Keep rendering even when paused/menu
    engine.render();
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    audioManager.playZap();
    uiManager.showGameOver(score);
}

// Kick off initialization
uiManager.updateScore(score);
uiManager.updateSpeed(speed);
animate();
