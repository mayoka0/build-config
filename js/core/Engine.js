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

        // Singularity Core Setup
        this.singularityIntensity = 1.0;
        this.createSingularity();

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
     * Creates the Singularity core at the edge of the scene.
     * Uses an Icosahedron with a custom shader for a "black hole" effect.
     */
    createSingularity() {
        const geometry = new THREE.IcosahedronGeometry(100, 20);
        
        this.singularityMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                intensity: { value: 1.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
                    
                    // Event horizon glow
                    vec3 glowColor = vec3(0.6, 0.1, 0.9); // Deep purple
                    vec3 color = glowColor * fresnel * intensity;
                    
                    // Pulsating rim
                    color += 0.2 * vec3(0.2, 0.5, 1.0) * (sin(time * 2.0) * 0.5 + 0.5) * fresnel;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

        this.singularity = new THREE.Mesh(geometry, this.singularityMaterial);
        this.singularity.position.set(0, 0, -500);
        this.scene.add(this.singularity);

        // Add an inner dark sphere for the "black hole" center
        const innerGeo = new THREE.SphereGeometry(95, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const blackHole = new THREE.Mesh(innerGeo, innerMat);
        this.singularity.add(blackHole);
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
        const time = this.clock.getElapsedTime();

        // Pulse intensity decay for point light
        if (this.currentPulseIntensity > 0) {
            this.currentPulseIntensity *= 0.92;
        }
        this.pulsingLight.intensity = this.baseIntensity + this.currentPulseIntensity;
        
        // Subtle color pulsing/shifting for point light
        this.pulsingLight.color.setHSL((time * 0.1) % 1, 1, 0.5);

        // Update Singularity
        if (this.singularityMaterial) {
            this.singularityMaterial.uniforms.time.value = time;
            
            // Apply a base pulsation to singularityIntensity if not modified externally
            const pulse = Math.sin(time * 0.5) * 0.2 + 1.0;
            this.singularityMaterial.uniforms.intensity.value = this.singularityIntensity * pulse;
            
            // Subtle rotation
            this.singularity.rotation.y += deltaTime * 0.1;
            this.singularity.rotation.z += deltaTime * 0.05;
        }
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
