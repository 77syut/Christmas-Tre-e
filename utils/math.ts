import * as THREE from 'three';

// Golden Angle for organic spiral distribution
const PHI = Math.PI * (3 - Math.sqrt(5));

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateTreePosition = (index: number, total: number, radiusBase: number, height: number): THREE.Vector3 => {
  const y = (index / total) * height; // 0 to height
  const radiusAtHeight = (1 - y / height) * radiusBase; // Cone shape
  const angle = index * PHI;
  
  // Add some noise to make it less perfect/more organic
  const rNoise = Math.random() * 0.5;
  const thetaNoise = Math.random() * 0.2;

  const x = (radiusAtHeight + rNoise) * Math.cos(angle + thetaNoise);
  const z = (radiusAtHeight + rNoise) * Math.sin(angle + thetaNoise);
  
  // Center the tree vertically
  return new THREE.Vector3(x, y - height / 2, z);
};

export const generateScatterPosition = (spread: number): THREE.Vector3 => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = Math.pow(Math.random(), 1/3) * spread; // Uniform sphere distribution

  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export interface PositionAndRotation {
  pos: THREE.Vector3;
  rot: THREE.Quaternion;
}

export const generateSpiralPositions = (count: number, radiusBase: number, height: number, turns: number): PositionAndRotation[] => {
  const data: PositionAndRotation[] = [];
  const heightOffset = height / 2;
  
  for (let i = 0; i < count; i++) {
      const t = i / (count - 1); // Normalized 0 -> 1
      const y = t * height - heightOffset;
      
      // Cone radius at this height (tapers to top)
      // Keep ribbon slightly outside the main foliage radius
      const r = (radiusBase * (1 - t)) + 0.5; 
      
      const angle = t * Math.PI * 2 * turns;
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      const pos = new THREE.Vector3(x, y, z);
      
      // Calculate rotation to align segment with the spiral curve
      // We look ahead a tiny bit to find the tangent
      const tNext = Math.min(1, t + 0.01);
      const yNext = tNext * height - heightOffset;
      const rNext = (radiusBase * (1 - tNext)) + 0.5;
      const angleNext = tNext * Math.PI * 2 * turns;
      
      const nextPos = new THREE.Vector3(
           Math.cos(angleNext) * rNext,
           yNext,
           Math.sin(angleNext) * rNext
      );
      
      const dummy = new THREE.Object3D();
      dummy.position.copy(pos);
      dummy.lookAt(nextPos);
      
      data.push({ pos, rot: dummy.quaternion.clone() });
  }
  return data;
};

export const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;