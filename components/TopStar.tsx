import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import '../types';

interface TopStarProps {
  targetState: number; // 0 = Scattered, 1 = Tree
}

const TopStar: React.FC<TopStarProps> = ({ targetState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const spriteRef = useRef<THREE.Sprite>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Position at the very top of the tree
  // Tree height is ~14, centered at 0, top is ~7. 
  // Adjusted slightly higher for the star to sit nicely.
  const position = new THREE.Vector3(0, 7.5, 0);

  // 1. Create the 5-pointed star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.8;
    const innerRadius = 0.35;
    
    // Start at top point (rotate -PI/2)
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 2,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // 2. Create a "Glare" texture for the sprite (programmatic)
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)'); // White/Yellow Center
        gradient.addColorStop(0.2, 'rgba(255, 215, 0, 0.6)'); // Gold mid
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.1)'); // Orange fade
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
        // Fade in/out scaling based on state
        // When scattered (0), star disappears
        easing.damp(groupRef.current.scale, 'x', targetState, 0.5, delta);
        easing.damp(groupRef.current.scale, 'y', targetState, 0.5, delta);
        easing.damp(groupRef.current.scale, 'z', targetState, 0.5, delta);
    }

    if (meshRef.current) {
      // Rotation: Spin slowly
      meshRef.current.rotation.y = time * 0.8;
      
      // Gentle Bobbing
      meshRef.current.position.y = Math.sin(time * 1.5) * 0.1;

      // Color/Emission Pulsing
      // Iridescent gold shift: ranges from GoldenRod to White
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(time * 3) * 0.5 + 0.5; // 0 to 1
      
      // Shift emissive color for that "burning star" look
      const baseGold = new THREE.Color("#FFD700");
      const brightWhite = new THREE.Color("#FFFFE0");
      material.emissive.lerpColors(baseGold, brightWhite, pulse * 0.5);
      material.emissiveIntensity = 2.0 + pulse * 1.5; // Pulse intensity
    }

    if (spriteRef.current) {
        // Sprite halo rotates slightly opposite to star or just pulses
        const pulse = Math.sin(time * 2.5) * 0.1 + 1.0;
        spriteRef.current.scale.set(4 * pulse, 4 * pulse, 1);
        
        // Ensure sprite always faces camera (default behavior, but good to be explicit if grouped)
        // Sprite material rotation can be used for "twinkle" effect
        spriteRef.current.material.rotation = time * 0.1;
        spriteRef.current.material.opacity = targetState * (0.6 + Math.sin(time * 5) * 0.1);
    }

    if (lightRef.current) {
        easing.damp(lightRef.current, 'intensity', targetState * 3, 0.5, delta);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* The 3D Star Mesh */}
      <mesh ref={meshRef} geometry={starGeometry}>
        {/* Center the geometry so it rotates around its center */}
        <meshStandardMaterial 
          color="#FFC107"
          roughness={0.1}
          metalness={1.0}
          toneMapped={false}
        />
      </mesh>

      {/* The Glow Halo (Billboard Sprite) */}
      <sprite ref={spriteRef} renderOrder={1}>
         <spriteMaterial 
            map={glowTexture} 
            transparent 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
        />
      </sprite>

      {/* Actual Light Source */}
      <pointLight ref={lightRef} distance={20} decay={2} color="#ffebbb" />
    </group>
  );
};

export default TopStar;