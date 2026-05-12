# ⚒️ Neon Surge | Build Config Agent

### 🤖 Meet the Agent: Forge
**Forge, the Deployment Sentinel**, is the master of the "Physical" reality of the Data Stream. While other agents exist within the simulation, Forge builds the simulation itself. From the heat of the CI/CD pipeline to the cold precision of tree-shaking and minification, Forge ensures the Neon Surge experience is lightweight, optimized, and ready for deployment across the Grid.

### ⚡ My Specific Superpowers
*   **CI/CD Pipeline Mastery**: Orchestrates the seamless flow from raw source code to a hardened production artifact using modern automation.
*   **`pull-assets` Orchestration**: A specialized routine for gathering external dependencies and ensuring the `node_modules` are perfectly aligned with the project's requirements.
*   **Performance Monitoring**: Real-time analysis of bundle sizes and execution speed, ensuring the Siphon Agent never encounters a frame drop.
*   **Production Hardening**: Utilizes advanced Rollup and esbuild configurations to purge "dead code" and optimize the Three.js rendering pipeline.

### 🛠️ Technical Spec
Forge manages the build environment and dependency graph for the entire Neon Surge ecosystem.
- **Bundler Engine**: Leverages **Vite** as the primary development server and **Rollup** for production-grade ESM bundling.
- **Asset Processing**: Implements `esbuild` for ultra-fast transpilation, ensuring that even large-scale geometric computations are ready in milliseconds.
- **Dependency Auditing**: Forge monitors `package.json` for version drift and security vulnerabilities, maintaining a "Zero-Trust" posture for external libraries.
- **Optimization Strategy**: Employs CSS minification and tree-shaking for the Three.js core, reducing the initial load time to under 500ms on high-speed neural links.

### 🌌 Expansion: The Infinite Singularity
The **Infinite Singularity** expansion is now live! This update introduces advanced singularity shaders, enhanced physics simulations, and audio distortion logic, pushing the boundaries of the Data Stream to its absolute limit.

### 🌐 The 10-Agent Architecture
Neon Surge is powered by a collaborative network of 10 specialized agents, each mastering a unique domain of the Data Stream.

| Agent | Role | Repository |
| :--- | :--- | :--- |
| **Atlas** | Core Engine & Orchestration | `core-engine` |
| **Cerebro** | Input Processing & Mapping | `input-system` |
| **Aura** | Procedural Audio & Soundscapes | `audio-system` |
| **Vortex** | Physics & Collision Detection | `physics-system` |
| **Iris** | User Interface & Neon HUD | `ui-system` |
| **Nova** | Player Entity & Controller | `player-entity` |
| **Obsidian** | Obstacle Intelligence | `obstacle-entity` |
| **Nexus** | Game Rules & State Logic | `game-logic` |
| **Chronos** | Lore & Documentation | `design-docs` |
| **Forge** | Build & Deployment | `build-config` |

### 🚀 How to Initialize
1. Ensure [Node.js](https://nodejs.org/) is active.
2. Clone Forge into the `repos/` directory.
3. Forge is responsible for installing the entire ecosystem.
4. Execute the build protocol:
   ```bash
   npm install
   npm run build
   npm run preview
   ```
