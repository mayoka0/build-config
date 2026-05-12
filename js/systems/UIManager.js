export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.uiContainer = document.getElementById('ui');
        
        this.highScoreKey = 'neon-surge-high-scores';
        this.maxHighScores = 5;
        
        this.initCrosshair();
        this.initLeaderboard();
    }

    initCrosshair() {
        const existing = document.getElementById('crosshair');
        if (existing) {
            this.crosshair = existing;
            return;
        }
        this.crosshair = document.createElement('div');
        this.crosshair.id = 'crosshair';
        const inner = document.createElement('div');
        inner.className = 'crosshair-inner';
        this.crosshair.appendChild(inner);
        document.body.appendChild(this.crosshair);
    }

    updateCrosshair(x, y, isLocked) {
        if (!this.crosshair) return;
        // Assume x, y are pixel values
        this.crosshair.style.left = `${x}px`;
        this.crosshair.style.top = `${y}px`;
        
        if (isLocked) {
            this.crosshair.classList.add('locked');
        } else {
            this.crosshair.classList.remove('locked');
        }
    }

    triggerGlitch() {
        if (this.uiContainer) {
            this.uiContainer.classList.add('glitch-active');
            setTimeout(() => {
                this.uiContainer.classList.remove('glitch-active');
            }, 500);
        }
    }

    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = `SCORE: ${score.toString().padStart(4, '0')}`;
        }
    }

    updateSpeed(speed) {
        if (this.speedElement) {
            this.speedElement.textContent = `SPEED: ${speed.toFixed(1)}x`;
        }
    }

    saveHighScore(score) {
        let scores = this.getHighScores();
        scores.push({ score, date: new Date().toISOString() });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, this.maxHighScores);
        localStorage.setItem(this.highScoreKey, JSON.stringify(scores));
    }

    getHighScores() {
        const scores = localStorage.getItem(this.highScoreKey);
        return scores ? JSON.parse(scores) : [];
    }

    initLeaderboard() {
        const existing = document.getElementById('leaderboard');
        if (existing) {
            this.leaderboardElement = existing;
            return;
        }
        this.leaderboardElement = document.createElement('div');
        this.leaderboardElement.id = 'leaderboard';
        if (this.gameOverElement) {
            this.gameOverElement.appendChild(this.leaderboardElement);
        }
    }

    updateLeaderboardUI() {
        const scores = this.getHighScores();
        let html = '<h3>TOP SCORES</h3>';
        scores.forEach((s, i) => {
            html += `<div class="leaderboard-entry">#${i + 1} - ${s.score.toString().padStart(4, '0')}</div>`;
        });
        this.leaderboardElement.innerHTML = html;
    }

    showGameOver(finalScore) {
        if (this.gameOverElement && this.finalScoreElement) {
            this.finalScoreElement.textContent = `SCORE: ${finalScore}`;
            this.saveHighScore(finalScore);
            this.updateLeaderboardUI();
            this.gameOverElement.style.display = 'block';
        }
    }
}
