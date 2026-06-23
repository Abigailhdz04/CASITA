# BlenderVR — Guía Completa de Instalación y Uso

## ¿Qué es BlenderVR?

**BlenderVR** es un visor 3D profesional basado en web, similar a Sketchfab o Autodesk Viewer, que permite visualizar modelos exportados desde Blender directamente en el navegador. Compatible con **PC, celular, tablet, Smart TV y visores VR**.

---

## Requisitos Previos

### Software necesario
- **Node.js** v18 o superior → [nodejs.org](https://nodejs.org)
- **npm** v8 o superior (incluido con Node.js)
- **Navegador moderno** con soporte WebGL2:
  - Chrome 90+, Firefox 90+, Edge 90+, Safari 15+

---

## Instalación

### 1. Instalar dependencias

```bash
cd BlenderVR
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor se inicia en:
```
http://localhost:3000
```

Y también estará disponible en la IP de tu PC local para todos los dispositivos de la red.

### 3. Build para producción (opcional)

```bash
npm run build
npm run preview
```

---

## Cómo Acceder desde Diferentes Dispositivos

### Obtener la IP local de tu PC

**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" — ejemplo: `192.168.1.100`

**macOS / Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Desde Celular (Android / iPhone)
1. Conecta el celular a la **misma red WiFi** que tu PC
2. Abre el navegador del celular
3. Ingresa: `http://192.168.1.100:3000` *(reemplaza con tu IP)*

### Desde Tablet
1. Conecta a la misma red WiFi
2. Abre el navegador
3. Ingresa: `http://192.168.1.100:3000`

### Desde Smart TV (Android TV / Google TV / Samsung / LG WebOS)
1. Conecta la TV a la misma red WiFi
2. Abre el **navegador web de la TV**
3. Navega a: `http://192.168.1.100:3000`
4. Usa el **control remoto** para navegar

> **Consejo TV**: El modelo rota automáticamente en modo presentación para pantallas grandes.

### Desde Visor VR (Meta Quest, HTC Vive, etc.)
1. Conecta el visor a la misma red WiFi
2. Abre el **navegador del visor** (Meta Quest Browser, Firefox Reality, etc.)
3. Navega a: `http://192.168.1.100:3000`
4. Carga tu modelo 3D
5. Presiona el botón **"Entrar a VR"** (azul/morado en la barra superior)
6. Ponte el visor y disfruta la experiencia inmersiva

---

## Formatos Soportados

| Formato | Extensión | Soporte | Notas |
|---------|-----------|---------|-------|
| GLTF Binario | `.glb` | ✅ Completo | **Recomendado** |
| GLTF JSON | `.gltf` | ✅ Completo | **Recomendado** |
| FBX | `.fbx` | ✅ Completo | Animaciones soportadas |
| OBJ | `.obj` | ✅ Completo | Materiales básicos |
| STL | `.stl` | ✅ Completo | Sin texturas |
| PLY | `.ply` | ✅ Completo | Colores de vértice |
| Collada | `.dae` | ✅ Completo | |
| USDZ | `.usdz` | ✅ Básico | Apple AR |
| Blender | `.blend` | ⚠️ Aviso | Exportar a GLB primero |
| USD | `.usd/.usda` | ⚠️ Aviso | Exportar a GLB primero |
| Alembic | `.abc` | ⚠️ Aviso | Exportar a GLB primero |

### Exportar desde Blender a GLB (recomendado)

1. En Blender: `Archivo → Exportar → glTF 2.0 (.glb/.gltf)`
2. Configuración recomendada:
   - ✅ Materiales
   - ✅ Texturas
   - ✅ Animaciones
   - ✅ Comprimir (Draco)
   - Formato: **GLB**

---

## Interfaz de Usuario

### Barra Superior (Toolbar)

| Botón | Función |
|-------|---------|
| ☰ Menú | Abre/cierra el panel lateral |
| Auto Awesome | Modo Renderizado Realista (PBR) |
| Cuadrado | Modo Sólido |
| Grid | Modo Wireframe (malla) |
| Textura | Modo Texturizado |
| Blur | Modo Normales |
| Caminar | Recorrido Arquitectónico |
| Calidad | Selector de calidad gráfica |
| Cámara | Captura de pantalla PNG |
| Pantalla Completa | Fullscreen |
| **Entrar a VR** | Iniciar sesión WebXR |
| Luna | Alternar tema claro/oscuro |

### Panel Lateral Izquierdo

- **Cargar Modelo**: Abre selector de archivos o arrastra y suelta
- **Vistas Rápidas**: Frontal, trasera, izquierda, derecha, superior, inferior, isométrica
- **Animación**: Rotación automática, ejes, grid, sombras
- **Iluminación**: Ambiental, direccional, exposición, bloom
- **Fondo**: Degradado, negro, blanco, transparente, HDRI
- **Herramientas**: Medir distancias, capturas de pantalla
- **Compartir**: Modo presentación TV, vista espectador VR

### Panel Derecho

- **Inspector**: Nombre, tamaño, vértices, polígonos, materiales, texturas, animaciones, dimensiones
- **Escena**: Árbol jerárquico de objetos del modelo (mostrar/ocultar individual)

---

## Modos de Visualización

| Modo | Descripción |
|------|-------------|
| **Realista** | PBR completo, texturas, reflejos, iluminación |
| **Sólido** | Modelo sin texturas, color base |
| **Wireframe** | Estructura de malla |
| **Texturizado** | Texturas sin iluminación avanzada |
| **Normales** | Visualización de normales de superficie |
| **Recorrido** | Primera persona, WASD para moverse |

---

## Recorrido Arquitectónico (Walk Mode)

Ideal para casas y edificios creados en Blender.

### Controles de teclado:
| Tecla | Acción |
|-------|--------|
| `W` / `↑` | Avanzar |
| `S` / `↓` | Retroceder |
| `A` / `←` | Mover izquierda |
| `D` / `→` | Mover derecha |
| `Q` / `RePág` | Subir |
| `E` / `AvPág` | Bajar |
| `Espacio` | Saltar |
| `Mouse` | Mirar alrededor (click para capturar) |
| `Esc` | Salir del recorrido |

---

## Realidad Virtual (WebXR)

### Visores soportados:
- Meta Quest 2, 3, Pro
- HTC Vive / Vive Pro
- Valve Index
- Pico VR
- Cualquier visor compatible con WebXR

### Funciones VR:
- **Escala real** del modelo
- **Recorrido libre** dentro del modelo
- **Teletransporte** con controladores
- **Interacción** con objetos
- **Vista espectador** para TV

### Pasos para VR:
1. Carga tu modelo 3D
2. Conecta el visor a la misma red WiFi
3. Abre el navegador del visor: `http://[IP_PC]:3000`
4. Presiona **"Entrar a VR"**
5. Usa los controladores para teletransportarte

---

## Control Remoto (Smart TV)

| Tecla | Acción |
|-------|--------|
| ← → ↑ ↓ | Navegar interfaz |
| OK / Enter | Confirmar/clic |
| Return | Volver |
| Reproductor ▶ | Iniciar rotación automática |
| Pausa ⏸ | Detener rotación |

---

## Herramientas

### Medición de Distancias
1. Haz clic en **"Medir Distancias"** en el panel lateral
2. Haz clic en el **primer punto** del modelo
3. Haz clic en el **segundo punto**
4. La distancia se muestra en metros

### Captura de Pantalla
- **PNG**: Máxima calidad, transparencia soportada
- **JPG**: Menor tamaño de archivo
- Las capturas se guardan automáticamente en tu carpeta de Descargas

---

## Presets de Calidad Gráfica

| Preset | Sombras | Antialiasing | Mejor para |
|--------|---------|--------------|------------|
| Baja | 512px | No | Móviles lentos, Smart TV |
| Media | 1024px | Sí | Tablets, PCs medios |
| **Alta** | 2048px | Sí | PCs modernos (defecto) |
| Ultra | 4096px | Sí | PCs potentes con GPU dedicada |

---

## Solución de Problemas

### El modelo no carga
- Verifica que el archivo no esté dañado
- Para `.blend`: exporta primero a `.glb` desde Blender
- Archivos muy grandes (>500MB) pueden tardar varios minutos

### No puedo acceder desde el celular
- Asegúrate que PC y celular estén en la **misma red WiFi**
- Verifica que el firewall de tu PC no bloquee el puerto 3000
- En macOS: Preferencias del Sistema → Seguridad → Firewall → Permitir `node`

### El botón VR no aparece
- Tu navegador no soporta WebXR
- Usa Chrome en PC + [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/) para pruebas
- En Quest: usa el **Meta Quest Browser** o **Wolvic**

### FPS bajos
- Reduce la calidad en el selector de la barra superior
- En Smart TV: usa preset **Baja** o **Media**
- Desactiva sombras desde el panel lateral

---

## Estructura del Proyecto

```
BlenderVR/
├── index.html          # Interfaz HTML principal
├── package.json        # Dependencias npm
├── vite.config.js      # Configuración del servidor
├── public/
│   ├── hdri/           # Mapas HDRI para iluminación
│   └── draco/          # Decodificador Draco (auto-copiado)
└── src/
    ├── main.js         # Punto de entrada
    ├── style.css       # Estilos premium
    ├── core/
    │   └── Viewer.js   # Motor 3D Three.js
    ├── loaders/
    │   └── ModelLoader.js  # Cargadores de formatos
    ├── ui/
    │   ├── UIController.js  # Controlador de interfaz
    │   └── Notifications.js # Sistema de notificaciones
    ├── modes/
    │   └── WalkMode.js  # Recorrido arquitectónico
    ├── xr/
    │   └── VRManager.js # Gestión WebXR/VR
    ├── tools/
    │   ├── Stats.js     # Monitor FPS/GPU
    │   ├── Screenshot.js # Capturas de pantalla
    │   ├── Measure.js   # Medición de distancias
    │   └── GizmoHelper.js # Gizmo de orientación
    └── utils/
        └── DeviceDetect.js # Detección de dispositivo
```

---

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Three.js | ^0.176 | Motor 3D WebGL |
| Vite | ^5.4 | Servidor y bundler |
| WebGL 2.0 | — | Renderizado GPU |
| WebXR | — | Realidad Virtual |
| GLTFLoader | Three.js | Modelos GLB/GLTF |
| FBXLoader | Three.js | Modelos FBX |
| DRACOLoader | Three.js | Compresión Draco |
| OrbitControls | Three.js | Navegación 3D |
| PointerLockControls | Three.js | Primera persona |

---

*BlenderVR v1.0 — Desarrollado con Three.js, WebGL y WebXR*
