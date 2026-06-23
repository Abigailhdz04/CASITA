/**
 * WalkMode.js — First-person architectural walkthrough
 * WASD + mouse look with collision detection
 */

import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export class WalkMode {
  constructor(viewer) {
    this.viewer   = viewer;
    this.active   = false;
    this._keys    = {};
    this._speed   = 5;       // m/s
    this._height  = 1.7;     // eye height
    this._gravity = -9.8;
    this._velY    = 0;
    this._onGround = true;

    this._controls = null;
    this._raycaster = new THREE.Raycaster();
    this._crosshair = null;

    this._boundTick    = this._tick.bind(this);
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp   = this._onKeyUp.bind(this);
  }

  start() {
    if (this.active) return;
    this.active = true;

    // Disable orbit controls
    this.viewer.controls.enabled = false;

    // Set up PointerLock controls
    this._controls = new PointerLockControls(this.viewer.camera, this.viewer.canvas);
    this.viewer.scene.add(this._controls.getObject());

    // Position camera at human height
    const pos = this.viewer.controls.target.clone();
    pos.y = this._height;
    this.viewer.camera.position.copy(pos);
    this._controls.getObject().position.copy(pos);

    // Request pointer lock
    this.viewer.canvas.addEventListener('click', this._lockPointer = () => {
      this._controls?.lock();
    });
    this._controls.addEventListener('lock', () => {
      document.getElementById('walk-hud')?.classList.remove('hidden');
    });
    this._controls.addEventListener('unlock', () => {
      // Don't auto-exit on unlock, user may have just tabbed
    });

    // Keyboard
    document.addEventListener('keydown', this._boundKeyDown);
    document.addEventListener('keyup',   this._boundKeyUp);

    // Crosshair
    this._addCrosshair();

    // Hook into render loop
    this.viewer.on('tick', this._boundTick);

    this._controls.lock();
  }

  stop() {
    if (!this.active) return;
    this.active = false;

    this._controls?.unlock();
    if (this._controls?.getObject().parent === this.viewer.scene) {
      this.viewer.scene.remove(this._controls.getObject());
    }
    this._controls = null;

    // Re-enable orbit controls
    this.viewer.controls.enabled = true;
    this.viewer.resetView();

    document.removeEventListener('keydown', this._boundKeyDown);
    document.removeEventListener('keyup',   this._boundKeyUp);
    this.viewer.off('tick', this._boundTick);
    this._removeCrosshair();

    this.viewer.canvas.removeEventListener('click', this._lockPointer);
  }

  _tick({ delta }) {
    if (!this.active || !this._controls?.isLocked) return;

    const speed = this._speed * delta;
    const obj   = this._controls.getObject();

    // Movement
    const forward = new THREE.Vector3();
    const right   = new THREE.Vector3();
    this.viewer.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

    if (this._keys['KeyW'] || this._keys['ArrowUp'])    obj.position.addScaledVector(forward,  speed);
    if (this._keys['KeyS'] || this._keys['ArrowDown'])  obj.position.addScaledVector(forward, -speed);
    if (this._keys['KeyA'] || this._keys['ArrowLeft'])  obj.position.addScaledVector(right,   -speed);
    if (this._keys['KeyD'] || this._keys['ArrowRight']) obj.position.addScaledVector(right,    speed);
    if (this._keys['KeyQ'] || this._keys['PageUp'])     obj.position.y += speed;
    if (this._keys['KeyE'] || this._keys['PageDown'])   obj.position.y -= speed;

    // Simple gravity & floor collision
    this._velY += this._gravity * delta;
    obj.position.y += this._velY * delta;

    const floor = this._getFloorY();
    if (obj.position.y < floor + this._height) {
      obj.position.y = floor + this._height;
      this._velY = 0;
      this._onGround = true;
    }

    // Jump
    if ((this._keys['Space']) && this._onGround) {
      this._velY = 5;
      this._onGround = false;
    }
  }

  _getFloorY() {
    if (!this.viewer.model) return 0;
    const box = new THREE.Box3().setFromObject(this.viewer.model);
    return box.min.y;
  }

  _onKeyDown(e) { this._keys[e.code] = true; }
  _onKeyUp(e)   { this._keys[e.code] = false; }

  _addCrosshair() {
    let ch = document.getElementById('walk-crosshair');
    if (!ch) {
      ch = document.createElement('div');
      ch.id = 'walk-crosshair';
      document.getElementById('viewport')?.appendChild(ch);
    }
    ch.style.display = 'block';
    this._crosshair = ch;
  }

  _removeCrosshair() {
    this._crosshair?.remove();
    this._crosshair = null;
  }
}
