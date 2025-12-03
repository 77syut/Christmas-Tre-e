import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

import FoliageLayer from './components/FoliageLayer';
import Ornaments from './components/Ornaments';
import CameraRig from './components/CameraRig';
import Effects from './components/Effects';
import HandTracker from './components/HandTracker';
import Trunk from './components/Trunk';
import Ribbon from './components/Ribbon';
import TopStar from './components/TopStar';
import { TreeState } from './types';

// UI Icons
const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function App() {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);
  const [mousePos, setMousePos] = useState(new THREE.Vector3(999, 999, 999));
  const [useCamera, setUseCamera] = useState(false);
  const [isGesturingOpen, setIsGesturingOpen] = useState(false);

  // Derived state value (0 = Scattered, 1 = Tree)
  const targetValue = (useCamera && isGesturingOpen) ? 0 : (treeState === TreeState.TREE_SHAPE ? 1 : 0);

  const toggleState = () => {
    if (useCamera) return; 
    setTreeState(prev => prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE);
  };

  const handleGesture = useCallback((isOpen: boolean) => {
    setIsGesturingOpen(isOpen);
  }, []);

  return (
    <div className="w-full h-screen bg-[#000500] text-emerald-100 font-sans">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 40 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000500']} />
        
        {/* Lights - Optimized for "Flowy/Iridescent" Look */}
        <ambientLight intensity={0.2} />
        {/* Main warm key light */}
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#FFD700" distance={50} decay={2} />
        {/* Fill light cool */}
        <pointLight position={[-10, 5, 10]} intensity={1.5} color="#c0e0ff" distance={50} decay={2} />
        {/* Rim light for edges */}
        <spotLight position={[0, 20, -10]} angle={0.5} intensity={4} color="#FFC107" castShadow />
        {/* Ribbon glow helper - Intense Red Light near center */}
        <pointLight position={[0, 0, 5]} intensity={2.0} color="#FF0000" distance={15} decay={2} />

        {/* Scene Content */}
        <Suspense fallback={null}>
            {/* 
               Scaled down by ~35% (0.65)
               Position adjusted to 0,0,0 to remain centered in view
            */}
            <group position={[0, 0, 0]} scale={[0.65, 0.65, 0.65]}> 
                <Trunk targetState={targetValue} />
                
                <FoliageLayer 
                    count={15000} 
                    targetState={targetValue} 
                    mousePos={mousePos} 
                />
                
                <Ribbon targetState={targetValue} />

                <TopStar targetState={targetValue} />

                <Ornaments 
                    count={150} 
                    targetState={targetValue} 
                    type="sphere" 
                    color="#FFD700" 
                />
                <Ornaments 
                    count={40} 
                    targetState={targetValue} 
                    type="box" 
                    color="#FF1111" 
                />
            </group>
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Effects />
        </Suspense>
        
        <CameraRig setMousePos={setMousePos} />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between z-10">
        <header className="flex flex-col items-center w-full mt-12 p-4">
            <h1 className="text-5xl md:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] tracking-widest text-center">
              MERRY CHRISTMAS
            </h1>
        </header>

        {/* Footer centered at the bottom with simplified layout */}
        <footer className="w-full flex justify-center pb-8 pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
                 <button 
                    onClick={() => setUseCamera(!useCamera)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-sm ${useCamera ? 'bg-emerald-900/80 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-black/40 border-emerald-800/50 text-emerald-600'}`}
                >
                    <CameraIcon />
                    <span className="text-xs font-bold tracking-widest uppercase">{useCamera ? 'Gesture Control On' : 'Enable Camera'}</span>
                </button>
                
                 <button 
                    onClick={toggleState}
                    disabled={useCamera}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-sm ${!useCamera ? 'hover:bg-amber-900/30 border-amber-500/50 text-amber-100' : 'opacity-50 cursor-not-allowed border-gray-800 text-gray-500'}`}
                >
                    <EyeIcon />
                     <span className="text-xs font-bold tracking-widest uppercase">{treeState === TreeState.TREE_SHAPE ? 'Scatter' : 'Gather'}</span>
                </button>
            </div>
        </footer>
      </div>

      <HandTracker isEnabled={useCamera} onGesture={handleGesture} />
      
      <div className="absolute inset-0 pointer-events-none radial-gradient z-0"></div>
    </div>
  );
}