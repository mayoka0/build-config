/**
 * MusicDirector handles procedural synthwave basslines.
 */
class MusicDirector {
    constructor(audioContext, destination) {
        this.ctx = audioContext;
        this.destination = destination;
        this.tempo = 120;
        this.isPlaying = false;
        this.nextNoteTime = 0;
        this.currentNote = 0;
        this.timerID = null;
        
        // A minor pentatonic bass notes
        this.bassNotes = [55.00, 65.41, 73.42, 82.41]; // A1, C2, D2, E2
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.schedule();
    }

    stop() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
    }

    setSpeed(speedFactor) {
        this.tempo = 120 * speedFactor;
    }

    schedule() {
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playNote(this.currentNote, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = setTimeout(() => this.schedule(), 25);
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        this.currentNote = (this.currentNote + 1) % 16;
    }

    playNote(note, time) {
        // Rhythmic pattern: focus on 1 and 3, with some syncopation
        const pattern = [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1];
        if (pattern[note] === 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        // Select note based on measure position
        const freq = this.bassNotes[Math.floor(note / 4) % this.bassNotes.length];
        osc.frequency.setValueAtTime(freq, time);
        
        // Filter sweep for that synthwave feel
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(2000, time + 0.1);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.destination);

        osc.start(time);
        osc.stop(time + 0.2);
    }
}

/**
 * AudioManager handles synthesized sound effects and procedural music.
 */
export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Singularity Distortion Nodes
        this.masterDistortion = this.ctx.createWaveShaper();
        this.masterFilter = this.ctx.createBiquadFilter();
        this.masterFilter.type = 'lowpass';
        this.masterFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);

        this.masterDistortion.connect(this.masterFilter);
        this.masterFilter.connect(this.ctx.destination);

        // Reverb / Environment setup
        this.reverb = this.ctx.createConvolver();
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.generateReverbBuffer();
        
        this.reverb.connect(this.reverbGain);
        this.reverbGain.connect(this.masterDistortion);

        // Music Director
        this.musicDirector = new MusicDirector(this.ctx, this.masterDistortion);

        this.engineOsc = null;
        this.engineGain = null;
    }

    /**
     * Generates a procedural impulse response for a metallic tunnel effect.
     */
    generateReverbBuffer() {
        const length = this.ctx.sampleRate * 2.5; // 2.5 seconds decay
        const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Exponentially decaying noise with some resonance
                const decay = Math.exp(-i / (this.ctx.sampleRate * 0.5));
                const noise = (Math.random() * 2 - 1);
                // Simple comb-filter-like resonance for "metallic" feel
                const resonance = Math.sin(i * 0.05); 
                data[i] = noise * decay * (0.8 + 0.2 * resonance);
            }
        }
        this.reverb.buffer = buffer;
    }

    /**
     * Plays a spatialized 'zap' sound effect.
     * @param {number} x - X position in 3D space
     * @param {number} y - Y position in 3D space
     * @param {number} z - Z position in 3D space
     */
    playZap(x = 0, y = 0, z = 0) {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.ctx.createPanner();

        // Spatial configuration
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.positionX.setValueAtTime(x, this.ctx.currentTime);
        panner.positionY.setValueAtTime(y, this.ctx.currentTime);
        panner.positionZ.setValueAtTime(z, this.ctx.currentTime);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(panner);
        
        // Connect to both dry and wet (reverb) paths
        panner.connect(this.masterDistortion);
        panner.connect(this.reverb);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Starts the procedural music.
     */
    startMusic() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.musicDirector.start();
    }

    /**
     * Updates the music tempo based on game speed.
     * @param {number} speed - The current game speed factor.
     */
    updateGameSpeed(speed) {
        this.musicDirector.setSpeed(speed);
    }

    /**
     * Starts a low humming 'engine' sound loop.
     */
    startEngine() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.engineOsc) return;

        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'triangle';
        this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(3, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(5, this.ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(this.engineOsc.frequency);
        lfo.start();

        this.engineGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.masterDistortion);
        this.engineGain.connect(this.reverb); // Engine hum also rings in the tunnel

        this.engineOsc.start();
    }

    /**
     * Updates the singularity distortion effects based on proximity.
     * @param {number} distanceToSingularity - Distance from the player to the singularity.
     */
    updateDistortion(distanceToSingularity) {
        const maxDist = 500;
        const factor = Math.max(0, Math.min(1, distanceToSingularity / maxDist));
        
        // 1. Lower filter cutoff (20000Hz far, 500Hz close)
        const cutoff = 500 + (factor * 19500);
        this.masterFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.05);

        // 2. Increase bitcrushing (16 bits far, 2 bits close)
        const bits = 2 + (factor * 14);
        if (bits >= 15) {
            this.masterDistortion.curve = null; // Clean at distance
        } else {
            this.masterDistortion.curve = this._generateBitcrushCurve(bits);
        }
    }

    /**
     * Generates a bitcrushing quantization curve for WaveShaperNode.
     * @param {number} bits - Target bit depth.
     */
    _generateBitcrushCurve(bits) {
        const samples = 4096;
        const curve = new Float32Array(samples);
        const levels = Math.pow(2, bits);
        for (let i = 0; i < samples; i++) {
            const x = (i / samples) * 2 - 1;
            curve[i] = Math.round(x * levels) / levels;
        }
        return curve;
    }
}
