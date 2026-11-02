import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { cn } from '../../lib/utils';
import { formatBytes } from '../../utils/formatters';

function loadModel(url, ext, onProgress) {
  return new Promise((resolve, reject) => {
    const done = (result) => {
      if (result.isBufferGeometry) {
        resolve(new THREE.Mesh(result));
      } else {
        resolve(result);
      }
    };
    const loader = ext === '3mf' ? new ThreeMFLoader() : ext === 'obj' ? new OBJLoader() : new STLLoader();
    loader.load(url, done, onProgress, reject);
  });
}

// Volume pela soma de tetraedros com sinal: funciona em malha fechada, unidades do arquivo (mm)
function meshVolume(root) {
  let volume = 0;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  root.traverse((object) => {
    if (!object.isMesh) return;
    const position = object.geometry.attributes.position;
    const index = object.geometry.index;
    const count = index ? index.count : position.count;
    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      a.fromBufferAttribute(position, ia).applyMatrix4(object.matrixWorld);
      b.fromBufferAttribute(position, ib).applyMatrix4(object.matrixWorld);
      c.fromBufferAttribute(position, ic).applyMatrix4(object.matrixWorld);
      volume += a.dot(b.cross(c)) / 6;
    }
  });
  return Math.abs(volume);
}

function createMaterial(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide });
}

function createShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,0.45)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export default function ModelViewer({ url, ext = 'stl', color = '#FF5A1F', autoRotate = true, onStats, className }) {
  const containerRef = useRef(null);
  const materialRef = useRef(null);
  const statsRef = useRef(onStats);
  statsRef.current = onStats;
  const [state, setState] = useState({ status: 'loading', loaded: 0, total: 0, error: null });

  useEffect(() => {
    materialRef.current?.color.set(color);
  }, [color]);

  useEffect(() => {
    const container = containerRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setState({ status: 'error', error: 'Este navegador não consegue mostrar 3D.' });
      return undefined;
    }
    let disposed = false;
    let frame = null;
    setState({ status: 'loading', loaded: 0, total: 0, error: null });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.autoRotate = autoRotate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
    });

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6e75, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    const rim = new THREE.DirectionalLight(0xdce3ff, 1.2);
    scene.add(key, rim);

    const material = createMaterial(color);
    materialRef.current = material;
    const shadowTexture = createShadowTexture();

    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && frame === null) render();
      else if (!entry.isIntersecting && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    });

    loadModel(url, ext, (event) => {
      if (!disposed) setState((prev) => ({ ...prev, loaded: event.loaded, total: event.total || prev.total }));
    })
      .then((object) => {
        if (disposed) return;
        object.traverse((child) => {
          if (child.isMesh) {
            if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
            child.material = material;
          }
        });
        // STL e 3MF vêm com Z para cima; a cena usa Y para cima
        if (ext !== 'obj') object.rotation.x = -Math.PI / 2;

        const holder = new THREE.Group();
        holder.add(object);
        holder.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(holder);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        holder.position.set(-center.x, -box.min.y, -center.z);
        holder.updateMatrixWorld(true);
        scene.add(holder);

        const footprint = Math.max(size.x, size.z);
        const radius = size.length() / 2;

        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(footprint * 1.6, footprint * 1.6),
          new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        // A grade usa a cor do texto do fundo onde o visualizador está (claro ou escuro)
        const gridColor = new THREE.Color(getComputedStyle(container).color);
        const grid = new THREE.GridHelper(footprint * 2.4, 12, gridColor, gridColor);
        grid.material.transparent = true;
        grid.material.opacity = 0.18;
        scene.add(shadow, grid);

        const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.05;
        camera.near = distance / 100;
        camera.far = distance * 20;
        camera.position.set(distance * 0.55, size.y * 0.5 + distance * 0.45, distance * 0.7);
        controls.target.set(0, size.y * 0.45, 0);
        controls.minDistance = radius * 0.8;
        controls.maxDistance = distance * 3;
        camera.updateProjectionMatrix();
        key.position.set(distance, distance * 1.5, distance);
        rim.position.set(-distance, distance * 0.6, -distance);

        statsRef.current?.({
          largura: size.x,
          profundidade: size.z,
          altura: size.y,
          volume: meshVolume(holder) / 1000,
        });
        setState({ status: 'ready', error: null });
        visibility.observe(container);
      })
      .catch((error) => {
        if (disposed) return;
        console.error('Erro ao abrir modelo 3D:', error);
        setState({ status: 'error', error: 'Não foi possível abrir este arquivo.' });
      });

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      visibility.disconnect();
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        [].concat(object.material || []).forEach((m) => m.dispose());
      });
      shadowTexture.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [url, ext, autoRotate]);

  const pct = state.total ? Math.round((state.loaded / state.total) * 100) : null;

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className="absolute inset-0 touch-none [&>canvas]:h-full [&>canvas]:w-full" />
      {state.status === 'loading' && (
        <div className={cn('absolute inset-0 flex flex-col items-center justify-center gap-3')}>
          <p className="font-serif text-lg italic opacity-80">
            Baixando modelo{pct !== null ? `… ${pct}%` : state.loaded ? `… ${formatBytes(state.loaded)}` : '…'}
          </p>
          <div className="relative h-1 w-48 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-current opacity-25" />
            <div className="absolute inset-y-0 left-0 bg-current transition-[width]" style={{ width: `${pct ?? 15}%` }} />
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div className={cn('absolute inset-0 flex items-center justify-center p-6 text-center font-serif text-lg')}>
          {state.error}
        </div>
      )}
    </div>
  );
}
