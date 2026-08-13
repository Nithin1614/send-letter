'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

function Seal() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.15;
    }
  });

  const materialProps = {
    color: '#8b1414',
    roughness: 0.3,
    metalness: 0.05,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
  };

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.35, 64]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
        
        <mesh position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.12, 16, 64]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>

        <Text
          position={[0, 0.18, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.7}
          color="#4a0505"
          depthOffset={1}
        >
          SL
        </Text>
      </Float>
    </group>
  );
}

export default function WaxSeal3D() {
  return (
    <div style={{ width: '280px', height: '280px' }}>
      <Canvas
        camera={{ position: [0, 3, 5], fov: 45 }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffd5a6" />
        <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#ffb088" />
        <Environment preset="studio" />
        <Seal />
      </Canvas>
    </div>
  );
}
