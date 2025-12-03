import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  setMousePos: (pos: THREE.Vector3) => void;
}

const CameraRig: React.FC<CameraRigProps> = ({ setMousePos }) => {
  const { camera, pointer, scene } = useThree();
  const vec = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Invisible plane at z=0 for raycast reference
  const raycaster = new THREE.Raycaster();

  useFrame((state) => {
    // 1. Smooth Camera Movement (Parallax)
    // subtle movement based on mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 2, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 2, 0.05);
    state.camera.lookAt(0, 0, 0);

    // 2. Raycast for 3D mouse position (for repulsion effect)
    raycaster.setFromCamera(pointer, camera);
    // We approximate the interaction plane based on camera look direction or a fixed plane
    // For the tree which is centered at 0,0,0, we project onto a plane facing camera
    const targetZ = 0; 
    vec.set(pointer.x, pointer.y, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = (targetZ - camera.position.z) / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    setMousePos(pos);
  });

  return null;
};

export default CameraRig;
