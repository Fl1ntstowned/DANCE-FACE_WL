'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { JudgmentType } from '../types';

interface JudgmentEffectProps {
  judgment: JudgmentType;
}

export default function JudgmentEffect({ judgment }: JudgmentEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta;

      // Animate scale
      const scale = 1 + Math.sin(timeRef.current * 10) * 0.2;
      groupRef.current.scale.set(scale, scale, scale);

      // Animate position
      groupRef.current.position.y = Math.sin(timeRef.current * 5) * 0.2;

      // Fade out
      if (timeRef.current > 0.3) {
        groupRef.current.children.forEach(child => {
          if ((child as THREE.Mesh).material) {
            const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            material.opacity = Math.max(0, 1 - (timeRef.current - 0.3) * 2);
          }
        });
      }
    }
  });

  const getColor = () => {
    switch (judgment) {
      case 'perfect': return '#ff00ff';
      case 'great': return '#00ff00';
      case 'good': return '#ffff00';
      case 'miss': return '#ff0000';
      default: return '#ffffff';
    }
  };

  const getText = () => {
    switch (judgment) {
      case 'perfect': return 'PERFECT!';
      case 'great': return 'GREAT!';
      case 'good': return 'GOOD';
      case 'miss': return 'MISS';
      default: return '';
    }
  };

  const color = getColor();

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <Text
        fontSize={1.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor={color}
      >
        {getText()}
      </Text>

      {/* Particle burst effect for perfect hits */}
      {judgment === 'perfect' && (
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.random() * 4 - 2,
                Math.random() * 2,
                Math.random() * 2 - 1
              ]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={1}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}