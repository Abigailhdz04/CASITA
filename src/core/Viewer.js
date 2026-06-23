/**
 * Viewer.js — Core Three.js Scene, Renderer, Camera
 * Handles the WebGL rendering pipeline
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class Viewer {
  constructor(container) {
    this.container = container;
    this.model = null;
    this.mixer = null;  // AnimationMixer
    this.clock = new THREE.Clock();
    this.renderMode = 'realistic';
    this.autoRotate = false;
    this._callbacks = {};

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initControls();
    this._initLighting();
    this._initHelpers();
    this._initBackground();
    this._initResize();
  }

  /* ─── Renderer ─── */
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,  // needed for screenshots
      logarithmicDepthBuffer: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.physicallyCorrectLights = true;

    // Store renderer DOM element
    this.canvas = this.renderer.domElement;
    this.container.appendChild(this.canvas);
  }

  /* ─── Scene ─── */
  _initScene() {
    this.scene = new THREE.Scene();
  }

  /* ─── Camera ─── */
  _initCamera() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 10000);
    this.camera.position.set(5, 3, 5);
    this.camera.lookAt(0, 0, 0);
  }

  /* ─── OrbitControls ─── */
  _initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 5000;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.5;
  }

  /* ─── Lighting ─── */
  _initLighting() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    // Main directional light
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.dirLight.position.set(5, 10, 5);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.setScalar(2048);
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 1000;
    this.dirLight.shadow.camera.left   = -50;
    this.dirLight.shadow.camera.right  =  50;
    this.dirLight.shadow.camera.top    =  50;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // Fill light
    this.fillLight = new THREE.DirectionalLight(0x8899ff, 0.4);
    this.fillLight.position.set(-5, 2, -5);
    this.scene.add(this.fillLight);

    // Hemisphere light for sky gradient
    this.hemiLight = new THREE.HemisphereLight(0x4466aa, 0x442211, 0.3);
    this.scene.add(this.hemiLight);
  }

  /* ─── Helpers (grid, axes) ─── */
  _initHelpers() {
    // Grid
    this.gridHelper = new THREE.GridHelper(100, 100, 0x222240, 0x111130);
    this.gridHelper.material.opacity = 0.4;
    this.gridHelper.material.transparent = true;
    this.scene.add(this.gridHelper);

    // Axes
    this.axesHelper = new THREE.AxesHelper(2);
    this.scene.add(this.axesHelper);
  }

  /* ─── Background ─── */
  _initBackground() {
    this.setBackground('gradient');
  }

  /* ─── Resize handler ─── */
  _initResize() {
    const ro = new ResizeObserver(() => this._onResize());
    ro.observe(this.container);
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this._emit('resize', { w, h });
  }

  /* ─── Background types ─── */
  setBackground(type) {
    this._bgType = type;
    switch (type) {
      case 'black':
        this.scene.background = new THREE.Color(0x000000);
        this.renderer.setClearColor(0x000000, 1);
        break;
      case 'white':
        this.scene.background = new THREE.Color(0xffffff);
        this.renderer.setClearColor(0xffffff, 1);
        break;
      case 'transparent':
        this.scene.background = null;
        this.renderer.setClearColor(0x000000, 0);
        break;
      case 'gradient':
        this._setGradientBackground();
        break;
      case 'hdri':
        this._loadHDRI();
        break;
      default:
        this._setGradientBackground();
    }
  }

  _setGradientBackground() {
    // Create gradient texture
    const canvas = document.createElement('canvas');
    canvas.width = 2; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#0e0e20');
    grad.addColorStop(1, '#050510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 512);
    const tex = new THREE.CanvasTexture(canvas);
    this.scene.background = tex;
  }

  _loadHDRI() {
    new RGBELoader()
      .setPath('/hdri/')
      .load('studio.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        this.scene.environment = texture;
      }, undefined, () => {
        // Fallback if HDRI not found
        this._setGradientBackground();
      });
  }

  /* ─── Load model ─── */
  loadModel(object, options = {}) {
    // Remove previous model
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
      this.mixer = null;
    }

    this.model = object;
    this.scene.add(object);

    // Center and fit
    this._fitModel(object);

    // Setup shadows
    object.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Ensure correct color space for textures
        if (child.material?.map) {
          child.material.map.colorSpace = THREE.SRGBColorSpace;
        }
      }
    });

    // Animations
    if (options.animations?.length > 0) {
      this.mixer = new THREE.AnimationMixer(object);
      options.animations.forEach(clip => {
        this.mixer.clipAction(clip).play();
      });
    }

    this._emit('modelLoaded', { object, options });
    this.applyRenderMode(this.renderMode);
  }

  /* ─── Fit model in view ─── */
  _fitModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Center at origin
    object.position.sub(center);
    object.position.y += size.y * 0.5;  // rest on grid

    // Fit camera
    const fov = this.camera.fov * (Math.PI / 180);
    const dist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2;

    this.camera.position.set(dist * 0.6, dist * 0.4, dist * 0.6);
    this.controls.target.set(0, size.y * 0.3, 0);
    this.controls.minDistance = maxDim * 0.1;
    this.controls.maxDistance = maxDim * 20;
    this.controls.update();

    // Update shadow camera to fit model
    const shadowCam = this.dirLight.shadow.camera;
    const half = maxDim * 1.5;
    shadowCam.left = shadowCam.bottom = -half;
    shadowCam.right = shadowCam.top = half;
    shadowCam.far = maxDim * 10;
    shadowCam.updateProjectionMatrix();
    this.dirLight.position.set(maxDim * 1, maxDim * 1.5, maxDim * 1);

    // Update grid
    const gridSize = Math.max(100, maxDim * 4);
    this.gridHelper.scale.setScalar(gridSize / 100);
  }

  /* ─── Render modes ─── */
  applyRenderMode(mode) {
    this.renderMode = mode;
    if (!this.model) return;

    this.model.traverse(child => {
      if (!child.isMesh) return;
      const mat = child.userData._originalMaterial;

      switch (mode) {
        case 'realistic':
        case 'textured':
          if (mat) child.material = mat;
          child.material.wireframe = false;
          break;

        case 'solid':
          child.material = new THREE.MeshLambertMaterial({
            color: child.userData._originalColor || 0x888899,
          });
          break;

        case 'wireframe':
          child.material = new THREE.MeshBasicMaterial({
            color: 0x7c3aed,
            wireframe: true,
          });
          break;

        case 'normals':
          child.material = new THREE.MeshNormalMaterial();
          break;
      }
    });
  }

  /* ─── Quick views ─── */
  setView(view) {
    const box = this.model
      ? new THREE.Box3().setFromObject(this.model)
      : new THREE.Box3(new THREE.Vector3(-2, -2, -2), new THREE.Vector3(2, 2, 2));
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const dist = Math.max(size.x, size.y, size.z) * 1.8;

    const positions = {
      front:  [0, 0, dist],
      back:   [0, 0, -dist],
      left:   [-dist, 0, 0],
      right:  [dist, 0, 0],
      top:    [0, dist, 0.001],
      bottom: [0, -dist, 0.001],
      iso:    [dist * 0.7, dist * 0.7, dist * 0.7],
    };

    const pos = positions[view] || positions.iso;
    this.camera.position.set(center.x + pos[0], center.y + pos[1], center.z + pos[2]);
    this.controls.target.copy(center);
    this.controls.update();
  }

  resetView() {
    if (this.model) {
      this._fitModel(this.model);
    } else {
      this.camera.position.set(5, 3, 5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  /* ─── Settings ─── */
  setAmbientIntensity(v)    { this.ambientLight.intensity = v; }
  setDirectionalIntensity(v){ this.dirLight.intensity = v; }
  setExposure(v)            { this.renderer.toneMappingExposure = v; }
  setShadows(enabled)       { this.renderer.shadowMap.enabled = enabled; this.dirLight.castShadow = enabled; }
  setAutoRotate(v)          { this.controls.autoRotate = v; this.autoRotate = v; }
  setAxesVisible(v)         { this.axesHelper.visible = v; }
  setGridVisible(v)         { this.gridHelper.visible = v; }

  /* ─── Quality presets ─── */
  setQuality(level) {
    const presets = {
      low:    { pixelRatio: 0.75, shadowMap: 512,  antialias: false },
      medium: { pixelRatio: 1.0,  shadowMap: 1024, antialias: true },
      high:   { pixelRatio: Math.min(devicePixelRatio, 2), shadowMap: 2048, antialias: true },
      ultra:  { pixelRatio: Math.min(devicePixelRatio, 3), shadowMap: 4096, antialias: true },
    };
    const p = presets[level] || presets.high;
    this.renderer.setPixelRatio(p.pixelRatio);
    this.dirLight.shadow.mapSize.setScalar(p.shadowMap);
    this.dirLight.shadow.map?.dispose();
    this.dirLight.shadow.map = null;
  }

  /* ─── Model stats ─── */
  getModelStats() {
    if (!this.model) return null;
    let vertices = 0, triangles = 0, materials = new Set(), textures = new Set();

    this.model.traverse(child => {
      if (child.isMesh) {
        const geo = child.geometry;
        if (geo.attributes.position) vertices += geo.attributes.position.count;
        if (geo.index) triangles += geo.index.count / 3;
        else if (geo.attributes.position) triangles += geo.attributes.position.count / 3;

        const mat = Array.isArray(child.material) ? child.material : [child.material];
        mat.forEach(m => {
          materials.add(m.uuid);
          ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'].forEach(k => {
            if (m[k]) textures.add(m[k].uuid);
          });
        });
      }
    });

    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());

    return {
      vertices: vertices.toLocaleString(),
      triangles: Math.round(triangles).toLocaleString(),
      materials: materials.size,
      textures: textures.size,
      dimensions: `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`,
    };
  }

  /* ─── Render loop ─── */
  start() {
    this.renderer.setAnimationLoop(() => this._render());
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  _render() {
    const delta = this.clock.getDelta();

    // Animations
    if (this.mixer) this.mixer.update(delta);

    // Walk mode updates
    this._emit('tick', { delta });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this._emit('afterRender', { delta });
  }

  /* ─── Event emitter ─── */
  on(event, cb) {
    if (!this._callbacks[event]) this._callbacks[event] = [];
    this._callbacks[event].push(cb);
  }
  off(event, cb) {
    this._callbacks[event] = (this._callbacks[event] || []).filter(f => f !== cb);
  }
  _emit(event, data) {
    (this._callbacks[event] || []).forEach(cb => cb(data));
  }

  /* ─── Dispose ─── */
  dispose() {
    this.stop();
    this.renderer.dispose();
  }
}
