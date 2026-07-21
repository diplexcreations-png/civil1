import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateBricksList, BrickOpening } from '../utils/calcEngine';
import { 
  Layers, Eye, Compass, Grid, Play, Pause, 
  RotateCcw, Download, Share2, Clipboard, History, Info
} from 'lucide-react';

interface BrickEstimator3DProps {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  unitSystem: 'metric' | 'imperial';
  onLoadInputs?: (savedInputs: Record<string, any>) => void;
}

export default function BrickEstimator3D({ 
  inputs, 
  outputs, 
  unitSystem,
  onLoadInputs
}: BrickEstimator3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  
  // Secondary canvas for Compare mode
  const canvasCompareRef = useRef<HTMLCanvasElement>(null);
  
  // Drafting canvas for 2D views
  const canvas2DRef = useRef<HTMLCanvasElement>(null);

  // View tabs: '3d' | 'elevation' | 'plan' | 'section' | 'compare' | 'gallery' | 'history'
  const [activeTab, setActiveTab] = useState<'3d' | 'elevation' | 'plan' | 'section' | 'compare' | 'gallery' | 'history'>('3d');
  
  // Interactive Controls
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [xrayOpacity, setXrayOpacity] = useState<number>(1.0); // 0.2 to 1.0
  const [showNumbering, setShowNumbering] = useState<boolean>(false);
  const [showMortarJoints, setShowMortarJoints] = useState<boolean>(true);
  const [constructionProgress, setConstructionProgress] = useState<number>(100); // 0% to 100%
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Compare State
  const [compareBond, setCompareBond] = useState<string>('english');
  
  // History list
  const [historyList, setHistoryList] = useState<Array<{ id: string; date: string; name: string; inputs: Record<string, any> }>>([]);
  const [historyName, setHistoryName] = useState<string>('');
  
  // Three.js instances
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const mortarMeshRef = useRef<THREE.Mesh | null>(null);
  
  // Compare Three.js instances
  const rendererCompRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneCompRef = useRef<THREE.Scene | null>(null);
  const cameraCompRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsCompRef = useRef<OrbitControls | null>(null);
  const instancedMeshCompRef = useRef<THREE.InstancedMesh | null>(null);
  const mortarMeshCompRef = useRef<THREE.Mesh | null>(null);

  // Initialize and maintain History from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('civilmath_brick_history');
    if (stored) {
      try {
        setHistoryList(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = () => {
    const name = historyName.trim() || `Estimate - ${new Date().toLocaleTimeString()}`;
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString(),
      name,
      inputs: { ...inputs }
    };
    const updated = [newItem, ...historyList].slice(0, 20); // cap at 20 items
    setHistoryList(updated);
    localStorage.setItem('civilmath_brick_history', JSON.stringify(updated));
    setHistoryName('');
  };

  const deleteHistoryItem = (id: string) => {
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem('civilmath_brick_history', JSON.stringify(updated));
  };

  // Build Shareable Link
  const handleShareLink = () => {
    try {
      const dataStr = JSON.stringify(inputs);
      const b64 = btoa(dataStr);
      const url = `${window.location.origin}${window.location.pathname}?brick_data=${b64}`;
      navigator.clipboard.writeText(url);
      alert('Estimation link copied to clipboard! Anyone opening this link will load these inputs.');
    } catch (e) {
      console.error(e);
    }
  };

  // Construction Layer Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setConstructionProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return Math.min(100, prev + 2);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Main Three.js Scene Setup (Primary WebGL)
  useEffect(() => {
    if (activeTab !== '3d' && activeTab !== 'compare') return;
    const canvas = canvas3DRef.current;
    if (!canvas) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1329'); // dark premium background
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(5, 4, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent going underground
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor Grid Helper
    const gridHelper = new THREE.GridHelper(12, 24, '#3b82f6', '#1e293b');
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Rebuild logic
    rebuild3DScene(scene, inputs, outputs, false);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (!width || !height) continue;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [activeTab, inputs, outputs, showWireframe, xrayOpacity, showMortarJoints, constructionProgress]);

  // Secondary Three.js Scene Setup (Comparison WebGL)
  useEffect(() => {
    if (activeTab !== 'compare') return;
    const canvasComp = canvasCompareRef.current;
    if (!canvasComp) return;

    // Create scene
    const sceneComp = new THREE.Scene();
    sceneComp.background = new THREE.Color('#0c152b');
    sceneCompRef.current = sceneComp;

    // Create camera
    const cameraComp = new THREE.PerspectiveCamera(45, canvasComp.clientWidth / canvasComp.clientHeight, 0.1, 100);
    cameraComp.position.set(5, 4, 6);
    cameraCompRef.current = cameraComp;

    // Renderer
    const rendererComp = new THREE.WebGLRenderer({ canvas: canvasComp, antialias: true });
    rendererComp.setSize(canvasComp.clientWidth, canvasComp.clientHeight);
    rendererComp.setPixelRatio(window.devicePixelRatio);
    rendererCompRef.current = rendererComp;

    // Controls
    const controlsComp = new OrbitControls(cameraComp, rendererComp.domElement);
    controlsComp.enableDamping = true;
    controlsComp.dampingFactor = 0.05;
    controlsComp.maxPolarAngle = Math.PI / 2 - 0.05;
    controlsCompRef.current = controlsComp;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    sceneComp.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 15, 10);
    sceneComp.add(dirLight);

    const gridHelper = new THREE.GridHelper(12, 24, '#10b981', '#1e293b');
    sceneComp.add(gridHelper);

    // Rebuild with comparison bond inputs
    const compareInputs = { ...inputs, bondType: compareBond };
    const compareOutputs = { ...outputs }; // simulated details
    rebuild3DScene(sceneComp, compareInputs, compareOutputs, true);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controlsComp.update();
      rendererComp.render(sceneComp, cameraComp);
    };
    animate();

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (!width || !height) continue;
        cameraComp.aspect = width / height;
        cameraComp.updateProjectionMatrix();
        rendererComp.setSize(width, height);
      }
    });
    if (canvasComp.parentElement) {
      resizeObserver.observe(canvasComp.parentElement);
    }

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      rendererComp.dispose();
    };
  }, [activeTab, compareBond, inputs, showWireframe, xrayOpacity, showMortarJoints, constructionProgress]);

  // Rebuild 3D Geometry
  const rebuild3DScene = (
    scene: THREE.Scene, 
    inps: Record<string, any>, 
    outs: Record<string, any>,
    isCompare: boolean
  ) => {
    // 1. Remove existing meshes
    const oldMesh = scene.getObjectByName('bricksMesh');
    if (oldMesh) scene.remove(oldMesh);
    const oldMortar = scene.getObjectByName('mortarMesh');
    if (oldMortar) scene.remove(oldMortar);
    const oldOpenings = scene.getObjectByName('openingsVisuals');
    if (oldOpenings) scene.remove(oldOpenings);

    // Dimensions conversions
    const isM = unitSystem === 'metric';
    const wallL = Number(inps.wallLength) || 0.1;
    const wallH = Number(inps.wallHeight) || 0.1;
    const wallT = isM ? (Number(inps.wallThickness) || 110) / 1000 : (Number(inps.wallThickness) || 4) / 12;
    const brickL = isM ? (Number(inps.brickLength) || 230) / 1000 : (Number(inps.brickLength) || 9) / 12;
    const brickW = isM ? (Number(inps.brickWidth) || 110) / 1000 : (Number(inps.brickWidth) || 4) / 12;
    const brickH = isM ? (Number(inps.brickHeight) || 76) / 1000 : (Number(inps.brickHeight) || 3) / 12;
    const joint = isM ? (Number(inps.mortarJoint) || 10) / 1000 : (Number(inps.mortarJoint) || 0.375) / 12;
    const bond = inps.bondType || 'stretcher';
    const ops: BrickOpening[] = inps.openings || [];

    // 2. Generate placements
    const { bricks } = generateBricksList(wallL, wallH, wallT, brickL, brickW, brickH, joint, bond, ops);

    // Filter by construction progress (layer-by-layer slider)
    const maxVisibleHeight = (constructionProgress / 100) * wallH;
    const visibleBricks = bricks.filter(b => b.y <= maxVisibleHeight);

    if (visibleBricks.length === 0) return;

    // 3. Create InstancedMesh
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    
    // Material with styling parameters
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0.1,
      transparent: xrayOpacity < 1.0,
      opacity: xrayOpacity,
      wireframe: showWireframe
    });

    const instMesh = new THREE.InstancedMesh(geometry, material, visibleBricks.length);
    instMesh.name = 'bricksMesh';
    instMesh.castShadow = true;
    instMesh.receiveShadow = true;

    const colorStretcher = new THREE.Color(bond === 'facing' ? '#f43f5e' : '#ea580c');
    const colorHeader = new THREE.Color('#9a3412');

    const dummy = new THREE.Object3D();
    visibleBricks.forEach((b, index) => {
      const posX = b.x + b.w / 2 - wallL / 2;
      const posY = b.y + b.h / 2;
      const posZ = b.z + b.d / 2 - wallT / 2;

      dummy.position.set(posX, posY, posZ);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      
      instMesh.setMatrixAt(index, dummy.matrix);

      let color = b.isHeader ? colorHeader : colorStretcher;
      instMesh.setColorAt(index, color);
    });

    instMesh.instanceMatrix.needsUpdate = true;
    if (instMesh.instanceColor) {
      instMesh.instanceColor.needsUpdate = true;
    }
    scene.add(instMesh);

    // 4. Render Mortar Bedding visual (if enabled)
    if (showMortarJoints && xrayOpacity > 0.4) {
      const mortarGeo = new THREE.BoxGeometry(wallL, maxVisibleHeight, wallT - 0.005);
      const mortarMat = new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.9,
        transparent: true,
        opacity: 0.7,
        wireframe: showWireframe
      });
      const mortarMesh = new THREE.Mesh(mortarGeo, mortarMat);
      mortarMesh.name = 'mortarMesh';
      mortarMesh.position.set(0, maxVisibleHeight / 2, 0);
      scene.add(mortarMesh);
    }

    // 5. Draw Openings bounding outlines (Blue = opening)
    if (ops.length > 0) {
      const openingsGroup = new THREE.Group();
      openingsGroup.name = 'openingsVisuals';
      
      ops.forEach(op => {
        const opW = Number(op.length) || 0.1;
        const opH = Number(op.height) || 0.1;
        const opX = Number(op.x) || 0;
        const opY = Number(op.y) || 0;

        const boxGeo = new THREE.BoxGeometry(opW, opH, wallT + 0.02);
        const edges = new THREE.EdgesGeometry(boxGeo);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#0ea5e9', linewidth: 2 }));
        
        const posX = opX + opW / 2 - wallL / 2;
        const posY = opY + opH / 2;
        line.position.set(posX, posY, 0);
        openingsGroup.add(line);
      });
      scene.add(openingsGroup);
    }
  };

  // Render 2D Engineering Drawings (Elevation, Plan, Section)
  useEffect(() => {
    if (activeTab === '3d' || activeTab === 'compare' || activeTab === 'gallery' || activeTab === 'history') return;
    const canvas = canvas2DRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const isM = unitSystem === 'metric';
    const wallL = Number(inputs.wallLength) || 5;
    const wallH = Number(inputs.wallHeight) || 3;
    const wallT = isM ? (Number(inputs.wallThickness) || 110) / 1000 : (Number(inputs.wallThickness) || 4) / 12;
    const brickL = isM ? (Number(inputs.brickLength) || 230) / 1000 : (Number(inputs.brickLength) || 9) / 12;
    const brickW = isM ? (Number(inputs.brickWidth) || 110) / 1000 : (Number(inputs.brickWidth) || 4) / 12;
    const brickH = isM ? (Number(inputs.brickHeight) || 76) / 1000 : (Number(inputs.brickHeight) || 3) / 12;
    const joint = isM ? (Number(inputs.mortarJoint) || 10) / 1000 : (Number(inputs.mortarJoint) || 0.375) / 12;
    const bond = inputs.bondType || 'stretcher';
    const ops: BrickOpening[] = inputs.openings || [];

    const { bricks } = generateBricksList(wallL, wallH, wallT, brickL, brickW, brickH, joint, bond, ops);

    const margin = 50;
    const drawW = w - 2 * margin;
    const drawH = h - 2 * margin;

    if (activeTab === 'elevation') {
      const scaleX = drawW / wallL;
      const scaleY = drawH / wallH;
      const scale = Math.min(scaleX, scaleY);

      const cx = (w - wallL * scale) / 2;
      const cy = h - (h - wallH * scale) / 2;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, cy);
      ctx.lineTo(w - 10, cy);
      ctx.stroke();

      bricks.forEach((b, idx) => {
        if (b.z > 0.01) return;
        
        const bx = cx + b.x * scale;
        const by = cy - (b.y + b.h) * scale;
        const bw = b.w * scale;
        const bh = b.h * scale;

        ctx.fillStyle = b.isHeader ? '#9a3412' : '#ea580c';
        ctx.fillRect(bx, by, bw - 0.5, bh - 0.5);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, by, bw - 0.5, bh - 0.5);

        if (showNumbering && bw > 14) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = '7px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((idx + 1).toString(), bx + bw / 2, by + bh / 2);
        }
      });

      ops.forEach(op => {
        const ox = cx + op.x * scale;
        const oy = cy - (op.y + op.height) * scale;
        const ow = op.length * scale;
        const oh = op.height * scale;

        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.fillRect(ox, oy, ow, oh);
        ctx.strokeRect(ox, oy, ow, oh);

        ctx.fillStyle = '#0ea5e9';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(op.type.toUpperCase(), ox + ow / 2, oy + oh / 2);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`FRONT ELEVATION VIEW (Scale 1:${Math.round(100/scale)})`, 16, 25);
      ctx.fillText(`Net Bricks: ${outputs.netBricksCount ?? 0} units`, 16, 40);
    } 
    else if (activeTab === 'plan') {
      const scaleX = drawW / wallL;
      const scaleY = drawH / (wallT * 6);
      const scale = Math.min(scaleX, scaleY);

      const cx = (w - wallL * scale) / 2;
      const cy = h / 2;

      ctx.fillStyle = '#334155';
      ctx.fillRect(cx, cy - (wallT/2)*scale, wallL * scale, wallT * scale);

      bricks.forEach(b => {
        if (b.y > 0.05) return;
        
        const bx = cx + b.x * scale;
        const bz = cy - (wallT/2)*scale + b.z * scale;
        const bw = b.w * scale;
        const bd = b.d * scale;

        ctx.fillStyle = b.isHeader ? '#9a3412' : '#ea580c';
        ctx.fillRect(bx, bz, bw - 0.5, bd - 0.5);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bx, bz, bw - 0.5, bd - 0.5);
      });

      ops.forEach(op => {
        const ox = cx + op.x * scale;
        const ow = op.length * scale;
        ctx.clearRect(ox, cy - (wallT/2)*scale - 5, ow, wallT * scale + 10);
        ctx.strokeStyle = '#0ea5e9';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ox, cy - (wallT/2)*scale, ow, wallT * scale);
        ctx.setLineDash([]);
      });

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`TOP PLAN VIEW - COURSE 1 (Exaggerated thickness)`, 16, 25);
    } 
    else if (activeTab === 'section') {
      const scaleX = drawW / (wallT * 6);
      const scaleY = drawH / wallH;
      const scale = Math.min(scaleX, scaleY);

      const cx = w / 2;
      const cy = h - (h - wallH * scale) / 2;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy);
      ctx.lineTo(cx + 100, cy);
      ctx.stroke();

      const targetX = wallL / 2;
      bricks.forEach(b => {
        if (b.x <= targetX && (b.x + b.w) >= targetX) {
          const bz = cx - (wallT/2)*scale + b.z * scale;
          const by = cy - (b.y + b.h) * scale;
          const bd = b.d * scale;
          const bh = b.h * scale;

          ctx.fillStyle = b.isHeader ? '#9a3412' : '#ea580c';
          ctx.fillRect(bz, by, bd - 0.5, bh - 0.5);

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(bz, by, bd - 0.5, bh - 0.5);
        }
      });

      if (bond === 'rat-trap') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOLLOW CAVITY', cx, cy - (wallH * scale) / 2);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`CROSS SECTION VIEW (at middle of wall length)`, 16, 25);
    }
  }, [activeTab, inputs, outputs, showNumbering, showMortarJoints, constructionProgress]);

  const handleExportPNG = () => {
    let canvas: HTMLCanvasElement | null = null;
    if (activeTab === '3d') canvas = canvas3DRef.current;
    else if (activeTab === 'compare') canvas = canvas3DRef.current;
    else canvas = canvas2DRef.current;

    if (!canvas) return;

    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `CivilMath-BrickWall-${activeTab}-${Date.now()}.png`;
      a.click();
    } catch (e) {
      alert('Failed to export preview.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* TABS HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2 gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === '3d' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            3D VIEW
          </button>
          <button 
            onClick={() => setActiveTab('elevation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'elevation' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            ELEVATION
          </button>
          <button 
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'plan' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            PLAN
          </button>
          <button 
            onClick={() => setActiveTab('section')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'section' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            SECTION
          </button>
          <button 
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'compare' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            COMPARE
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'gallery' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            GALLERY
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-250 ${activeTab === 'history' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-450 hover:text-slate-200'}`}
          >
            <span className="flex items-center space-x-1">
              <History className="w-3.5 h-3.5" />
              <span>HISTORY</span>
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleShareLink} 
            title="Generate Shareable URL Link"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExportPNG} 
            title="Export Current View as PNG"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RENDER VIEW AREA */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden min-h-[360px]">
        
        {(activeTab === '3d' || activeTab === 'compare') && (
          <div className={`w-full h-full flex ${activeTab === 'compare' ? 'flex-row' : 'flex-col'}`}>
            <div className="relative flex-1 h-full">
              <canvas ref={canvas3DRef} className="w-full h-full block" />
              {activeTab === 'compare' && (
                <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-amber-500 font-bold border border-slate-800">
                  PRIMARY: {inputs.bondType?.toUpperCase()}
                </div>
              )}
            </div>
            
            {activeTab === 'compare' && (
              <div className="relative flex-1 h-full border-l border-slate-800">
                <canvas ref={canvasCompareRef} className="w-full h-full block" />
                <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-emerald-400 font-bold border border-slate-800">
                  COMPARE: {compareBond.toUpperCase()}
                </div>
                
                <div className="absolute bottom-2 right-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <select 
                    value={compareBond}
                    onChange={e => setCompareBond(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-[10px] rounded p-1 outline-none font-bold"
                  >
                    <option value="stretcher">Stretcher</option>
                    <option value="header">Header</option>
                    <option value="english">English</option>
                    <option value="flemish">Flemish</option>
                    <option value="english-garden">English Garden</option>
                    <option value="flemish-garden">Flemish Garden</option>
                    <option value="dutch">Dutch</option>
                    <option value="monk">Monk</option>
                    <option value="stack">Stack</option>
                    <option value="rat-trap">Rat Trap</option>
                    <option value="facing">Facing</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'elevation' || activeTab === 'plan' || activeTab === 'section') && (
          <div className="w-full h-full">
            <canvas ref={canvas2DRef} className="w-full h-full block" />
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="w-full h-full overflow-y-auto p-6 text-slate-300">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-500" />
              <span>BRICKWORK BOND TYPES PATTERN GALLERY</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'stretcher', name: 'Stretcher Bond', desc: 'Bricks placed flat horizontally showing stretcher faces. Courses shift by 1/2 brick. Used for half-brick thick partitions.' },
                { id: 'header', name: 'Header Bond', desc: 'Bricks placed horizontally showing header faces. Courses shift by 1/2 brick width. Highly efficient for curved structures.' },
                { id: 'english', name: 'English Bond', desc: 'Alternating courses of stretchers and headers. The strongest bond type in civil engineering, used for load-bearing walls.' },
                { id: 'flemish', name: 'Flemish Bond', desc: 'Alternating stretchers and headers in every course. Offers a beautiful aesthetic face pattern.' },
                { id: 'english-garden', name: 'English Garden Wall', desc: 'Three courses of stretchers followed by one course of headers. Economical and strong.' },
                { id: 'flemish-garden', name: 'Flemish Garden Wall', desc: 'Three stretchers followed by one header in every course. Gives a distinctive diagonal pattern.' },
                { id: 'dutch', name: 'Dutch Bond', desc: 'English bond variation where alternate stretcher courses begin with a half-brick (three-quarter bat).' },
                { id: 'monk', name: 'Monk Bond', desc: 'Two stretchers then one header repeating in each course. Popular in historic Baltic structures.' },
                { id: 'stack', name: 'Stack Bond', desc: 'Non-structural bond where bricks align vertically with no offset. Must be reinforced with mesh.' },
                { id: 'rat-trap', name: 'Rat Trap Bond', desc: 'Bricks laid on edge forming a hollow cavity in stretcher sequences. Saves 25% bricks and mortar volume.' },
                { id: 'facing', name: 'Facing Bond', desc: 'Uses premium facing bricks on the outer face, backed by common gray bricks.' }
              ].map(bnd => (
                <div 
                  key={bnd.id}
                  onClick={() => {
                    inputs.bondType = bnd.id;
                    if (onLoadInputs) onLoadInputs({ ...inputs, bondType: bnd.id });
                    setActiveTab('3d');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 mb-1">{bnd.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{bnd.desc}</p>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold mt-3 block text-right">Apply Bond Preset &rarr;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="w-full h-full overflow-y-auto p-6 text-slate-350">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="text-sm font-bold text-white">Masonry Calculation History</h3>
              <div className="flex items-center space-x-2">
                <input 
                  type="text" 
                  value={historyName}
                  onChange={e => setHistoryName(e.target.value)}
                  placeholder="Label name (optional)"
                  className="bg-slate-800 text-white text-xs border border-slate-700 rounded-lg px-3 py-1.5 outline-none"
                />
                <button 
                  onClick={saveToHistory}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow"
                >
                  SAVE CURRENT
                </button>
              </div>
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs">
                No saved calculations. Type a label and click "Save Current" to store records.
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.date}</span>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Wall: {item.inputs.wallLength}x{item.inputs.wallHeight}m | Joint: {item.inputs.mortarJoint}mm | Bond: {item.inputs.bondType}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onLoadInputs && onLoadInputs(item.inputs)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
                      >
                        LOAD
                      </button>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] px-3 py-1.5 rounded-lg transition border border-red-500/20"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>

      {activeTab !== 'gallery' && activeTab !== 'history' && (
        <div className="border-t border-slate-800 bg-slate-955 p-3 px-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center space-x-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-amber-500 hover:text-white transition"
              title={isPlaying ? 'Pause Construction' : 'Animate Layer Construction'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Layer:</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={constructionProgress}
                onChange={e => {
                  setConstructionProgress(parseInt(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-20 md:w-32 h-1 bg-slate-855 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-white min-w-[28px] text-right">{constructionProgress}%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setShowWireframe(!showWireframe)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium border text-[10px] transition ${showWireframe ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>WIREFRAME</span>
            </button>

            <button 
              onClick={() => setXrayOpacity(xrayOpacity === 1.0 ? 0.35 : 1.0)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium border text-[10px] transition ${xrayOpacity < 1.0 ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>X-RAY MODE</span>
            </button>

            <button 
              onClick={() => setShowMortarJoints(!showMortarJoints)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium border text-[10px] transition ${showMortarJoints ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SHOW MORTAR</span>
            </button>

            {(activeTab === 'elevation' || activeTab === 'plan' || activeTab === 'section') && (
              <button 
                onClick={() => setShowNumbering(!showNumbering)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium border text-[10px] transition ${showNumbering ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <span># BRICK NUMBERS</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* LEGEND BAR */}
      <div className="bg-slate-950 border-t border-slate-850 px-4 py-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-[#ea580c] border border-slate-750 block"></span>
          <span>STRETCHER BRICK</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-[#9a3412] border border-slate-750 block"></span>
          <span>HEADER BRICK</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-[#475569] border border-slate-750 block"></span>
          <span>MORTAR BEDDING</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-transparent border-2 border-[#0ea5e9] block"></span>
          <span>OPENING DEDUCTION</span>
        </span>
        {inputs.bondType === 'rat-trap' && (
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-transparent border border-dashed border-[#38bdf8] block"></span>
            <span>HOLLOW CAVITY</span>
          </span>
        )}
      </div>

    </div>
  );
}
