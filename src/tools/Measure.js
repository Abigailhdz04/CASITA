/**
 * Measure.js — Distance measurement tool
 * Click two points on the model to measure the 3D distance
 */

import * as THREE from 'three';
import { showToast } from '../ui/Notifications.js';

export class MeasureTool {
  constructor(viewer) {
    this.viewer  = viewer;
    this.active  = false;
    this._points = [];
    this._line   = null;
    this._raycaster = new THREE.Raycaster();

    this._boundClick = this._onClick.bind(this);
  }

  toggle() {
    this.active ? this.stop() : this.start();
    return this.active;
  }

  start() {
    this.active  = true;
    this._points = [];
    this._clearLine();
    this.viewer.canvas.addEventListener('click', this._boundClick);
    showToast('Haz clic en 2 puntos del modelo para medir', 'info', 4000);
  }

  stop() {
    this.active = false;
    this.viewer.canvas.removeEventListener('click', this._boundClick);
    this._clearLine();
    document.getElementById('measure-result').textContent = '';
  }

  _onClick(e) {
    if (!this.viewer.model) return;

    const rect   = this.viewer.canvas.getBoundingClientRect();
    const mouse  = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top)  / rect.height) * 2 + 1,
    );

    this._raycaster.setFromCamera(mouse, this.viewer.camera);
    const hits = this._raycaster.intersectObject(this.viewer.model, true);

    if (hits.length === 0) return;
    const point = hits[0].point.clone();
    this._points.push(point);

    // Marker sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.03),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed }),
    );
    sphere.position.copy(point);
    sphere.userData.isMeasureMarker = true;
    this.viewer.scene.add(sphere);

    if (this._points.length === 2) {
      this._drawLine();
      const dist = this._points[0].distanceTo(this._points[1]);
      const result = `${dist.toFixed(3)} m`;
      const el = document.getElementById('measure-result');
      if (el) el.textContent = result;
      showToast(`Distancia: ${result}`, 'success', 6000);
      this._points = [];  // reset for next measurement
    }
  }

  _drawLine() {
    this._clearLine();
    const geo = new THREE.BufferGeometry().setFromPoints(this._points);
    const mat = new THREE.LineBasicMaterial({ color: 0xa78bfa, linewidth: 2 });
    this._line = new THREE.Line(geo, mat);
    this._line.userData.isMeasureMarker = true;
    this.viewer.scene.add(this._line);
  }

  _clearLine() {
    const toRemove = [];
    this.viewer.scene.traverse(obj => {
      if (obj.userData.isMeasureMarker) toRemove.push(obj);
    });
    toRemove.forEach(obj => this.viewer.scene.remove(obj));
    this._line = null;
  }
}
