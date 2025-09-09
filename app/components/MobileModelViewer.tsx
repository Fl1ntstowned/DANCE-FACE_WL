'use client';

import { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import MonkeyHead from './MonkeyHead';

function SimplifiedModel() {
  const { scene, animations } = useGLTF('/Animation_Boom_Dance_withSkin (1).glb');
  const modelRef = useRef<THREE.Group>(null);
  const monkeyRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, modelRef);
  const [headBone, setHeadBone] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    // Play animation at reduced speed for mobile
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.timeScale = 0.5; // Slower animation for better performance
        firstAction.play();
      }
    }

    // Find the head bone and simplify materials for mobile
    if (scene) {
      scene.traverse((child) => {
        if (child.type === 'Bone' && (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('neck'))) {
          setHeadBone(child);
        }
        
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            
            materials.forEach((mat, index) => {
              // Use simpler MeshBasicMaterial for mobile
              const simpleMat = new THREE.MeshPhongMaterial({
                color: (mat as THREE.MeshStandardMaterial).color || new THREE.Color(0xffffff),
                map: (mat as THREE.MeshStandardMaterial).map || null,
                shininess: 30,
                specular: new THREE.Color(0x111111),
              });
              
              if (Array.isArray(mesh.material)) {
                mesh.material[index] = simpleMat;
              } else {
                mesh.material = simpleMat;
              }
            });
          }
        }
      });
    }
  }, [actions, scene]);

  useFrame((state) => {
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
  });

  return (
    <>
      <group ref={modelRef} position={[0, -1.8, 0]} scale={1.2}>
        <primitive object={scene} />
      </group>
      
      {/* Monkey head to follow head bone */}
      <MonkeyHead ref={monkeyRef} />
    </>
  );
}

export default function MobileModelViewer() {
  return (
    <div className="w-full h-[300px] sm:h-[350px] relative rounded-xl overflow-hidden bg-black/50 border border-cyan-500/30">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1]} // Lower DPR for mobile
        performance={{ min: 0.5, max: 1 }} // Performance scaling
      >
        <color attach="background" args={['#000']} />
        
        {/* Minimal lighting for mobile */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 10, 5]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          <SimplifiedModel />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      <div className="absolute top-2 left-2 text-cyan-400 font-mono text-xs">
        <div>MOBILE MODE</div>
      </div>
      
      <div className="absolute bottom-2 right-2 text-cyan-400 font-mono text-[10px]">
        <div>ORDINAL #001</div>
      </div>
    </div>
  );
}