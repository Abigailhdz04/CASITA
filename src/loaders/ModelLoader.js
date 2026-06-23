/**
 * ModelLoader.js — Unified multi-format 3D model loader
 * Supports: GLB, GLTF, FBX, OBJ, STL, PLY, DAE, USDZ
 */

import * as THREE from 'three';
import { GLTFLoader }    from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader }   from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader }     from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader }     from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader }     from 'three/examples/jsm/loaders/MTLLoader.js';
import { STLLoader }     from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader }     from 'three/examples/jsm/loaders/PLYLoader.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { showToast } from '../ui/Notifications.js';

// Formats that need export advice
const UNSUPPORTED = new Set(['.blend', '.usd', '.usda', '.abc', '.3ds', '.max', '.ma', '.mb']);
const NOTICE_FORMATS = {
  '.blend': 'Blender nativo: Exporta a GLB o GLTF desde Blender para visualizar.',
  '.usd':   'USD: Exporta a USDZ o GLB para máxima compatibilidad.',
  '.usda':  'USD ASCII: Exporta a USDZ o GLB para mejor soporte.',
  '.abc':   'Alembic: Exporta a GLB/GLTF para visualización web.',
  '.3ds':   '3DS Max: Exporta a GLB o FBX para mejores resultados.',
};

export class ModelLoader {
  constructor(viewer) {
    this.viewer = viewer;
    this._setupLoaders();
  }

  _setupLoaders() {
    // DRACO decoder
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.dracoLoader.preload();

    // GLTF/GLB
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Other loaders
    this.fbxLoader  = new FBXLoader();
    this.objLoader  = new OBJLoader();
    this.mtlLoader  = new MTLLoader();
    this.stlLoader  = new STLLoader();
    this.plyLoader  = new PLYLoader();
    this.daeLoader  = new ColladaLoader();
  }

  /**
   * Load from a File object (drag-drop or file picker)
   */
  async loadFile(file, onProgress) {
    const ext = ('.' + file.name.split('.').pop()).toLowerCase();
    const fileName = file.name;

    // Check for unsupported/advisory formats
    if (UNSUPPORTED.has(ext)) {
      const msg = NOTICE_FORMATS[ext] || `El formato ${ext} no está soportado directamente.`;
      this._showFormatNotice(msg, fileName);
      return;
    }

    // Show loading overlay
    this._setLoading(true, `Cargando ${fileName}...`);

    try {
      const url = URL.createObjectURL(file);
      let result;

      switch (ext) {
        case '.glb':
        case '.gltf':
        case '.usdz':
          result = await this._loadGLTF(url, onProgress);
          break;
        case '.fbx':
          result = await this._loadFBX(url, onProgress);
          break;
        case '.obj':
          result = await this._loadOBJ(url, file, onProgress);
          break;
        case '.stl':
          result = await this._loadSTL(url, onProgress);
          break;
        case '.ply':
          result = await this._loadPLY(url, onProgress);
          break;
        case '.dae':
          result = await this._loadDAE(url, onProgress);
          break;
        default:
          throw new Error(`Formato ${ext} no reconocido`);
      }

      URL.revokeObjectURL(url);

      // Store original materials on each mesh
      result.object.traverse(child => {
        if (child.isMesh) {
          child.userData._originalMaterial = Array.isArray(child.material)
            ? child.material.map(m => m.clone())
            : child.material.clone();
          child.userData._originalColor = child.material?.color?.getHex?.() ?? 0x888899;
        }
      });

      this.viewer.loadModel(result.object, {
        animations: result.animations || [],
        format: ext,
        fileName,
        fileSize: file.size,
      });

      this._setLoading(false);
      showToast(`✓ Modelo cargado: ${fileName}`, 'success');

      return result;
    } catch (err) {
      this._setLoading(false);
      console.error('[ModelLoader] Error:', err);
      showToast(`Error al cargar: ${err.message}`, 'error');
      throw err;
    }
  }

  /**
   * Load from a URL (e.g. default models)
   */
  async loadFromUrl(url, fileName, fileSize = 0, onProgress) {
    const ext = ('.' + fileName.split('.').pop()).toLowerCase();

    // Check for unsupported/advisory formats
    if (UNSUPPORTED.has(ext)) {
      const msg = NOTICE_FORMATS[ext] || `El formato ${ext} no está soportado directamente.`;
      this._showFormatNotice(msg, fileName);
      return;
    }

    // Show loading overlay
    this._setLoading(true, `Cargando ${fileName}...`);

    try {
      let result;

      switch (ext) {
        case '.glb':
        case '.gltf':
        case '.usdz':
          result = await this._loadGLTF(url, onProgress);
          break;
        case '.fbx':
          result = await this._loadFBX(url, onProgress);
          break;
        case '.obj':
          result = await this._loadOBJ(url, null, onProgress);
          break;
        case '.stl':
          result = await this._loadSTL(url, onProgress);
          break;
        case '.ply':
          result = await this._loadPLY(url, onProgress);
          break;
        case '.dae':
          result = await this._loadDAE(url, onProgress);
          break;
        default:
          throw new Error(`Formato ${ext} no reconocido`);
      }

      // Store original materials on each mesh
      result.object.traverse(child => {
        if (child.isMesh) {
          child.userData._originalMaterial = Array.isArray(child.material)
            ? child.material.map(m => m.clone())
            : child.material.clone();
          child.userData._originalColor = child.material?.color?.getHex?.() ?? 0x888899;
        }
      });

      this.viewer.loadModel(result.object, {
        animations: result.animations || [],
        format: ext,
        fileName,
        fileSize,
      });

      this._setLoading(false);
      showToast(`✓ Modelo cargado: ${fileName}`, 'success');

      return result;
    } catch (err) {
      this._setLoading(false);
      console.error('[ModelLoader] Error loading from URL:', err);
      showToast(`Error al cargar: ${err.message}`, 'error');
      throw err;
    }
  }

  /* ─── Individual loaders ─── */

  _loadGLTF(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, gltf => {
        resolve({ object: gltf.scene, animations: gltf.animations });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  _loadFBX(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(url, obj => {
        // Normalize FBX scale (often 100x too large)
        obj.scale.setScalar(0.01);
        resolve({ object: obj, animations: obj.animations });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  _loadOBJ(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      // OBJ with default material
      this.objLoader.load(url, obj => {
        // Apply default PBR material if none present
        obj.traverse(child => {
          if (child.isMesh && !child.material?.name) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x9999aa,
              roughness: 0.7,
              metalness: 0.1,
            });
          }
        });
        resolve({ object: obj, animations: [] });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  _loadSTL(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(url, geometry => {
        geometry.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({
          color: 0x6688aa,
          roughness: 0.5,
          metalness: 0.2,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        const group = new THREE.Group();
        group.add(mesh);
        resolve({ object: group, animations: [] });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  _loadPLY(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.plyLoader.load(url, geometry => {
        geometry.computeVertexNormals();
        const hasColor = !!geometry.attributes.color;
        const mat = new THREE.MeshStandardMaterial({
          vertexColors: hasColor,
          color: hasColor ? 0xffffff : 0x8899aa,
          roughness: 0.6,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, mat);
        const group = new THREE.Group();
        group.add(mesh);
        resolve({ object: group, animations: [] });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  _loadDAE(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.daeLoader.load(url, collada => {
        resolve({ object: collada.scene, animations: [] });
      }, e => { if (onProgress) onProgress(e); this._updateProgress(e); }, reject);
    });
  }

  /* ─── UI helpers ─── */

  _updateProgress(event) {
    if (!event.total) return;
    const pct = Math.round((event.loaded / event.total) * 100);
    const fill = document.getElementById('progress-fill');
    const pctEl = document.getElementById('progress-percent');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }

  _setLoading(visible, text = 'Cargando...') {
    const overlay = document.getElementById('loading-overlay');
    const textEl  = document.getElementById('loading-text');
    const fill    = document.getElementById('progress-fill');
    const welcome = document.getElementById('welcome-screen');

    if (visible) {
      overlay?.classList.remove('hidden');
      if (textEl) textEl.textContent = text;
      if (fill) fill.style.width = '0%';
    } else {
      overlay?.classList.add('hidden');
      if (fill) fill.style.width = '100%';
    }

    if (!visible && welcome) welcome.classList.add('hidden');
  }

  _showFormatNotice(message, fileName) {
    showToast(`⚠ ${fileName}: ${message}`, 'warning', 8000);

    // Show notice in viewport
    const viewport = document.getElementById('viewport');
    const existing = viewport?.querySelector('.format-notice');
    if (existing) existing.remove();

    const notice = document.createElement('div');
    notice.className = 'format-notice';
    notice.innerHTML = `
      <span class="material-icons-round">warning</span>
      <div>
        <strong>${fileName}</strong><br>
        ${message}<br>
        <em>Formatos recomendados: .glb · .gltf</em>
      </div>
    `;
    viewport?.appendChild(notice);
    setTimeout(() => notice.remove(), 10000);
  }
}
