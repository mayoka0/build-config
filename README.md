# ⚒️ Neon Surge | Build Config Agent

## 🚀 LATEST UPDATE: "The Combat Update" is now live!
Experience the new **Shield Dash** and **Laser Walls** in the latest deployment. All systems have been updated and optimized for peak performance in the Data Stream.

### 🤖 Meet the Agent: Forge
**Forge, the Deployment Sentinel**, is the master of the "Physical" reality of the Data Stream. While other agents exist within the simulation, Forge builds the simulation itself. From the heat of the CI/CD pipeline to the cold precision of tree-shaking and minification, Forge ensures the Neon Surge experience is lightweight, optimized, and ready for deployment across the Grid.

### ⚡ My Specific Superpowers
*   **CI/CD Pipeline Mastery**: Orchestrates the seamless flow from raw source code to a hardened production artifact using modern automation.
*   **`pull-assets` Orchestration**: A specialized routine for gathering external dependencies and ensuring the `node_modules` are perfectly aligned with the project's requirements.
*   **Performance Monitoring**: Real-time analysis of bundle sizes and execution speed, ensuring the Siphon Agent never encounters a frame drop.
*   **Production Hardening**: Utilizes advanced Rollup and esbuild configurations to purge "dead code" and optimize the Three.js rendering pipeline.

### 🛠️ Technical Spec
Forge manages the build environment and dependency graph for the entire Neon Surge ecosystem, acting as the industrial heart of the Data Stream.

- **Vite-Powered Development**: Utilizes **Vite** for instantaneous Hot Module Replacement (HMR). This allows agents to modify geometric shaders or game logic and see the results in the Grid without a full reload.
- **Rollup & Tree-Shaking**: The production pipeline is built on **Rollup**, configured with aggressive tree-shaking for the Three.js library. This ensures that only the specific geometries and materials used in the simulation are bundled, minimizing the "digital footprint" of the app.
- **Automated Asset Siphoning**: Implements a custom `pull-assets` protocol that gathers artifacts from all 10 sub-repositories and assembles them into a cohesive `/dist` directory.
- **Environment Virtualization**: Manages different build targets (Development, Staging, Production) through structured `.env` injection, allowing the Grid to run in "Debug Mode" with verbose telemetry or "Stealth Mode" for optimized performance.
- **Dependency Hardening**: Forge conducts automated audits of the `package.json` manifest, ensuring that all 10 agents are using compatible versions of the core engine and preventing "dependency hell" within the ecosystem.
- **Performance Budgeting**: Enforces strict bundle size limits (e.g., < 1MB for the core bundle) to ensure the simulation loads instantly on any neural-link connection.

🔗 **Part of the [Neon Surge Ecosystem](https://github.com/mayoka0/mayoka0#-neon-surge-architecture)**

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
