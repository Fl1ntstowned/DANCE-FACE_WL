'use client';

import { useRef, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OptimizedMonkeyHeadProps {
  quality?: 'low' | 'medium' | 'high';
  scale?: [number, number, number] | number;
}

const OptimizedMonkeyHead = forwardRef<THREE.Group, OptimizedMonkeyHeadProps>(
  ({ quality = 'high', ...props }, ref) => {
    const headGroupRef = useRef<THREE.Group>(null);
    const localRef = ref || headGroupRef;

    const headConfig = {
      size: 0.4,
      headColor: 0x8B4513,
      eyeColor: 0xFF0000,
      snoutColor: 0xF4A460
    };

    // Optimize geometry segments based on quality
    const segments = useMemo(() => {
      switch(quality) {
        case 'low': return 8;
        case 'medium': return 16;
        case 'high': return 24;
        default: return 16;
      }
    }, [quality]);

    // Reduce hair count based on quality
    const hairCount = useMemo(() => {
      switch(quality) {
        case 'low': return 0;
        case 'medium': return 10;
        case 'high': return 20;
        default: return 10;
      }
    }, [quality]);

    useFrame((state) => {
      if (headGroupRef.current && quality !== 'low') {
        // Simpler animation for better performance
        const time = state.clock.elapsedTime;
        headGroupRef.current.position.y += Math.sin(time * 2) * 0.001;
        if (quality === 'high') {
          headGroupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        }
      }
    });

    return (
      <group ref={localRef} {...props}>
        {/* Main head - optimized material */}
        <mesh castShadow={quality === 'high'} receiveShadow={quality === 'high'}>
          <sphereGeometry args={[headConfig.size, segments, segments]} />
          <meshStandardMaterial
            color={headConfig.headColor}
            roughness={0.8}
            metalness={0}
          />
        </mesh>

        {/* Snout - only for medium and high quality */}
        {quality !== 'low' && (
          <mesh
            position={[0, -headConfig.size * 0.3, headConfig.size * 0.7]}
            scale={[1.2, 0.8, 0.9]}
          >
            <sphereGeometry args={[headConfig.size * 0.5, segments / 2, segments / 2]} />
            <meshStandardMaterial
              color={headConfig.snoutColor}
              roughness={0.8}
              metalness={0}
            />
          </mesh>
        )}

        {/* Simplified ears */}
        {[-1, 1].map((side) => (
          <mesh
            key={`ear-${side}`}
            position={[side * headConfig.size * 0.9, headConfig.size * 0.1, -headConfig.size * 0.2]}
            scale={[1.5, 1.8, 0.6]}
            rotation={[0, 0, side * 0.3]}
          >
            <sphereGeometry args={[headConfig.size * 0.35, segments / 2, segments / 2]} />
            <meshStandardMaterial
              color={new THREE.Color(headConfig.headColor).multiplyScalar(0.85)}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        ))}

        {/* Simplified X eyes - using planes for better performance */}
        {quality !== 'low' && [-1, 1].map((side, index) => (
          <group key={`eye-${index}`} position={[side * headConfig.size * 0.25, headConfig.size * 0.2, headConfig.size * 0.95]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[headConfig.size * 0.15, headConfig.size * 0.03]} />
              <meshBasicMaterial color={headConfig.eyeColor} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <planeGeometry args={[headConfig.size * 0.15, headConfig.size * 0.03]} />
              <meshBasicMaterial color={headConfig.eyeColor} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Simplified smile */}
        {quality !== 'low' && (
          <mesh position={[0, -headConfig.size * 0.4, headConfig.size * 1.05]} rotation={[Math.PI * 0.3, 0, 0]}>
            <torusGeometry args={[headConfig.size * 0.15, headConfig.size * 0.02, 6, 12, Math.PI]} />
            <meshBasicMaterial color={0x000000} />
          </mesh>
        )}

        {/* Optimized hair - only for higher quality */}
        {quality === 'high' && Array.from({ length: hairCount }, (_, i) => {
          const angle = (i / hairCount) * Math.PI * 2;
          const x = Math.sin(angle) * headConfig.size * 0.3;
          const z = Math.cos(angle) * headConfig.size * 0.3;
          const y = headConfig.size * 0.8;

          return (
            <mesh
              key={`curl-${i}`}
              position={[x, y, z]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <torusGeometry args={[headConfig.size * 0.04, headConfig.size * 0.01, 4, 6]} />
              <meshStandardMaterial
                color={0x5C4033}
                roughness={1}
                metalness={0}
              />
            </mesh>
          );
        })}

        {/* Simple nostrils */}
        {quality === 'high' && [-1, 1].map((side) => (
          <mesh
            key={`nostril-${side}`}
            position={[side * headConfig.size * 0.08, -headConfig.size * 0.2, headConfig.size * 1.1]}
          >
            <sphereGeometry args={[headConfig.size * 0.03, 6, 6]} />
            <meshBasicMaterial color={0x000000} />
          </mesh>
        ))}
      </group>
    );
  }
);

OptimizedMonkeyHead.displayName = 'OptimizedMonkeyHead';

export default OptimizedMonkeyHead;