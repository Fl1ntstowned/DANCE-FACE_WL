'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Arrow } from '../types';

interface ArrowMeshProps {
  arrow: Arrow;
  laneX: number;
}

export default function ArrowMesh({ arrow, laneX }: ArrowMeshProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    try {
      if (meshRef.current) {
        // NO ROTATION - arrows should maintain their direction

        // Pulse effect when close to target
        if (Math.abs(arrow.position) < 3) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
          meshRef.current.scale.set(scale, scale, scale);
        }

        // Fade out when hit
        if (arrow.hit) {
          meshRef.current.scale.x *= 0.9;
          meshRef.current.scale.y *= 0.9;
          meshRef.current.scale.z *= 0.9;
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

  // Create simple directional arrow shapes - flat facing the player
  const createArrowShape = () => {
    // All arrows face the player, simple and clear
    return (
      <group rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        {arrow.direction === 'left' && (
          <>
            {/* Left arrow ← */}
            <mesh position={[0.15, 0, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.2, 0.3, 3]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          </>
        )}

        {arrow.direction === 'right' && (
          <>
            {/* Right arrow → */}
            <mesh position={[-0.15, 0, 0]}>
              <boxGeometry args={[0.3, 0.1, 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.2, 0.3, 3]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          </>
        )}

        {arrow.direction === 'up' && (
          <>
            {/* Up arrow ↑ */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.2, 0.3, 3]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          </>
        )}

        {arrow.direction === 'down' && (
          <>
            {/* Down arrow ↓ */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.1, 0.3, 0.05]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.2, 0.3, 3]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
          </>
        )}
      </group>
    );
  };

  return (
    <group ref={meshRef} position={[laneX, -1.5, arrow.position]}>
      {/* Proper directional arrow */}
      {createArrowShape()}

      {/* Subtle glow backdrop */}
      {!arrow.hit && (
        <mesh scale={[1.2, 1.2, 0.5]}>
          <boxGeometry args={[1, 1, 0.1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
          />
        </mesh>
      )}
    </group>
  );
}