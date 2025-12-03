import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateSpiralPositions, generateScatterPosition } from '../utils/math';
import '../types';

interface RibbonProps {
  targetState: number; // 0 or 1
}

const Ribbon: React.FC<RibbonProps> = ({ targetState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 600; // Increased count for smoother ribbon curve
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    // Generate spiral path
    const spiralData = generateSpiralPositions(count, 6.8, 14, 4.0); // Slightly wider radius, more turns
    
    return spiralData.map((data) => ({
      treePos: data.pos,
      treeRot: data.rot,
      scatterPos: generateScatterPosition(25), // Wide scatter
      // Random rotation for scatter state
      scatterRot: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      ),
      currentPos: new THREE.Vector3(),
      currentRot: new THREE.Quaternion()
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smooth transition variable
    const currentProgress = THREE.MathUtils.lerp(
        meshRef.current.userData.progress || 0,
        targetState,
        delta * 1.5
    );
    meshRef.current.userData.progress = currentProgress;

    particles.forEach((p, i) => {
      // Interpolate Position
      p.currentPos.lerpVectors(p.scatterPos, p.treePos, currentProgress);
      
      // Interpolate Rotation (Slerp)
      p.currentRot.slerpQuaternions(p.scatterRot, p.treeRot, currentProgress);

      dummy.position.copy(p.currentPos);
      dummy.quaternion.copy(p.currentRot);
      
      // Scale effect: confetti size vs connected ribbon size
      const scale = 1.0; 
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Wider, thinner segment to look like a ribbon strip */}
      {/* x=Width, y=Thickness, z=Length along spiral */}
      <boxGeometry args={[0.35, 0.02, 0.4]} /> 
      <meshStandardMaterial 
        color="#D00000"
        emissive="#FF0000"
        emissiveIntensity={1.8} // Strong glow
        roughness={0.15} // Satin finish (shiny)
        metalness={0.7}
      />
    </instancedMesh>
  );
};

export default Ribbon;