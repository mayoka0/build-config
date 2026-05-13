import * as THREE from 'three';

/**
 * Obstacle class representing hazards in the tunnel.
 */
export class Obstacle {
    /**
     * @param {number} z - Initial Z position of the obstacle
     */
    constructor(z = -100) {
        // Generate a random geometric mesh
        const typeRoll = Math.random();
        this.isLaser = typeRoll < 0.2; // 20% chance for Laser Wall hazard

        let geometry;
        if (this.isLaser) {
            geometry = new THREE.BoxGeometry(22, 0.4, 0.2);
        } else {
            const type = Math.floor(Math.random() * 3);
            switch (type) {
                case 0:
                    geometry = new THREE.BoxGeometry(2, 2, 2);
                    break;
                case 1:
                    geometry = new THREE.TorusGeometry(3, 0.5, 16, 32);
                    break;
                case 2:
                default:
                    geometry = new THREE.IcosahedronGeometry(1.5, 0);
                    break;
            }
        }

        this.material = new THREE.MeshStandardMaterial({
            color: this.isLaser ? 0xff0066 : 0xff00ff,
            emissive: this.isLaser ? 0xff0066 : 0xff00ff,
            emissiveIntensity: this.isLaser ? 2 : 1,
            wireframe: !this.isLaser,
            transparent: this.isLaser,
            opacity: this.isLaser ? 0.9 : 1.0
        });

        this.mesh = new THREE.Mesh(geometry, this.material);

        // Random position on the tunnel circle
        const TUNNEL_RADIUS = 10;

        if (this.isLaser) {
            // Laser wall spans the tunnel and is centered
            this.mesh.position.set(0, 0, z);
            // Randomly horizontal or vertical
            if (Math.random() > 0.5) {
                this.mesh.rotation.z = Math.PI / 2;
            }
            this.behavior = 'straight';
        } else {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (TUNNEL_RADIUS - 2);

            this.mesh.position.set(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                z
            );

            // Random initial rotation
            this.mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // Behavioral AI
            const behaviors = ['straight', 'waver', 'patrol'];
            this.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        }

        this.behaviorOffset = Math.random() * Math.PI * 2;
        this.basePosition = this.mesh.position.clone();

        // Fracture state
        this.isShattered = false;
        this.shards = new THREE.Group();
    }

    /**
     * Swaps the mesh with a fractured version.
     */
    shatter() {
        if (this.isShattered) return;
        this.isShattered = true;
        
        const shardCount = 8;
        for (let i = 0; i < shardCount; i++) {
            const shardGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const shardMat = this.material.clone();
            shardMat.wireframe = false;
            shardMat.transparent = true;
            
            const shard = new THREE.Mesh(shardGeom, shardMat);
            shard.position.copy(this.mesh.position);
            
            // Random velocity for shards
            shard.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            this.shards.add(shard);
        }
        
        // Hide original mesh
        this.mesh.visible = false;
    }

    /**
     * Updates the obstacle position and rotation.
     * @param {number} speed - The current game speed
     */
    update(speed) {
        if (this.isShattered) {
            this.shards.children.forEach(shard => {
                shard.position.add(shard.userData.velocity);
                shard.rotation.x += 0.1;
                shard.rotation.y += 0.1;
                shard.material.opacity -= 0.02;
            });
            return;
        }

        // Move along the Z axis towards the player
        this.mesh.position.z += speed;
        this.basePosition.z += speed;

        // Behavioral AI movement
        const time = Date.now() * 0.002;
        if (this.behavior === 'waver') {
            this.mesh.position.x = this.basePosition.x + Math.sin(time + this.behaviorOffset) * 2;
        } else if (this.behavior === 'patrol') {
            this.mesh.position.x = this.basePosition.x + Math.cos(time + this.behaviorOffset) * 2;
            this.mesh.position.y = this.basePosition.y + Math.sin(time + this.behaviorOffset) * 2;
        }
        
        // Neon Pulse
        const baseIntensity = this.isLaser ? 2.0 : 0.5;
        const pulseRange = this.isLaser ? 1.5 : 0.5;
        this.material.emissiveIntensity = baseIntensity + Math.sin(time * 2) * pulseRange;

        // Add some rotation for visual interest
        if (!this.isLaser) {
            this.mesh.rotation.x += 0.02;
            this.mesh.rotation.y += 0.02;
        }
    }
}
