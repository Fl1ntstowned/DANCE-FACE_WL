'use client';

import { useRef, forwardRef } from 'react';
import * as THREE from 'three';

interface MonkeyHeadProps {
  scale?: [number, number, number] | number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const MonkeyHead = forwardRef<THREE.Group, MonkeyHeadProps>((props, ref) => {
  const headGroupRef = useRef<THREE.Group>(null);
  const localRef = ref || headGroupRef;

  const headConfig = {
    size: 0.35,  // Slightly bigger head size
    headColor: 0x8B4513,  // Saddle brown - more visible
    eyeColor: 0x000000,  // Black for eyes - more visible
    snoutColor: 0xF4A460  // Sandy brown - lighter for contrast
  };

  // No animation here - head should move with the bone it's attached to

  return (
    <group ref={localRef} {...props}>
      {/* Main head (elongated sphere for monkey shape) */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[headConfig.size, 32, 32]} />
        <meshPhysicalMaterial
          color={new THREE.Color(headConfig.headColor)}
          metalness={0}  // No metalness to avoid light reflection
          roughness={0.7}  // Slightly less matte
          clearcoat={0.2}  // Minimal clearcoat
          clearcoatRoughness={0.8}  // Very rough clearcoat
          envMapIntensity={0.3}  // Reduce environment reflection
        />
      </mesh>

      {/* Snout/muzzle */}
      <mesh
        position={[0, -headConfig.size * 0.3, headConfig.size * 0.7]}
        scale={[1.2, 0.8, 0.9]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[headConfig.size * 0.5, 16, 16]} />
        <meshPhysicalMaterial
          color={new THREE.Color(headConfig.snoutColor)}  // Lighter snout for contrast
          metalness={0}  // No metalness
          roughness={0.75}  // Slightly less matte
          clearcoat={0.15}  // Minimal clearcoat
          clearcoatRoughness={0.85}
          envMapIntensity={0.2}  // Very low environment reflection
        />
      </mesh>

      {/* Left ear */}
      <mesh
        position={[-headConfig.size * 0.9, headConfig.size * 0.1, -headConfig.size * 0.2]}
        scale={[1.5, 1.8, 0.6]}
        rotation={[0, 0, -0.3]}
        castShadow
      >
        <sphereGeometry args={[headConfig.size * 0.35, 16, 16]} />
        <meshPhysicalMaterial
          color={new THREE.Color(headConfig.headColor).multiplyScalar(0.85)}
          metalness={0}  // No metalness
          roughness={0.8}  // Matte
          clearcoat={0.1}  // Very minimal clearcoat
          clearcoatRoughness={0.9}
          envMapIntensity={0.2}  // Low environment reflection
        />
      </mesh>

      {/* Right ear */}
      <mesh
        position={[headConfig.size * 0.9, headConfig.size * 0.1, -headConfig.size * 0.2]}
        scale={[1.5, 1.8, 0.6]}
        rotation={[0, 0, 0.3]}
        castShadow
      >
        <sphereGeometry args={[headConfig.size * 0.35, 16, 16]} />
        <meshPhysicalMaterial
          color={new THREE.Color(headConfig.headColor).multiplyScalar(0.85)}
          metalness={0}  // No metalness
          roughness={0.8}  // Matte
          clearcoat={0.1}  // Very minimal clearcoat
          clearcoatRoughness={0.9}
          envMapIntensity={0.2}  // Low environment reflection
        />
      </mesh>

      {/* Left inner ear */}
      <mesh
        position={[-headConfig.size * 0.85, headConfig.size * 0.1, -headConfig.size * 0.15]}
        rotation={[0, -0.3, 0]}
      >
        <circleGeometry args={[headConfig.size * 0.2, 16]} />
        <meshPhysicalMaterial
          color={0xFFC0CB}  // Light pink for inner ears
          metalness={0}
          roughness={0.95}  // Very matte
          clearcoat={0.1}  // Minimal clearcoat
          clearcoatRoughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right inner ear */}
      <mesh
        position={[headConfig.size * 0.85, headConfig.size * 0.1, -headConfig.size * 0.15]}
        rotation={[0, 0.3, 0]}
      >
        <circleGeometry args={[headConfig.size * 0.2, 16]} />
        <meshPhysicalMaterial
          color={0xFFC0CB}  // Light pink for inner ears
          metalness={0}
          roughness={0.95}  // Very matte
          clearcoat={0.1}  // Minimal clearcoat
          clearcoatRoughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Red X marks as eyes */}
      {[-1, 1].map((side, index) => (
        <group key={`eye-${index}`}>
          {/* X mark using box geometry for better visibility */}
          {/* First diagonal line */}
          <mesh
            position={[side * headConfig.size * 0.25, headConfig.size * 0.2, headConfig.size * 0.96]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[headConfig.size * 0.18, headConfig.size * 0.035, headConfig.size * 0.01]} />
            <meshBasicMaterial
              color={0xFF0000}  // Red color
            />
          </mesh>
          
          {/* Second diagonal line */}
          <mesh
            position={[side * headConfig.size * 0.25, headConfig.size * 0.2, headConfig.size * 0.96]}
            rotation={[0, 0, -Math.PI / 4]}
          >
            <boxGeometry args={[headConfig.size * 0.18, headConfig.size * 0.035, headConfig.size * 0.01]} />
            <meshBasicMaterial
              color={0xFF0000}  // Red color
            />
          </mesh>
        </group>
      ))}

      {/* Bitcoin Puppets style smile mouth */}
      <group>
        {/* Main smile curve using torus */}
        <mesh 
          position={[0, -headConfig.size * 0.4, headConfig.size * 1.05]}
          rotation={[Math.PI * 0.3, 0, 0]}
        >
          <torusGeometry args={[headConfig.size * 0.15, headConfig.size * 0.025, 8, 16, Math.PI]} />
          <meshBasicMaterial
            color={0x000000}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Left corner of mouth */}
        <mesh position={[-headConfig.size * 0.15, -headConfig.size * 0.35, headConfig.size * 1.08]}>
          <sphereGeometry args={[headConfig.size * 0.03, 8, 8]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
        {/* Right corner of mouth */}
        <mesh position={[headConfig.size * 0.15, -headConfig.size * 0.35, headConfig.size * 1.08]}>
          <sphereGeometry args={[headConfig.size * 0.03, 8, 8]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
      </group>

      {/* Curly hair */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = (Math.random() - 0.5) * headConfig.size;
        const y = headConfig.size * (0.7 + Math.random() * 0.3);
        const z = (Math.random() - 0.5) * headConfig.size * 0.8;
        const rotationX = Math.random() * Math.PI;
        const rotationY = Math.random() * Math.PI;
        const rotationZ = Math.random() * Math.PI;
        
        return (
          <mesh
            key={`curl-${i}`}
            position={[x, y, z]}
            rotation={[rotationX, rotationY, rotationZ]}
          >
            <torusGeometry args={[headConfig.size * 0.05, headConfig.size * 0.015, 4, 8]} />
            <meshPhysicalMaterial
              color={0x5C4033}  // Dark brown for hair
              metalness={0}  // No metalness for hair
              roughness={0.95}  // Very matte
              clearcoat={0.1}  // Minimal clearcoat
              clearcoatRoughness={0.9}
            />
          </mesh>
        );
      })}

      {/* Left nostril */}
      <mesh
        position={[-headConfig.size * 0.08, -headConfig.size * 0.2, headConfig.size * 1.12]}
        scale={[0.7, 1.0, 0.4]}
      >
        <sphereGeometry args={[headConfig.size * 0.035, 8, 8]} />
        <meshBasicMaterial
          color={0x000000}
        />
      </mesh>

      {/* Right nostril */}
      <mesh
        position={[headConfig.size * 0.08, -headConfig.size * 0.2, headConfig.size * 1.12]}
        scale={[0.7, 1.0, 0.4]}
      >
        <sphereGeometry args={[headConfig.size * 0.035, 8, 8]} />
        <meshBasicMaterial
          color={0x000000}
        />
      </mesh>
    </group>
  );
});

MonkeyHead.displayName = 'MonkeyHead';

export default MonkeyHead;