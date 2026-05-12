/**
 * Advanced InputHandler system for tracking keyboard, gamepad, and mouse input.
 * Provides smoothed axis values, combo detection, and mouse steering.
 */
export class InputHandler {
  /**
   * @param {Object} config - Configuration options.
   * @param {number} config.lerpFactor - Smoothing factor (0 to 1). Default: 0.1.
   * @param {number} config.comboTimeout - Time window for combos in ms. Default: 500.
   * @param {boolean} config.mouseEnabled - Enable mouse steering. Default: false.
   * @param {number} config.mouseSensitivity - Mouse movement sensitivity. Default: 0.05.
   */
  constructor(config = {}) {
    this.pressedKeys = new Set();
    this.axes = {
      Horizontal: { value: 0, target: 0, lerpFactor: config.lerpFactor || 0.1 },
      Vertical: { value: 0, target: 0, lerpFactor: config.lerpFactor || 0.1 },
    };

    // Combo Detection
    this.keyHistory = [];
    this.comboTimeout = config.comboTimeout || 500;
    this.combos = []; // Array of { sequence: string[], callback: Function }

    // Mouse Steering
    this.mouseEnabled = config.mouseEnabled || false;
    this.mouseSensitivity = config.mouseSensitivity || 0.05;
    this.mouseDelta = { x: 0, y: 0 };

    // Gamepad
    this.gamepadIndex = null;

    this._initListeners();
  }

  /**
   * Initializes event listeners for keyboard, mouse, and gamepad.
   * @private
   */
  _initListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.pressedKeys.has(e.key)) {
        this.pressedKeys.add(e.key);
        this._recordKeyPress(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.key);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mouseEnabled) {
        this.mouseDelta.x += e.movementX;
        this.mouseDelta.y += e.movementY;
      }
    });

    window.addEventListener('gamepadconnected', (e) => {
      console.log(`Gamepad connected: ${e.gamepad.id}`);
      this.gamepadIndex = e.gamepad.index;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
      }
    });
  }

  /**
   * Records a key press for combo detection.
   * @private
   */
  _recordKeyPress(key) {
    const now = Date.now();
    this.keyHistory.push({ key, time: now });

    // Filter out expired keys
    this.keyHistory = this.keyHistory.filter(k => now - k.time < this.comboTimeout);

    this._checkCombos();
  }

  /**
   * Checks if current key history matches any registered combos.
   * @private
   */
  _checkCombos() {
    const currentSequence = this.keyHistory.map(k => k.key);
    
    for (const combo of this.combos) {
      if (currentSequence.length >= combo.sequence.length) {
        const partial = currentSequence.slice(-combo.sequence.length);
        if (partial.every((val, index) => val === combo.sequence[index])) {
          if (typeof combo.callback === 'function') {
            combo.callback();
          }
          this.keyHistory = []; // Reset history after match
          break;
        }
      }
    }
  }

  /**
   * Updates input states. Should be called in the game loop.
   */
  update() {
    this._updateKeyboard();
    this._updateGamepad();
    this._updateMouse();
    this._interpolateAxes();
  }

  /**
   * Updates target values based on keyboard input.
   * @private
   */
  _updateKeyboard() {
    let h = 0;
    let v = 0;

    if (this.isPressed('ArrowLeft') || this.isPressed('a')) h -= 1;
    if (this.isPressed('ArrowRight') || this.isPressed('d')) h += 1;
    if (this.isPressed('ArrowUp') || this.isPressed('w')) v -= 1;
    if (this.isPressed('ArrowDown') || this.isPressed('s')) v += 1;

    this.axes.Horizontal.target = h;
    this.axes.Vertical.target = v;
  }

  /**
   * Updates target values based on gamepad input.
   * @private
   */
  _updateGamepad() {
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[this.gamepadIndex];
      if (gp) {
        const deadzone = 0.1;
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];

        if (Math.abs(axisX) > deadzone) this.axes.Horizontal.target = axisX;
        if (Math.abs(axisY) > deadzone) this.axes.Vertical.target = axisY;
      }
    }
  }

  /**
   * Incorporates mouse movement into axes if enabled.
   * @private
   */
  _updateMouse() {
    if (this.mouseEnabled) {
      // Mouse movement adds to the horizontal target
      const mouseH = this.mouseDelta.x * this.mouseSensitivity;
      this.axes.Horizontal.target = Math.max(-1, Math.min(1, this.axes.Horizontal.target + mouseH));
      
      // Reset delta for next frame
      this.mouseDelta = { x: 0, y: 0 };
    }
  }

  /**
   * Smoothly interpolates current values toward target values.
   * @private
   */
  _interpolateAxes() {
    for (const name in this.axes) {
      const axis = this.axes[name];
      axis.value += (axis.target - axis.value) * axis.lerpFactor;
      
      // Snap to target to prevent infinite tiny updates
      if (Math.abs(axis.target - axis.value) < 0.001) {
        axis.value = axis.target;
      }
    }
  }

  /**
   * Gets the interpolated value of an axis.
   * @param {string} name - The axis name ('Horizontal' or 'Vertical').
   * @returns {number} - Value between -1 and 1.
   */
  getAxis(name) {
    return this.axes[name] ? this.axes[name].value : 0;
  }

  /**
   * Checks if a key is currently held down.
   * @param {string} key - Key name.
   * @returns {boolean}
   */
  isPressed(key) {
    return this.pressedKeys.has(key);
  }

  /**
   * Registers a sequence of keys to trigger a callback.
   * @param {string[]} sequence - Key sequence (e.g. ['w', 'w']).
   * @param {Function} callback - Triggered on detection.
   */
  addCombo(sequence, callback) {
    this.combos.push({ sequence, callback });
  }
}
