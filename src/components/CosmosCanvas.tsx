import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CodeNode, CameraViewMode, FileCategory } from '../types/codebase';
import { soundEffects } from '../utils/soundEffects';

interface CosmosCanvasProps {
  nodes: CodeNode[];
  selectedNode: CodeNode | null;
  hoveredNode: CodeNode | null;
  activeCommitFiles: string[];
  viewMode: CameraViewMode;
  isWarpMode: boolean;
  onSelectNode: (node: CodeNode | null) => void;
  onHoverNode: (node: CodeNode | null) => void;
}

const CATEGORY_COLORS: Record<FileCategory, number> = {
  core: 0x00f3ff,     // Electric Cyan
  ui: 0xff0088,       // Neon Pink/Magenta
  utils: 0xffb700,    // Bright Gold
  api: 0xa855f7,      // Purple/Violet
  config: 0x10b981,   // Emerald Green
  assets: 0x3b82f6,   // Royal Blue
  tests: 0xf97316      // Orange
};

export const CosmosCanvas: React.FC<CosmosCanvasProps> = ({
  nodes,
  selectedNode,
  hoveredNode,
  activeCommitFiles,
  viewMode,
  isWarpMode,
  onSelectNode,
  onHoverNode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const starFieldRef = useRef<THREE.Points | null>(null);
  const laserGroupRef = useRef<THREE.Group | null>(null);

  // Target camera position for lerping
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);

  // Raycaster state
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.006);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 45, 90);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 400;
    controls.minDistance = 5;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f3ff, 2.5, 300);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    // 6. Galactic Starfield Background
    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 100 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const colorVal = Math.random();
      if (colorVal > 0.8) {
        starColors[i * 3] = 0.0; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0; // Cyan
      } else if (colorVal > 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.2; starColors[i * 3 + 2] = 0.6; // Magenta
      } else {
        starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0; // White/Blue
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    starFieldRef.current = starField;

    // 7. Grid Orbital Rings (Cosmic Radar Disk)
    const ringGeo = new THREE.RingGeometry(15, 120, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Group for laser dependency lines
    const laserGroup = new THREE.Group();
    scene.add(laserGroup);
    laserGroupRef.current = laserGroup;

    // 8. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Rotate starfield slowly
      if (starFieldRef.current) {
        starFieldRef.current.rotation.y = elapsedTime * (isWarpMode ? 0.08 : 0.005);
        if (isWarpMode) {
          starFieldRef.current.rotation.x = elapsedTime * 0.05;
        }
      }

      // Pulse nodes modified by active commit
      nodeMeshesRef.current.forEach((mesh, nodeId) => {
        const isModified = activeCommitFiles.includes(nodeId);
        if (isModified) {
          const scaleOffset = 1 + Math.sin(elapsedTime * 8) * 0.25;
          mesh.scale.set(scaleOffset, scaleOffset, scaleOffset);
          (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0055);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.0;
        } else if (hoveredNode?.id === nodeId || selectedNode?.id === nodeId) {
          const scaleOffset = 1.25 + Math.sin(elapsedTime * 4) * 0.1;
          mesh.scale.set(scaleOffset, scaleOffset, scaleOffset);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5;
        } else {
          mesh.scale.set(1, 1, 1);
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
        }
      });

      // Camera Lerp Transition
      if (targetCamPosRef.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.06);
        if (targetLookAtRef.current) {
          controlsRef.current.target.lerp(targetLookAtRef.current, 0.06);
        }
        controlsRef.current.update();

        if (cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.5) {
          targetCamPosRef.current = null;
          targetLookAtRef.current = null;
        }
      } else if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Nodes in 3D Space
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clear existing node meshes
    nodeMeshesRef.current.forEach(mesh => scene.remove(mesh));
    nodeMeshesRef.current.clear();

    nodes.forEach(node => {
      const radius = Math.max(1.8, Math.min(4.5, Math.sqrt(node.linesOfCode) / 7));
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      
      const hexColor = CATEGORY_COLORS[node.category] || 0x00f3ff;
      const material = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });

      const mesh = new THREE.Mesh(geometry, material);
      const pos = node.position || [0, 0, 0];
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.userData = { node };

      // Halo atmosphere ring around sphere
      const haloGeo = new THREE.RingGeometry(radius * 1.2, radius * 1.5, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.rotation.x = Math.PI / 3;
      mesh.add(haloMesh);

      scene.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);
    });

  }, [nodes]);

  // Update Dependency Laser Beams
  useEffect(() => {
    if (!laserGroupRef.current) return;
    const laserGroup = laserGroupRef.current;
    
    // Clear old laser lines
    while (laserGroup.children.length > 0) {
      const child = laserGroup.children[0];
      laserGroup.remove(child);
    }

    const activeTargetNode = hoveredNode || selectedNode;
    if (!activeTargetNode) return;

    const sourceMesh = nodeMeshesRef.current.get(activeTargetNode.id);
    if (!sourceMesh) return;

    const sourcePos = sourceMesh.position;

    // Render outgoing dependency lasers (Cyan)
    activeTargetNode.dependencies.forEach(depId => {
      const targetMesh = nodeMeshesRef.current.get(depId);
      if (targetMesh) {
        const laserLine = createLaserBeam(sourcePos, targetMesh.position, 0x00f3ff);
        laserGroup.add(laserLine);
      }
    });

    // Render incoming dependent lasers (Magenta)
    activeTargetNode.dependents.forEach(depId => {
      const targetMesh = nodeMeshesRef.current.get(depId);
      if (targetMesh) {
        const laserLine = createLaserBeam(targetMesh.position, sourcePos, 0xff0088);
        laserGroup.add(laserLine);
      }
    });

  }, [hoveredNode, selectedNode]);

  // Helper to draw glowing 3D laser line
  const createLaserBeam = (start: THREE.Vector3, end: THREE.Vector3, colorHex: number) => {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: colorHex,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });
    return new THREE.Line(geometry, material);
  };

  // Handle Camera View Mode Shifts
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    if (viewMode === 'galaxy') {
      targetCamPosRef.current = new THREE.Vector3(0, 45, 90);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    } else if (viewMode === 'topdown') {
      targetCamPosRef.current = new THREE.Vector3(0, 140, 0.1);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    } else if (viewMode === 'cluster') {
      targetCamPosRef.current = new THREE.Vector3(25, 20, 35);
      targetLookAtRef.current = new THREE.Vector3(0, 0, 0);
    }
  }, [viewMode]);

  // Handle Node Click & Raycasting
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(Array.from(nodeMeshesRef.current.values()));

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const node = hitMesh.userData.node as CodeNode;
      if (hoveredNode?.id !== node.id) {
        onHoverNode(node);
      }
    } else if (hoveredNode) {
      onHoverNode(null);
    }
  };

  const handlePointerDown = () => {
    if (!cameraRef.current || !sceneRef.current) return;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(Array.from(nodeMeshesRef.current.values()));

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const node = hitMesh.userData.node as CodeNode;
      onSelectNode(node);
      soundEffects.playNodeSelect();

      // Trigger Hyperspace Jump camera focusing
      const pos = hitMesh.position;
      targetCamPosRef.current = new THREE.Vector3(pos.x + 12, pos.y + 8, pos.z + 18);
      targetLookAtRef.current = pos.clone();
      soundEffects.playWarpJump();
    }
  };

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      {/* Interactive 3D Target Reticle Badge for Hovered Node */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none glass-panel p-4 rounded-xl border border-cyan-500/40 text-cyan-200 flex items-center space-x-4 animate-fade-in shadow-2xl backdrop-blur-md">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#00f3ff]"></div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-mono">TARGET LOCK</div>
            <div className="font-semibold text-lg text-white font-mono">{hoveredNode.name}</div>
            <div className="text-xs text-gray-400 flex items-center space-x-3 font-mono mt-0.5">
              <span>{hoveredNode.path}</span>
              <span className="text-cyan-400">• {hoveredNode.linesOfCode} LOC</span>
              <span className="text-emerald-400">• {hoveredNode.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
