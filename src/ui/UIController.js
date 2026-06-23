/**
 * UIController.js — Master UI event handler
 * Wires all buttons, sliders, and panels to viewer systems
 */

import { showToast } from './Notifications.js';

export class UIController {
  constructor({ viewer, loader, walkMode, vrManager, stats, screenshot, measure }) {
    this.viewer     = viewer;
    this.loader     = loader;
    this.walkMode   = walkMode;
    this.vrManager  = vrManager;
    this.stats      = stats;
    this.screenshot = screenshot;
    this.measure    = measure;

    this._setupFileLoading();
    this._setupModeButtons();
    this._setupViewButtons();
    this._setupSidebarControls();
    this._setupToolButtons();
    this._setupPanelTabs();
    this._setupTheme();
    this._setupFullscreen();
    this._setupDropZone();
    this._setupVRButtons();
    this._setupModelEvents();
    this._setupStatusBar();
  }

  /* ─── File Loading ─── */
  _setupFileLoading() {
    const fileInput  = document.getElementById('file-input');
    const btnLoad    = document.getElementById('btn-load-model');
    const btnWelcome = document.getElementById('btn-welcome-load');

    const openPicker = () => fileInput.click();
    btnLoad?.addEventListener('click', openPicker);
    btnWelcome?.addEventListener('click', openPicker);

    fileInput?.addEventListener('change', e => {
      const files = Array.from(e.target.files || []);
      if (files.length) this._loadFiles(files);
      fileInput.value = '';
    });
  }

  async _loadFiles(files) {
    for (const file of files) {
      try {
        await this.loader.loadFile(file);
      } catch (err) {
        console.error(err);
      }
    }
  }

  /* ─── Mode Buttons ─── */
  _setupModeButtons() {
    document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;

        if (mode === 'walk') {
          this._toggleWalkMode();
          return;
        }

        // Deactivate all
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.viewer.applyRenderMode(mode);
        this._updateStatus(`Modo: ${btn.querySelector('.btn-label')?.textContent || mode}`);
      });
    });
  }

  _toggleWalkMode() {
    if (this.walkMode.active) {
      this.walkMode.stop();
      document.getElementById('walk-hud')?.classList.add('hidden');
      document.getElementById('btn-walk-mode')?.classList.remove('active');
      document.body.classList.remove('walk-mode');
      this._updateStatus('Modo Órbita');
    } else {
      if (!this.viewer.model) {
        showToast('Carga un modelo para usar el recorrido', 'warning');
        return;
      }
      this.walkMode.start();
      document.getElementById('walk-hud')?.classList.remove('hidden');
      document.getElementById('btn-walk-mode')?.classList.add('active');
      document.body.classList.add('walk-mode');
      this._updateStatus('Modo Recorrido Arquitectónico — WASD para moverse');
    }
  }

  /* ─── Quick View Buttons ─── */
  _setupViewButtons() {
    document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewer.setView(btn.dataset.view);
      });
    });

    document.getElementById('btn-reset-view')?.addEventListener('click', () => {
      this.viewer.resetView();
    });
    document.getElementById('qb-reset')?.addEventListener('click', () => {
      this.viewer.resetView();
    });
    document.getElementById('btn-exit-walk')?.addEventListener('click', () => {
      this._toggleWalkMode();
    });
  }

  /* ─── Sidebar Controls ─── */
  _setupSidebarControls() {
    // Sidebar toggle
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });

    // Auto-rotate
    document.getElementById('toggle-auto-rotate')?.addEventListener('change', e => {
      this.viewer.setAutoRotate(e.target.checked);
      document.getElementById('qb-rotate')?.classList.toggle('active', e.target.checked);
    });
    document.getElementById('qb-rotate')?.addEventListener('click', () => {
      const cb = document.getElementById('toggle-auto-rotate');
      if (cb) {
        cb.checked = !cb.checked;
        this.viewer.setAutoRotate(cb.checked);
      }
    });

    // Axes
    document.getElementById('toggle-axes')?.addEventListener('change', e => {
      this.viewer.setAxesVisible(e.target.checked);
    });

    // Grid
    document.getElementById('toggle-grid')?.addEventListener('change', e => {
      this.viewer.setGridVisible(e.target.checked);
    });

    // Shadows
    document.getElementById('toggle-shadows')?.addEventListener('change', e => {
      this.viewer.setShadows(e.target.checked);
    });

    // Lighting sliders
    this._setupSlider('slider-ambient',     'val-ambient',     v => this.viewer.setAmbientIntensity(v));
    this._setupSlider('slider-directional', 'val-directional', v => this.viewer.setDirectionalIntensity(v));
    this._setupSlider('slider-exposure',    'val-exposure',    v => this.viewer.setExposure(v));

    // Background options
    document.querySelectorAll('.bg-btn[data-bg]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewer.setBackground(btn.dataset.bg);
      });
    });

    // Quality
    document.getElementById('quality-select')?.addEventListener('change', e => {
      this.viewer.setQuality(e.target.value);
      showToast(`Calidad: ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });
  }

  _setupSlider(id, valId, callback) {
    const slider = document.getElementById(id);
    const valEl  = document.getElementById(valId);
    slider?.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      if (valEl) valEl.textContent = v.toFixed(2);
      callback(v);
    });
  }

  /* ─── Tool Buttons ─── */
  _setupToolButtons() {
    document.getElementById('btn-screenshot')?.addEventListener('click', () => {
      this.screenshot.capture('png');
    });
    document.getElementById('btn-screenshot-png')?.addEventListener('click', () => {
      this.screenshot.capture('png');
    });
    document.getElementById('btn-screenshot-jpg')?.addEventListener('click', () => {
      this.screenshot.capture('jpg');
    });

    document.getElementById('btn-measure')?.addEventListener('click', () => {
      const active = this.measure.toggle();
      document.getElementById('measure-hud')?.classList.toggle('hidden', !active);
      document.getElementById('btn-measure')?.classList.toggle('active', active);
    });
    document.getElementById('btn-exit-measure')?.addEventListener('click', () => {
      this.measure.stop();
      document.getElementById('measure-hud')?.classList.add('hidden');
    });

    document.getElementById('btn-tv-mirror')?.addEventListener('click', () => {
      showToast('Modo Presentación: Comparte la URL con tu TV en la misma red WiFi', 'info', 5000);
    });
    document.getElementById('btn-spectator')?.addEventListener('click', () => {
      showToast('Vista Espectador: Entra a VR y la TV mostrará la vista en tercera persona', 'info', 5000);
    });

    // Fullscreen
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this._toggleFullscreen());
    document.getElementById('qb-fullscreen')?.addEventListener('click', () => this._toggleFullscreen());
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      document.getElementById('btn-fullscreen')?.querySelector('.material-icons-round')
        ?.textContent !== undefined && (
        document.getElementById('btn-fullscreen').querySelector('.material-icons-round').textContent = 'fullscreen_exit'
      );
    } else {
      document.exitFullscreen();
      const icon = document.getElementById('btn-fullscreen')?.querySelector('.material-icons-round');
      if (icon) icon.textContent = 'fullscreen';
    }
  }

  /* ─── Panel Tabs (Inspector / Scene Tree) ─── */
  _setupPanelTabs() {
    document.querySelectorAll('.panel-tab[data-panel]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel-content').forEach(p => p.classList.add('hidden'));
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.panel}`)?.classList.remove('hidden');
      });
    });
  }

  /* ─── Theme ─── */
  _setupTheme() {
    const btn = document.getElementById('btn-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!prefersDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      btn?.querySelector('.material-icons-round') && (
        btn.querySelector('.material-icons-round').textContent = 'light_mode'
      );
    }

    btn?.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      const icon = btn.querySelector('.material-icons-round');
      if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }

  /* ─── Fullscreen ─── */
  _setupFullscreen() {
    document.addEventListener('fullscreenchange', () => {
      const icon = document.getElementById('btn-fullscreen')?.querySelector('.material-icons-round');
      if (icon) icon.textContent = document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen';
    });
  }

  /* ─── Drag & Drop ─── */
  _setupDropZone() {
    const viewport = document.getElementById('viewport');
    const overlay  = document.getElementById('drop-overlay');
    let dragCounter = 0;

    document.addEventListener('dragenter', e => {
      e.preventDefault();
      dragCounter++;
      overlay?.classList.remove('hidden');
    });
    document.addEventListener('dragleave', e => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) { dragCounter = 0; overlay?.classList.add('hidden'); }
    });
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => {
      e.preventDefault();
      dragCounter = 0;
      overlay?.classList.add('hidden');

      const files = Array.from(e.dataTransfer?.files || []).filter(f =>
        /\.(glb|gltf|fbx|obj|stl|ply|dae|blend|usdz|usd|usda|abc|3ds)$/i.test(f.name)
      );
      if (files.length) this._loadFiles(files);
      else showToast('Formato no reconocido', 'error');
    });
  }

  /* ─── VR ─── */
  _setupVRButtons() {
    document.getElementById('btn-vr')?.addEventListener('click', () => {
      this.vrManager.enterVR();
    });
  }

  /* ─── Model events → update inspector & scene tree ─── */
  _setupModelEvents() {
    this.viewer.on('modelLoaded', ({ object, options }) => {
      this._updateInspector(object, options);
      this._buildSceneTree(object);
      document.getElementById('welcome-screen')?.classList.add('hidden');
    });
  }

  _updateInspector(object, options) {
    const stats = this.viewer.getModelStats();
    if (!stats) return;

    document.getElementById('model-info')?.classList.remove('hidden');
    document.querySelector('.info-placeholder')?.classList.add('hidden');

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    set('info-name',       options.fileName || 'Desconocido');
    set('info-size',       options.fileSize ? _fmtSize(options.fileSize) : '—');
    set('info-vertices',   stats.vertices);
    set('info-polygons',   stats.triangles);
    set('info-materials',  stats.materials);
    set('info-textures',   stats.textures);
    set('info-animations', options.animations?.length ?? 0);
    set('info-dimensions', stats.dimensions + ' m');
    set('info-scale',      '1.0');
    set('info-format',     (options.format || '—').toUpperCase());
  }

  _buildSceneTree(object) {
    const container = document.getElementById('scene-tree-container');
    const placeholder = document.getElementById('tree-placeholder');
    if (!container) return;

    container.innerHTML = '';
    placeholder?.classList.add('hidden');

    const buildNode = (obj, depth = 0) => {
      const node = document.createElement('div');
      node.className = 'tree-node';
      node.style.paddingLeft = (8 + depth * 16) + 'px';

      const hasChildren = obj.children.length > 0;
      const icon = obj.isMesh ? 'view_in_ar' : hasChildren ? 'folder' : 'fiber_manual_record';

      node.innerHTML = `
        <span class="tree-toggle">${hasChildren ? '▾' : ''}</span>
        <span class="tree-icon material-icons-round">${icon}</span>
        <span class="tree-label">${obj.name || obj.type}</span>
        <span class="tree-visible material-icons-round" title="Mostrar/Ocultar">visibility</span>
      `;

      // Click to select/focus
      node.addEventListener('click', e => {
        if (e.target.classList.contains('tree-visible')) {
          obj.visible = !obj.visible;
          e.target.textContent = obj.visible ? 'visibility' : 'visibility_off';
          return;
        }
        document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');

        // Focus on this object
        const box = new (window.THREE?.Box3 || Object)();
        // Simple focus: move camera toward this object
      });

      container.appendChild(node);

      obj.children.forEach(child => buildNode(child, depth + 1));
    };

    buildNode(object);
  }

  /* ─── Status bar ─── */
  _setupStatusBar() {
    this.viewer.on('afterRender', () => {
      // FPS updated by Stats.js
    });
    this._updateStatus('Listo — Arrastra un modelo 3D para comenzar');
  }

  _updateStatus(msg) {
    const el = document.getElementById('status-msg');
    if (el) el.textContent = msg;
  }
}

/* ─── Utilities ─── */
function _fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}
