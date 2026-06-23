/**
 * GizmoHelper.js — Orientation gizmo drawn on a separate canvas
 */

import * as THREE from 'three';

export class GizmoHelper {
  constructor(viewer, canvas) {
    this.viewer = viewer;
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this._bound = this._draw.bind(this);
  }

  start() {
    this.viewer.on('afterRender', this._bound);
  }

  stop() {
    this.viewer.off('afterRender', this._bound);
  }

  _draw() {
    const { ctx, canvas, viewer } = this;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const scale  = size * 0.35;

    // Get camera rotation to derive axes directions
    const camDir = new THREE.Vector3();
    viewer.camera.getWorldDirection(camDir);

    const quat = viewer.camera.quaternion;

    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), label: 'X', color: '#ef4444' },
      { dir: new THREE.Vector3(0, 1, 0), label: 'Y', color: '#22c55e' },
      { dir: new THREE.Vector3(0, 0, 1), label: 'Z', color: '#3b82f6' },
    ];

    // Project each axis direction relative to camera
    const projected = axes.map(axis => {
      const v = axis.dir.clone().applyQuaternion(quat.clone().invert());
      return { ...axis, px: v.x * scale + center, py: -v.y * scale + center, depth: v.z };
    });

    // Sort by depth (back to front)
    projected.sort((a, b) => a.depth - b.depth);

    projected.forEach(({ px, py, label, color, depth }) => {
      const alpha = depth > 0 ? 1 : 0.35;
      ctx.globalAlpha = alpha;

      // Line
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(px, py);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, px + (px - center) * 0.25, py + (py - center) * 0.25);
    });

    ctx.globalAlpha = 1;
  }
}
