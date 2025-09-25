'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Arrow } from '../types';

interface ArrowMeshProps {
  arrow: Arrow;
  laneX: number;
  gaugeLevel?: number;
}

export default function ArrowMesh({ arrow, laneX, gaugeLevel = 30 }: ArrowMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    try {
      if (meshRef.current) {
        // Simple pulse effect when very close to target
        if (Math.abs(arrow.position) < 2) {
          const scale = 1.05;
          meshRef.current.scale.set(scale, scale, scale);
        } else {
          meshRef.current.scale.set(1, 1, 1);
        }

        // Fade out when hit
        if (arrow.hit) {
          meshRef.current.scale.x *= 0.85;
          meshRef.current.scale.y *= 0.85;
          meshRef.current.scale.z *= 0.85;
        }
      }
    } catch (error) {
      console.error('[ArrowMesh] Animation error:', error);
    }
  });

  // Get color based on direction
  const getColor = () => {
    switch (arrow.direction) {
      case 'left': return '#ff00ff';
      case 'down': return '#00ffff';
      case 'up': return '#ffff00';
      case 'right': return '#00ff00';
      default: return '#ffffff';
    }
  };

  const color = getColor();

  // Create optimized arrow shapes with simple geometry
  const createArrowShape = () => {
    return (
      <group rotation={[-Math.PI / 2, 0, 0]} scale={[1.8, 1.8, 1.8]}>
        {arrow.direction === 'left' && (
          <group>
            {/* Simple left arrow */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[-0.18, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[-0.18, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )}

        {arrow.direction === 'right' && (
          <group>
            {/* Simple right arrow */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0.18, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0.18, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.15, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )}

        {arrow.direction === 'up' && (
          <group>
            {/* Simple up arrow */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[-0.1, 0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0.1, 0.18, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )}

        {arrow.direction === 'down' && (
          <group>
            {/* Simple down arrow */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[-0.1, -0.18, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <mesh position={[0.1, -0.18, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        )}
      </group>
    );
  };

  return (
    <group ref={meshRef} position={[laneX, -1.5, arrow.position]}>
      {/* Proper directional arrow */}
      {createArrowShape()}
    </group>
  );
}