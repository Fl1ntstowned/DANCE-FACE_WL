'use client';

import { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import MonkeyHead from './MonkeyHead';

function Model() {
  const { scene, animations } = useGLTF('/Animation_Boom_Dance_withSkin (1).glb');
  const modelRef = useRef<THREE.Group>(null);
  const monkeyRef = useRef<THREE.Group>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);
  const { actions } = useAnimations(animations, modelRef);
  const [headBone, setHeadBone] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    // Play the first animation if available
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      firstAction?.play();
    }

    // Find the head bone in the skeleton and apply material properties
    if (scene) {
      scene.traverse((child) => {
        if (child.type === 'Bone' && (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('neck'))) {
          setHeadBone(child);
        }
        
        // Apply material properties to all meshes
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            // Handle both single materials and material arrays
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                // Convert to MeshPhysicalMaterial for clear coat support
                const physicalMat = new THREE.MeshPhysicalMaterial({
                  map: (mat as THREE.MeshStandardMaterial).map,
                  normalMap: (mat as THREE.MeshStandardMaterial).normalMap,
                  color: (mat as THREE.MeshStandardMaterial).color,
                  emissive: (mat as THREE.MeshStandardMaterial).emissive || new THREE.Color(0x000000),
                  emissiveIntensity: 0.02, // Very subtle self-illumination
                  roughness: 0.25, // More roughness to reduce shine
                  metalness: 0.15, // Reduced metallic
                  clearcoat: 0.7, // Reduced clear coat
                  clearcoatRoughness: 0.15, // Slightly rougher clear coat
                  reflectivity: 0.4, // Lower reflectivity
                  envMapIntensity: 0.6, // Much lower environment reflections
                  ior: 1.45, // Index of refraction
                  sheen: 0.5, // Moderate sheen
                  sheenRoughness: 0.1,
                  sheenColor: new THREE.Color(0x00ffff),
                  transmission: 0, // No transparency
                  thickness: 0, // No subsurface
                });
                
                // Replace the material
                if (Array.isArray(mesh.material)) {
                  const index = mesh.material.indexOf(mat);
                  mesh.material[index] = physicalMat;
                } else {
                  mesh.material = physicalMat;
                }
              }
            });
          }
        }
      });
    }
  }, [actions, scene]);

  useFrame((state) => {
    // Pulse model with beat
    if (modelRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
      modelRef.current.scale.setScalar(1.2 * pulse);
    }
    
    if (monkeyRef.current && headBone) {
      // Get world position of the head bone
      const worldPos = new THREE.Vector3();
      headBone.getWorldPosition(worldPos);
      
      // Position monkey head above the head bone
      monkeyRef.current.position.copy(worldPos);
      monkeyRef.current.position.x += 0.02; // Tiny bit left (was 0.05)
      monkeyRef.current.position.y += 0.4; // Offset above head
      monkeyRef.current.position.z -= 0.28; // Tiny bit forward (was -0.3)
      monkeyRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05;
    } else if (monkeyRef.current) {
      // Fallback if no head bone found
      monkeyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      monkeyRef.current.position.z = -0.15; // Also move back in fallback
    }

    if (scanlineRef.current) {
      const scanPosition = Math.sin(state.clock.elapsedTime * 0.5) * 2;
      scanlineRef.current.position.y = scanPosition;
    }
  });

  return (
    <>
      <group ref={modelRef} position={[0, -1.8, 0]} scale={1.2}>
        <primitive object={scene} />
      </group>
      
      {/* Monkey head is now separate to follow head bone */}
      <MonkeyHead ref={monkeyRef} />

      <mesh ref={scanlineRef} position={[0, 0, 0]}>
        <planeGeometry args={[10, 0.02]} />
        <meshBasicMaterial 
          color="#00ff00" 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

    </>
  );
}


export default function ModelViewer() {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative rounded-xl md:rounded-2xl overflow-hidden bg-black/50 backdrop-blur-md electric-border shadow-[0_0_50px_rgba(0,255,255,0.3)]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={['#000']} />
        
        {/* EXACT same lighting as mobile */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
        
        {/* Removed all post-processing effects to match mobile exactly */}
      </Canvas>
      
      <div className="absolute top-2 left-2 md:top-4 md:left-4 text-cyan-400 font-mono text-xs md:text-sm">
        <div className="animate-pulse neon-glow">SCANNING...</div>
      </div>
      
      <div className="absolute top-2 right-2 md:top-4 md:right-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse animation-delay-100"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 text-cyan-400 font-mono text-[10px] md:text-xs">
        <div className="chrome-text">ORDINAL #001</div>
        <div className="holographic-text">FULLY RIGGED GLB</div>
      </div>
      
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4">
        <div className="text-xs text-yellow-400 font-mono">
          <span className="neon-glow">◉ REC</span>
        </div>
      </div>
    </div>
  );
}