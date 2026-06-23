/**
 * Stats.js — FPS + GPU monitor overlay
 */

export class StatsMonitor {
  constructor(viewer) {
    this.viewer = viewer;
    this._frames = 0;
    this._last   = performance.now();
    this._fpsEl  = document.getElementById('fps-val');
    this._gpuEl  = document.getElementById('gpu-val');
    this._bound  = this._tick.bind(this);
  }

  start() {
    // GPU info
    try {
      const gl = this.viewer.renderer.getContext();
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
        if (this._gpuEl) this._gpuEl.textContent = _shortGPU(gpu);
      } else {
        if (this._gpuEl) this._gpuEl.textContent = 'WebGL2';
      }
    } catch {
      if (this._gpuEl) this._gpuEl.textContent = 'GPU';
    }

    this.viewer.on('afterRender', this._bound);
  }

  stop() {
    this.viewer.off('afterRender', this._bound);
  }

  _tick() {
    this._frames++;
    const now = performance.now();
    if (now - this._last >= 1000) {
      const fps = Math.round(this._frames * 1000 / (now - this._last));
      if (this._fpsEl) {
        this._fpsEl.textContent = fps;
        // Color code
        this._fpsEl.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
      }
      this._frames = 0;
      this._last   = now;
    }
  }
}

function _shortGPU(str) {
  // Shorten GPU string
  return str
    .replace('ANGLE (', '').replace(')', '')
    .replace('Direct3D11', 'D3D11')
    .replace('Google Inc. (', '').replace(')', '')
    .substring(0, 28);
}
