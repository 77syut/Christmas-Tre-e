import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const Effects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.6} // Only bright things glow
        luminanceSmoothing={0.1} 
        height={300} 
        intensity={1.5} 
        radius={0.8}
      />
      <Vignette offset={0.1} darkness={0.6} eskil={false} />
      <Noise opacity={0.05} /> 
    </EffectComposer>
  );
};

export default Effects;
