import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreePosition, generateScatterPosition } from '../utils/math';
import '../types';

interface OrnamentsProps {
  count?: number;
  targetState: number; // 0 or 1
  type: 'sphere' | 'box';
  color: string;
}

const Ornaments: React.FC<OrnamentsProps> = ({ count = 50, targetState, type, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Data storage
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
        // slightly larger radius for ornaments to sit on surface
      const tPos = generateTreePosition(i, count, 6.5, 14); 
      const sPos = generateScatterPosition(20);
      data.push({
        treePos: tPos,
        scatterPos: sPos,
        currentPos: sPos.clone(),
        rotationSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.02),
        scale: Math.random() * 0.5 + 0.3
      });
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const progress = THREE.MathUtils.lerp(
      (meshRef.current.userData.progress || 0),
      targetState,
      delta * 2.0 // Slower than particles for "heavier" feel
    );
    meshRef.current.userData.progress = progress;

    const time = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Interpolate position
      p.currentPos.lerpVectors(p.scatterPos, p.treePos, progress);

      // Add gentle floating when scattered
      if (progress < 0.5) {
        p.currentPos.y += Math.sin(time + i) * 0.01;
      }

      dummy.position.copy(p.currentPos);
      
      // Rotate objects
      dummy.rotation.x += p.rotationSpeed.x;
      dummy.rotation.y += p.rotationSpeed.y;
      dummy.rotation.z += p.rotationSpeed.z;

      dummy.scale.setScalar(p.scale * (0.5 + 0.5 * progress)); // Grow slightly when forming tree
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    return type === 'sphere' 
        ? new THREE.SphereGeometry(0.5, 32, 32) 
        : new THREE.BoxGeometry(0.7, 0.7, 0.7);
  }, [type]);

  // Luxury Material
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.05, // Extremely smooth for high reflection
    metalness: 1.0, // Fully metallic
    emissive: color,
    emissiveIntensity: 0.6, // Self-illuminated look
  }), [color]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export default Ornaments;