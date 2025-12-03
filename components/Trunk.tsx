import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import '../types';

interface TrunkProps {
  targetState: number; // 0 = Scattered, 1 = Tree
}

const Trunk: React.FC<TrunkProps> = ({ targetState }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Dimensions
  const trunkHeight = 5;
  const treeBaseY = -7; 

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Scale entire group down when scattered
      easing.damp(groupRef.current.scale, 'x', targetState, 0.5, delta);
      easing.damp(groupRef.current.scale, 'y', targetState, 0.5, delta);
      easing.damp(groupRef.current.scale, 'z', targetState, 0.5, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, treeBaseY + 1.5, 0]}>
        {/* The Main Trunk */}
        <mesh position={[0, trunkHeight / 2 - 1, 0]}>
            <cylinderGeometry args={[0.4, 0.8, trunkHeight, 16]} />
            <meshStandardMaterial 
                color="#2a1b0e" 
                roughness={0.8} 
                metalness={0.2} 
            />
        </mesh>

        {/* The Base / Pot */}
        <group position={[0, 0, 0]}>
            {/* Inner Soil/Dark part */}
            <mesh position={[0, 0.5, 0]}>
                 <cylinderGeometry args={[1.2, 1.0, 1.5, 32]} />
                 <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            {/* Outer Gold Rimmed Pot */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[1.3, 1.1, 1.4, 6]} /> {/* Hexagonal pot looks more modern */}
                <meshStandardMaterial 
                    color="#0a2f1f" // Dark Green Enamel
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
             {/* Gold Rim */}
             <mesh position={[0, 1.1, 0]}>
                <cylinderGeometry args={[1.35, 1.35, 0.1, 6]} />
                <meshStandardMaterial 
                    color="#FFD700"
                    roughness={0.1}
                    metalness={1.0}
                />
            </mesh>
        </group>
    </group>
  );
};

export default Trunk;