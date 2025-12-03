import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreePosition, generateScatterPosition } from '../utils/math';
import { easing } from 'maath';
import '../types';

// Shaders
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scattered, 1 = Tree
  uniform vec3 uMouse;
  uniform float uHoverRadius;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aSize;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    // 1. Interpolate Base Position
    vec3 pos = mix(aScatterPos, aTreePos, uProgress);

    // 2. Add "Breathing" / Wind effect
    float noise = sin(pos.y * 2.0 + uTime) * cos(pos.x * 1.5 + uTime * 0.8) * 0.1;
    if (uProgress > 0.8) {
        pos.x += noise;
        pos.z += noise;
    }

    // 3. Mouse Interaction (Repulsion)
    // Only active when gathered or mostly gathered
    float dist = distance(pos, uMouse);
    if (dist < uHoverRadius) {
      vec3 dir = normalize(pos - uMouse);
      float force = (uHoverRadius - dist) / uHoverRadius;
      // Push harder if closer
      pos += dir * force * 3.0 * uProgress; 
    }

    // 4. Size calculation
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z); // Perspective scaling
    
    // Sparkle effect
    // We boost the brightness (vColor) for gold/warm particles to create a bloom effect
    float sparkle = sin(uTime * 3.0 + aScatterPos.x * 10.0 + aScatterPos.y * 5.0) * 0.5 + 0.5;
    
    // Check if particle is "Gold" (high Red, moderate Green, low Blue)
    if (vColor.r > 0.9 && vColor.g > 0.5) { 
        // Oscillate size
        gl_PointSize *= (1.0 + sparkle * 0.8);
        // Boost color brightness for HDR bloom
        vColor += vec3(0.5 * sparkle); 
    }

    gl_Position = projectionMatrix * mvPosition;
    
    // Fade out slightly when scattered to reduce chaos visual noise
    vAlpha = 0.6 + 0.4 * uProgress;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;

    // Soft edge glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageLayerProps {
  count?: number;
  targetState: number; // 0 or 1
  mousePos: THREE.Vector3;
}

const FoliageLayer: React.FC<FoliageLayerProps> = ({ count = 12000, targetState, mousePos }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector3(9999, 9999, 9999) },
    uHoverRadius: { value: 3.5 },
  }), []);

  // Generate Data
  const { positions, scatterPos, treePos, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sca = new Float32Array(count * 3);
    const tre = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const baseColor = new THREE.Color("#004225"); // Deep Emerald
    // Use a brighter, more saturated gold for the highlight
    const highlightColor = new THREE.Color("#FFC107"); // Amber 500
    const accentColor = new THREE.Color("#D00000"); // Rich Red

    for (let i = 0; i < count; i++) {
      // Tree Shape
      const tPos = generateTreePosition(i, count, 6, 14);
      tre[i * 3] = tPos.x;
      tre[i * 3 + 1] = tPos.y;
      tre[i * 3 + 2] = tPos.z;

      // Scatter Shape
      const sPos = generateScatterPosition(25);
      sca[i * 3] = sPos.x;
      sca[i * 3 + 1] = sPos.y;
      sca[i * 3 + 2] = sPos.z;

      // Start at scatter
      pos[i * 3] = sPos.x;
      pos[i * 3 + 1] = sPos.y;
      pos[i * 3 + 2] = sPos.z;

      // Colors & Size
      const rand = Math.random();
      let c = baseColor;
      let s = Math.random() * 0.3 + 0.1;

      if (rand > 0.88) { // 12% Gold particles (Increased count slightly)
        c = highlightColor;
        s = Math.random() * 0.6 + 0.4;
      } else if (rand > 0.98) { // 2% Red
        c = accentColor;
        s = 0.5;
      } else {
        // Vary green slightly
        c = baseColor.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
      }

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      sz[i] = s;
    }

    return { 
      positions: pos, 
      scatterPos: sca, 
      treePos: tre, 
      sizes: sz, 
      colors: col 
    };
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly transition progress
      easing.damp(material.uniforms.uProgress, 'value', targetState, 0.8, delta);
      
      // Update mouse uniform smoothly
      easing.damp3(material.uniforms.uMouse.value, mousePos, 0.2, delta);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatterPos" count={count} array={scatterPos} itemSize={3} />
        <bufferAttribute attach="attributes-aTreePos" count={count} array={treePos} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default FoliageLayer;