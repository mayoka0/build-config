import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Engine class encapsulates the core Three.js components and handles basic setup.
 * Enhanced with Post-Processing (Bloom & Film Grain) and Advanced Lighting.
 */
export class Engine {
    constructor() {
        // Initialize Scene
        this.scene = new THREE.Scene();

        // Initialize Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Initialize Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Use Reinhard tone mapping for better bloom response
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        document.body.appendChild(this.renderer.domElement);

        // Initialize Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 50);
        this.pointLight.position.set(5, 5, 5);
        this.scene.add(this.pointLight);

        // Pulsing Light Setup
        this.setupPulsingLight();

        // Post-Processing Pipeline
        this.initPostProcessing();

        // Event Hook System
        this.eventHooks = {};

        // Handle Window Resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // For animation timing
        this.clock = new THREE.Clock();
    }

    /**
     * Sets up the pulsing point light and its default behavior.
     */
    setupPulsingLight() {
        // Neon cyan light by default
        this.pulsingLight = new THREE.PointLight(0x00ffff, 100, 20);
        this.pulsingLight.position.set(0, 2, 0);
        this.scene.add(this.pulsingLight);
        
        this.baseIntensity = 100;
        this.currentPulseIntensity = 0;

        // Setup a listener for 'beat' events
        this.on('beat', () => {
            this.currentPulseIntensity = 500;
        });
    }

    /**
     * Initializes the post-processing pipeline.
     */
    initPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        
        // 1. Render Pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // 2. Bloom Pass (UnrealBloomPass) for synthwave glow
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(this.bloomPass);

        // 3. Film Grain / Scanline Pass for retro-arcade feel
        this.filmPass = new FilmPass(
            0.35,   // noise intensity
            0.025,  // scanline intensity
            648,    // scanline count
            false   // grayscale
        );
        this.composer.addPass(this.filmPass);

        // 4. Output Pass (Required for proper color mapping)
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    /**
     * Registers an event listener.
     */
    on(event, callback) {
        if (!this.eventHooks[event]) {
            this.eventHooks[event] = [];
        }
        this.eventHooks[event].push(callback);
    }

    /**
     * Triggers a game event.
     */
    trigger(event, data) {
        if (this.eventHooks[event]) {
            this.eventHooks[event].forEach(cb => cb(data));
        }
    }

    /**
     * Updates the camera aspect ratio and renderer size on window resize.
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    /**
     * Internal update method for engine-managed components.
     */
    updateEngine() {
        const deltaTime = this.clock.getDelta();

        // Pulse intensity decay
        if (this.currentPulseIntensity > 0) {
            this.currentPulseIntensity *= 0.92; // Decay over time
        }
        this.pulsingLight.intensity = this.baseIntensity + this.currentPulseIntensity;
        
        // Subtle color pulsing/shifting
        const time = this.clock.getElapsedTime();
        this.pulsingLight.color.setHSL((time * 0.1) % 1, 1, 0.5);
    }

    /**
     * Renders the scene using the composer.
     */
    render() {
        this.updateEngine();
        this.composer.render();
    }

    /**
     * Starts the animation loop.
     * @param {Function} updateCallback - Function to call each frame before rendering.
     */
    startLoop(updateCallback) {
        const animate = () => {
            requestAnimationFrame(animate);
            if (updateCallback) updateCallback();
            this.render();
        };
        animate();
    }
}
