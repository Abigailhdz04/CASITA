/**
 * Screenshot.js — Capture PNG/JPG from the WebGL canvas
 */

import { showToast } from '../ui/Notifications.js';

export class ScreenshotTool {
  constructor(viewer) {
    this.viewer = viewer;
  }

  capture(format = 'png') {
    const renderer = this.viewer.renderer;

    // Render one more frame to ensure canvas is current
    renderer.render(this.viewer.scene, this.viewer.camera);

    const canvas = renderer.domElement;
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality  = format === 'jpg' ? 0.95 : undefined;

    try {
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `BlenderVR_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(`Captura guardada como ${format.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Error al capturar: ' + err.message, 'error');
    }
  }
}
