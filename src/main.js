/**
 * BlenderVR — Main Entry Point
 * Bootstraps all systems and connects UI events
 */

import './style.css';
import { Viewer } from './core/Viewer.js';
import { ModelLoader } from './loaders/ModelLoader.js';
import { UIController } from './ui/UIController.js';
import { WalkMode } from './modes/WalkMode.js';
import { VRManager } from './xr/VRManager.js';
import { StatsMonitor } from './tools/Stats.js';
import { ScreenshotTool } from './tools/Screenshot.js';
import { MeasureTool } from './tools/Measure.js';
import { GizmoHelper } from './tools/GizmoHelper.js';
import { DeviceDetect } from './utils/DeviceDetect.js';
import { showToast } from './ui/Notifications.js';

// ─── Initialize device detection ───
const device = DeviceDetect.detect();
document.body.classList.add(`device-${device.type}`);

// ─── Initialize 3D Viewer ───
const viewer = new Viewer(document.getElementById('viewport'));

// ─── Initialize subsystems ───
const loader    = new ModelLoader(viewer);
const walkMode  = new WalkMode(viewer);
const vrManager = new VRManager(viewer);
const stats     = new StatsMonitor(viewer);
const screenshot = new ScreenshotTool(viewer);
const measure   = new MeasureTool(viewer);
const gizmo     = new GizmoHelper(viewer, document.getElementById('gizmo-canvas'));
const ui        = new UIController({ viewer, loader, walkMode, vrManager, stats, screenshot, measure });

// ─── Start render loop ───
viewer.start();
gizmo.start();
stats.start();

// ─── Load default model ───
loader.loadFromUrl('/casa.glb', 'casa exA 1.obj', 100076981).catch(err => {
  console.error('[Main] Error loading default model:', err);
});

// ─── VR availability check ───
vrManager.checkAvailability().then(available => {
  if (!available) {
    document.getElementById('btn-vr').classList.add('hidden');
    document.getElementById('btn-vr')?.setAttribute('title', 'WebXR no disponible en este dispositivo');
  }
});

// ─── Show network IP in status bar ───
try {
  fetch('/api/ip').then(r => r.json()).then(d => {
    if (d?.ip) document.getElementById('network-ip').textContent = d.ip;
  }).catch(() => {
    document.getElementById('network-ip').textContent = window.location.hostname;
  });
} catch {
  document.getElementById('network-ip').textContent = window.location.hostname;
}
document.getElementById('network-ip').textContent = window.location.hostname;

// ─── Welcome message ───
console.log('%c BlenderVR — Visor 3D Profesional ', 
  'background: linear-gradient(135deg,#7c3aed,#2563eb); color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 14px;');
console.log('%c Three.js WebGL/WebXR Viewer', 'color: #a78bfa; font-size: 12px;');
