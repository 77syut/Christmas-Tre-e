import { Vector3 } from 'three';
import React from 'react';

// Augment JSX namespace to include React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      group: any;
      color: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      mesh: any;
      primitive: any;
      cylinderGeometry: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      octahedronGeometry: any;
      sphereGeometry: any;
      extrudeGeometry: any;
      sprite: any;
      spriteMaterial: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      group: any;
      color: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      mesh: any;
      primitive: any;
      cylinderGeometry: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      octahedronGeometry: any;
      sphereGeometry: any;
      extrudeGeometry: any;
      sprite: any;
      spriteMaterial: any;
    }
  }
}

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  scatterPos: Vector3;
  treePos: Vector3;
  color: [number, number, number];
  size: number;
}

export interface HandGesture {
  isHandDetected: boolean;
  isOpen: boolean; // true = open palm (scatter), false = closed/fist (gather)
}