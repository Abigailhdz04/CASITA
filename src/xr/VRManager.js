/**
 * VRManager.js — WebXR VR session manager
 * Handles immersive-vr sessions, controllers, teleportation
 */

import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { showToast } from '../ui/Notifications.js';

export class VRManager {
  constructor(viewer) {
    this.viewer  = viewer;
    this.session = null;
    this._controllers = [];
    this._teleportTarget = null;
    this._raycaster = new THREE.Raycaster();
  }

  async checkAvailability() {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      return false;
    }
  }

  async enterVR() {
    if (!navigator.xr) {
      showToast('WebXR no está disponible en este navegador', 'error');
      return;
    }

    const supported = await this.checkAvailability();
    if (!supported) {
      showToast('VR no soportado en este dispositivo. Usa un navegador compatible con WebXR.', 'warning', 5000);
      return;
    }

    try {
      // Enable WebXR on renderer
      this.viewer.renderer.xr.enabled = true;

      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
        requiredFeatures: ['local-floor'],
      });

      await this.viewer.renderer.xr.setSession(session);
      this.session = session;

      // Setup controllers
      this._setupControllers();

      // VR render loop
      this.viewer.renderer.setAnimationLoop((timestamp, frame) => {
        this.viewer.controls.update();
        this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
      });

      session.addEventListener('end', () => this._onSessionEnd());
      showToast('¡Entrando a VR! Ponte el visor.', 'success');
    } catch (err) {
      console.error('[VRManager] Error:', err);
      showToast(`Error VR: ${err.message}`, 'error');
    }
  }

  _setupControllers() {
    const factory = new XRControllerModelFactory();
    const renderer = this.viewer.renderer;
    const scene    = this.viewer.scene;

    for (let i = 0; i < 2; i++) {
      const controller = renderer.xr.getController(i);
      controller.addEventListener('selectstart', () => this._onSelectStart(controller));
      controller.addEventListener('selectend',   () => this._onSelectEnd(controller));
      scene.add(controller);

      // Controller grip model
      const grip = renderer.xr.getControllerGrip(i);
      grip.add(factory.createControllerModel(grip));
      scene.add(grip);

      // Ray line
      const geometry = new THREE.BufferGeometry();
      geometry.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)]);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: 0xa78bfa,
        linewidth: 2,
      }));
      line.scale.z = 5;
      controller.add(line);

      this._controllers.push({ controller, grip });
    }

    // Teleport target marker
    const geo = new THREE.RingGeometry(0.15, 0.2, 32);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x7c3aed });
    this._teleportTarget = new THREE.Mesh(geo, mat);
    this._teleportTarget.visible = false;
    scene.add(this._teleportTarget);
  }

  _onSelectStart(controller) {
    // Show teleport target
    if (this._teleportTarget) this._teleportTarget.visible = true;
  }

  _onSelectEnd(controller) {
    // Teleport player to target
    if (this._teleportTarget?.visible) {
      const pos = this._teleportTarget.position.clone();
      this.viewer.renderer.xr.getCamera(this.viewer.camera).position.set(pos.x, pos.y + 1.6, pos.z);
      this._teleportTarget.visible = false;
    }
  }

  _onSessionEnd() {
    this.session = null;
    this._controllers.forEach(({ controller, grip }) => {
      this.viewer.scene.remove(controller);
      this.viewer.scene.remove(grip);
    });
    this._controllers = [];
    this.viewer.renderer.xr.enabled = false;

    // Restore normal render loop
    this.viewer.start();
    showToast('Saliste de VR', 'info');
  }

  exitVR() {
    this.session?.end();
  }
}
