'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useEffect, useState, useCallback, Suspense, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { Arrow, ArrowDirection, JudgmentType } from '../types';
import ArrowMesh from './ArrowMesh';
import JudgmentEffect from './JudgmentEffect';
import MonkeyHead from '../../components/MonkeyHead';


interface GameSceneProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  onUpdateScore: (update: Partial<GameScore> | ((prev: GameScore) => Partial<GameScore>)) => void;
  onEndGame: () => void;
  isPlaying: boolean;
  onGaugeUpdate?: (level: number) => void;
  currentGauge?: number;
  songDuration?: number;
  songBPM?: number;
}

interface GameScore {
  points: number;
  combo: number;
  perfect: number;
  great: number;
  good: number;
  miss: number;
}

// Dancing Model Component with Head - Optimized
function DanceModel({ comboHeat = 0, gaugeLevel = 0 }: { comboHeat?: number; gaugeLevel?: number }) {
  const { scene, animations } = useGLTF('/Animation_Boom_Dance_withSkin (1).glb');
  const modelRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { actions, mixer } = useAnimations(animations, modelRef);
  const [headBone, setHeadBone] = useState<THREE.Bone | null>(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (mixer) {
      mixerRef.current = mixer;
      // Signal model is ready after a brief delay
      setTimeout(() => setModelReady(true), 100);
    }
  }, [mixer]);

  // Find the head/neck bone in the model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Bone) {
          // Look for head or neck bone
          if (child.name.toLowerCase().includes('head') ||
              child.name.toLowerCase().includes('neck') ||
              child.name.toLowerCase().includes('spine02') ||
              child.name.toLowerCase().includes('spine03')) {
            console.log('Found bone:', child.name);
            setHeadBone(child);
          }
        }
      });
    }
  }, [scene]);

  // Play animations - fixed to prevent duplicate calls
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const actionKeys = Object.keys(actions);
    console.log(`[DanceModel] Found ${actionKeys.length} animation(s):`, actionKeys);

    // Play first available animation
    const firstAction = actions[actionKeys[0]];
    if (firstAction) {
      // Always reset and play to ensure proper state
      firstAction.stop();
      firstAction.reset();
      firstAction.setLoop(THREE.LoopRepeat, Infinity);
      firstAction.timeScale = 0.7; // Slower dance speed
      firstAction.play();
      console.log(`[DanceModel] Playing animation: ${actionKeys[0]}`);
    }

    return () => {
      if (firstAction) {
        firstAction.stop();
        firstAction.reset();
      }
    };
  }, [actions]);

  // Optimized frame updates - only when model is ready
  useFrame((state, delta) => {
    if (!modelReady) return;

    // Update the animation mixer - THIS IS CRITICAL!
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Attach head to bone if found
    if (headBone && headRef.current && modelRef.current) {
      const worldPosition = new THREE.Vector3();
      headBone.getWorldPosition(worldPosition);

      // Convert world position to local position relative to model
      modelRef.current.worldToLocal(worldPosition);

      // Position head at bone location with adjusted offset
      // Check if position is reasonable (not at origin)
      if (worldPosition.y > 0.1) {
        headRef.current.position.copy(worldPosition);
        headRef.current.position.y += 0.28; // Raised up slightly more
        headRef.current.position.z -= 0.18; // Slightly less back offset
      }
    }

    if (modelRef.current) {
      // Smoother pulsing effect
      const pulseFactor = 1 + (Math.sin(state.clock.elapsedTime * 6) * 0.03 * comboHeat);
      modelRef.current.scale.set(2 * pulseFactor, 2 * pulseFactor, 2 * pulseFactor);

      // Enhanced rotation effect
      if (comboHeat > 0.3) {
        modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.08 * comboHeat;
      }
    }
  });

  return (
    <group ref={modelRef} position={[0, -2, -5]} scale={[2, 2, 2]}>
      <primitive object={scene} />
      {/* MonkeyHead will be positioned by bone attachment */}
      <group ref={headRef}>
        <MonkeyHead scale={[0.8, 0.8, 0.8]} />
      </group>

    </group>
  );
}

const LANE_POSITIONS = {
  left: -6,
  down: -2,
  up: 2,
  right: 6,
};

const ARROW_SPEED = {
  easy: 3,     // Was 5 - much slower for beginners
  medium: 5,   // Was 7 - what easy used to be
  hard: 7,     // Was 9 - what medium used to be
  extreme: 10, // Was 12 - still challenging but not impossible
};

// BPM will be passed from song selection

// Separate component for gauge dissipation
function GaugeDissipator({ isPlaying, gaugeLevel, updateGauge }: { isPlaying: boolean; gaugeLevel: number; updateGauge: (level: number) => void }) {
  const lastTimeRef = useRef(0);

  useFrame((state) => {
    if (!isPlaying) return;

    const currentTime = state.clock.elapsedTime;
    if (currentTime - lastTimeRef.current > 1.0) {
      const dissipationRate = 1.5;
      const newGauge = Math.max(0, gaugeLevel - dissipationRate);
      if (newGauge !== gaugeLevel) {
        updateGauge(newGauge);
      }
      lastTimeRef.current = currentTime;
    }
  });

  return null;
}

// Global flag to track active instance - DO NOT RESET IN PRODUCTION
if (typeof window !== 'undefined') {
  const win = window as any;

  // Only initialize if completely new
  if (!win.__gameSceneInitialized) {
    win.__gameSceneInitialized = true;
    win.__gameContentActive = null;
    win.__gameContentInstances = new Set();
    win.__allTimers = [];
    console.log('[GameScene Module] Initial setup complete');
  }
}

function GameContent({ difficulty, onUpdateScore, onEndGame, isPlaying, onGaugeUpdate, currentGauge = 30, songDuration = 120, songBPM = 128, renderStage = 3, sceneReady = false }: GameSceneProps & { renderStage?: number; sceneReady?: boolean }) {
  const instanceId = useRef(`gc-${Date.now()}`);
  const [isActive, setIsActive] = useState(false);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [currentJudgment, setCurrentJudgment] = useState<JudgmentType | null>(null);
  const [showJudgmentEffect, setShowJudgmentEffect] = useState(false);
  const [comboHeat, setComboHeat] = useState(0); // Heat level for visual effects
  const [localGauge, setLocalGauge] = useState(30); // Start at 30%
  const [hitLanes, setHitLanes] = useState<{ [key: string]: number }>({});
  const [totalArrowsGenerated, setTotalArrowsGenerated] = useState(0); // Track total arrows
  const totalArrowsRef = useRef(0); // Ref for immediate access in callbacks
  const gaugeLevel = localGauge; // Use local state for immediate updates
  const lastBeatRef = useRef(0);
  const gameTimeRef = useRef(0);
  const arrowIdRef = useRef(0);
  const lastGaugeUpdate = useRef(0);
  const startTimeRef = useRef(Date.now()); // Track actual start time
  const [shouldGenerateArrows, setShouldGenerateArrows] = useState(true); // Control arrow generation

  // Simple activation without complex instance tracking
  useEffect(() => {
    setIsActive(true);
    return () => {
      setIsActive(false);
    };
  }, []);

  // Helper to update gauge - with immediate effect
  const updateGauge = useCallback((newLevel: number) => {
    const clamped = Math.max(0, Math.min(100, newLevel));
    setLocalGauge(clamped); // Update local state immediately
    if (onGaugeUpdate) {
      onGaugeUpdate(clamped);
    }
    console.log(`[Gauge Update] New level: ${clamped.toFixed(1)}%`);
  }, [onGaugeUpdate]);

  // Debug logging and sync gauge
  useEffect(() => {
    console.log('[GameContent] Mounted with difficulty:', difficulty, 'isPlaying:', isPlaying, 'currentGauge:', currentGauge, 'songDuration:', songDuration);
    if (currentGauge !== undefined && currentGauge !== localGauge) {
      setLocalGauge(currentGauge);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGauge, difficulty, isPlaying, songDuration]); // Remove localGauge to prevent loops

  // Reset game state when playing status changes and scene is ready
  useEffect(() => {
    if (isPlaying && sceneReady) {
      setShouldGenerateArrows(true);
      gameTimeRef.current = 0;
      startTimeRef.current = Date.now();
      console.log('[GameContent] Game started and scene ready, arrow generation enabled');
    } else if (isPlaying && !sceneReady) {
      console.log('[GameContent] Game started but scene not ready, waiting...');
      setShouldGenerateArrows(false);
    }
  }, [isPlaying, sceneReady]);

  // Generate arrow pattern based on difficulty
  const generateArrowPattern = useCallback(() => {
    const patterns = {
      easy: ['left', 'down', 'up', 'right'] as ArrowDirection[],
      medium: ['left', 'down', 'up', 'right', 'left', 'up'] as ArrowDirection[],
      hard: ['left', 'down', 'up', 'right', 'down', 'left', 'right', 'up'] as ArrowDirection[],
      extreme: ['left', 'down', 'up', 'right', 'down', 'left', 'right', 'up', 'left', 'down'] as ArrowDirection[],
    };

    const pattern = patterns[difficulty];
    return pattern[Math.floor(Math.random() * pattern.length)] as ArrowDirection;
  }, [difficulty]);

  // Generate new arrows on beat - Simplified for stability
  useFrame((state, delta) => {
    if (!isPlaying || !sceneReady) {
      return;
    }

    try {
      gameTimeRef.current += delta * 1000;

      // Check if we should stop generating arrows (song has ended)
      const elapsedSeconds = gameTimeRef.current / 1000;
      if (songDuration > 0 && elapsedSeconds >= songDuration && shouldGenerateArrows) {
        setShouldGenerateArrows(false);
        console.log(`[GameContent] Song duration reached (${elapsedSeconds.toFixed(1)}s >= ${songDuration}s), stopping arrow generation`);
      }

      // Slowly decrease gauge over time (very gradual)
      if (gameTimeRef.current - lastGaugeUpdate.current > 3000) { // Every 3 seconds
        lastGaugeUpdate.current = gameTimeRef.current;
        const newGauge = Math.max(0, localGauge - 1); // Slower decay
        if (newGauge !== localGauge) {
          updateGauge(newGauge);
        }
      }


  // Generate arrows on beat based on song BPM (only if we should still generate)
      const beatInterval = (60000 / songBPM) / (difficulty === 'extreme' ? 2 : difficulty === 'hard' ? 1.5 : 1);
      if (shouldGenerateArrows && gameTimeRef.current - lastBeatRef.current >= beatInterval) {
        lastBeatRef.current = gameTimeRef.current;

        const arrowId = arrowIdRef.current++;
        const newArrow: Arrow = {
          id: `arrow-${arrowId}`,
          direction: generateArrowPattern(),
          position: 15, // Start closer
          targetTime: gameTimeRef.current + (15 / ARROW_SPEED[difficulty]) * 1000,
          speed: ARROW_SPEED[difficulty],
          hit: false,
        };

        setArrows(prev => {
          // Limit number of arrows to prevent memory issues
          if (prev.length > 50) {
            console.warn('[GameContent] Too many arrows, cleaning up old ones');
            return [...prev.slice(-30), newArrow];
          }
          return [...prev, newArrow];
        });

        // Track total arrows generated
        setTotalArrowsGenerated(prev => {
          const newTotal = prev + 1;
          totalArrowsRef.current = newTotal; // Update ref for immediate access
          console.log(`[Arrow Generated] Arrow #${arrowId} (Total: ${newTotal}) - ${newArrow.direction} at ${(gameTimeRef.current/1000).toFixed(1)}s`);
          return newTotal;
        });
      }

      // Update arrow positions
      setArrows(prev => {
        try {
          const updated = prev.map(arrow => {
            if (arrow.hit) return arrow;

            const newPosition = arrow.position - (ARROW_SPEED[difficulty] * delta);

            // Check if arrow missed the target zone (well past the hit zone)
            // Hit zone is at position 0 with tolerance ±2.5, so auto-miss at -3.5
            // IMPORTANT: Only trigger miss ONCE by marking arrow as hit
            if (newPosition < -3.5 && !arrow.hit) {
              console.log(`[Auto-Miss] Arrow #${arrow.id} passed without hit - Direction: ${arrow.direction}`);
              // Mark as hit FIRST to prevent duplicate miss counts
              const missedArrow = { ...arrow, position: newPosition, hit: true, judgment: 'miss' as JudgmentType };

              // Update score ONCE
              onUpdateScore({
                miss: 1,
                combo: 0
              });
              showJudgment('miss');

              // Decrease gauge on auto-miss
              const newGauge = Math.max(0, localGauge - 5);
              updateGauge(newGauge);

              return missedArrow;
            }

            return { ...arrow, position: newPosition };
          });

          // Remove arrows well after they pass the target zone
          return updated.filter(arrow => arrow.position > -5);
        } catch (error) {
          console.error('[GameContent] Error updating arrows:', error);
          return prev;
        }
      });
    } catch (error) {
      console.error('[GameContent] Frame update error:', error);
    }
  });

  const showJudgment = (judgment: JudgmentType, lane?: ArrowDirection) => {
    setCurrentJudgment(judgment);
    setShowJudgmentEffect(true);

    // Light up the hit lane if successful
    if (lane && judgment !== 'miss') {
      setHitLanes(prev => ({ ...prev, [lane]: Date.now() }));
    }
    setTimeout(() => {
      setShowJudgmentEffect(false);
      setCurrentJudgment(null);
    }, 500);
  };

  const handleArrowHit = useCallback((direction: ArrowDirection) => {
    // Process all hits when playing
    if (!isPlaying) return;

    setArrows(prev => {
      let hitFound = false;
      const updated = prev.map(arrow => {
        // Skip if arrow already hit or we already found a hit this frame
        if (arrow.hit || hitFound) return arrow;

        // Check if arrow is in the hit zone
        const distance = Math.abs(arrow.position);

        // If arrow is in hit zone and matches direction
        if (distance <= 2.5 && arrow.direction === direction) {
          hitFound = true; // Prevent hitting multiple arrows at once
          let judgment: JudgmentType;
          let points = 0;

          // More lenient timing windows for easier difficulties
          const perfectWindow = difficulty === 'easy' ? 1.0 : difficulty === 'medium' ? 0.7 : 0.5;
          const greatWindow = difficulty === 'easy' ? 1.8 : difficulty === 'medium' ? 1.3 : 1.0;
          const goodWindow = difficulty === 'easy' ? 2.5 : difficulty === 'medium' ? 2.0 : 1.8;

          if (distance <= perfectWindow) {
            judgment = 'perfect';
            points = 100;
          } else if (distance <= greatWindow) {
            judgment = 'great';
            points = 70;
          } else if (distance <= goodWindow) {
            judgment = 'good';
            points = 40;
          } else {
            judgment = 'miss';
            points = 0;
          }

          if (judgment !== 'miss') {
            onUpdateScore((prev: GameScore) => {
              const newCombo = prev.combo + 1;
              // Calculate heat level based on combo
              const heat = Math.min(1, newCombo / 50); // Max heat at 50 combo
              setComboHeat(heat);

              // Update gauge based on judgment AND combo multiplier
              let gaugeChange = 0;
              if (judgment === 'perfect') gaugeChange = 6;
              else if (judgment === 'great') gaugeChange = 4;
              else if (judgment === 'good') gaugeChange = 2;

              // Add combo bonus to gauge increase
              if (newCombo > 10) gaugeChange += 1;
              if (newCombo > 25) gaugeChange += 1;
              if (newCombo > 50) gaugeChange += 2;

              const newGauge = Math.min(100, localGauge + gaugeChange);
              updateGauge(newGauge);

              console.log(`[Hit Tracked] ${judgment.toUpperCase()} - Points: ${points}, Combo: ${newCombo}, Gauge: ${localGauge} -> ${newGauge}`);

              return {
                points: prev.points + points,
                [judgment]: 1,  // Return increment only, not the total
                combo: newCombo
              };
            });
          } else {
            onUpdateScore({
              miss: 1,
              combo: 0
            });
            setComboHeat(0);

            // Decrease gauge on miss - using localGauge
            const newGauge = Math.max(0, localGauge - 8);
            updateGauge(newGauge);
            console.log(`[Hit Tracked] MISS - Combo reset, Gauge: ${localGauge} -> ${newGauge}`);
          }

          showJudgment(judgment, arrow.direction);
          return { ...arrow, hit: true, judgment };
        }

        return arrow;
      });

      // If no arrow was hit, check if there was any arrow in the hit zone
      // If yes, it means player pressed wrong key = miss
      if (!hitFound) {
        const arrowsInZone = prev.filter(arrow =>
          !arrow.hit && Math.abs(arrow.position) <= 2.5
        );

        if (arrowsInZone.length > 0) {
          console.log(`[Wrong Key] Player pressed ${direction} but arrows in zone are:`,
                      arrowsInZone.map(a => a.direction).join(', '));

          // Player pressed wrong key while arrow was in zone = miss
          // Mark the closest arrow as missed
          const closestArrow = arrowsInZone.reduce((closest, arrow) =>
            Math.abs(arrow.position) < Math.abs(closest.position) ? arrow : closest
          );

          // Find and mark the closest arrow as hit/missed
          const finalUpdated = updated.map(arrow => {
            if (arrow.id === closestArrow.id && !arrow.hit) {
              console.log(`[Wrong Key Miss] Marking arrow #${arrow.id} (${arrow.direction}) as missed`);
              return { ...arrow, hit: true, judgment: 'miss' as JudgmentType };
            }
            return arrow;
          });

          onUpdateScore({
            miss: 1,
            combo: 0
          });
          showJudgment('miss');
          setComboHeat(0);

          // Small gauge penalty for wrong key
          const newGauge = Math.max(0, localGauge - 3);
          updateGauge(newGauge);

          return finalUpdated;
        }
      }

      return updated;
    });
  }, [onUpdateScore, localGauge, updateGauge, difficulty, isPlaying]);

  // Keyboard input handling with repeat prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      // Prevent key repeat from causing multiple hits
      if (e.repeat) return;

      const keyMap: { [key: string]: ArrowDirection } = {
        'ArrowLeft': 'left',
        'ArrowDown': 'down',
        'ArrowUp': 'up',
        'ArrowRight': 'right',
        'a': 'left',
        's': 'down',
        'w': 'up',
        'd': 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        e.stopPropagation();
        handleArrowHit(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isPlaying, handleArrowHit]);

  // End game based on song duration
  useEffect(() => {
    if (isPlaying && songDuration) {
      // Use actual song duration with small buffer
      const timer = setTimeout(() => {
        // Log final stats
        const remainingArrows = arrows.filter(a => !a.hit).length;
        console.log(`[GameContent] FINAL STATS:`);
        console.log(`  - Total arrows generated: ${totalArrowsRef.current}`);
        console.log(`  - Remaining unhit arrows: ${remainingArrows}`);
        console.log(`  - Song duration: ${songDuration} seconds`);
        onEndGame();
      }, (songDuration + 2) * 1000); // Add 2 second buffer for audio delay
      return () => clearTimeout(timer);
    }
  }, [isPlaying, onEndGame, songDuration, arrows]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear arrows when component unmounts
      setArrows([]);
    };
  }, []);

  return (
    <>
      {/* Simple dance floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[30, 40]} />
        <meshBasicMaterial color="#0a0a1e" />
      </mesh>


      {/* Target zones with hit lighting */}
      {Object.entries(LANE_POSITIONS).map(([direction, x]) => {
        const color = direction === 'left' ? '#ff00ff' :
                     direction === 'down' ? '#00ffff' :
                     direction === 'up' ? '#ffff00' : '#00ff00';

        // Check if this lane was recently hit
        const wasHit = hitLanes[direction] && (Date.now() - hitLanes[direction] < 300);

        return (
          <group key={direction} position={[x, -2.5, 0]}>
            {/* Target zone ring - simple */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.0, 1.5, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={wasHit ? 0.9 : 0.6}
              />
            </mesh>

            {/* Proper directional arrow indicator on the pad */}
            <group position={[0, -2.48, 0]}>
              {direction === 'left' && (
                <group>
                  <mesh position={[0.2, 0, 0]}>
                    <boxGeometry args={[0.4, 0.1, 0.02]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                  <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.2, 0.3, 3]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                </group>
              )}
              {direction === 'right' && (
                <group>
                  <mesh position={[-0.2, 0, 0]}>
                    <boxGeometry args={[0.4, 0.1, 0.02]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                  <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.2, 0.3, 3]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                </group>
              )}
              {direction === 'up' && (
                <group>
                  <mesh position={[0, -0.2, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.02]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                  <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.2, 0.3, 3]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                </group>
              )}
              {direction === 'down' && (
                <group>
                  <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[0.1, 0.4, 0.02]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                  <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.2, 0.3, 3]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
                  </mesh>
                </group>
              )}
            </group>

            {/* Outer glow ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.7, 24]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        );
      })}

      {/* Render arrows - simplified without effects */}
      {arrows.map(arrow => {
        try {
          const laneX = LANE_POSITIONS[arrow.direction];
          if (laneX === undefined) {
            console.error('[GameContent] Invalid arrow direction:', arrow.direction);
            return null;
          }
          return (
            <ArrowMesh
              key={arrow.id}
              arrow={arrow}
              laneX={laneX}
              gaugeLevel={gaugeLevel}
            />
          );
        } catch (error) {
          console.error('[GameContent] Error rendering arrow:', arrow.id, error);
          return null;
        }
      })}

      {/* Dancing Model with progressive loading */}
      {renderStage >= 1 && (
        <Suspense fallback={null}>
          <DanceModel comboHeat={comboHeat} gaugeLevel={gaugeLevel} />
        </Suspense>
      )}



      {/* Judgment effect */}
      {showJudgmentEffect && currentJudgment && (
        <JudgmentEffect judgment={currentJudgment} />
      )}

      {/* Progressive lighting system */}
      <ambientLight intensity={renderStage >= 1 ? 0.4 : 0.3} />
      {renderStage >= 1 && (
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.7}
          color="#ffffff"
          castShadow={renderStage >= 2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}
      {renderStage >= 2 && (
        <>
          <pointLight position={[0, 5, 0]} intensity={0.4} color="#4488ff" />
          <pointLight position={[-5, 3, -5]} intensity={0.2} color="#ff8844" />
        </>
      )}
    </>
  );
}

// Preload the model
useGLTF.preload('/Animation_Boom_Dance_withSkin (1).glb');

// Initialize countdown state only once
if (typeof window !== 'undefined') {
  const win = window as any;

  if (!win.__gameSceneInitialized2) {
    win.__gameSceneInitialized2 = true;
    win.__countdownTimers = [];
    win.__countdownState = new Map();
    console.log('[GameScene Module] Countdown state initialized');
  }
}

function GameScene(props: GameSceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const [renderStage] = useState(3); // Start at full quality to prevent changes
  const [countdown, setCountdown] = useState<number | null>(null);
  const [fullyReady, setFullyReady] = useState(false);
  const gameInstanceId = useRef(Math.random().toString(36).substr(2, 9));
  const [, setHasStartedCountdown] = useState(false);
  const contextRecoveryTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Clean up everything ONLY on actual page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const win = window as any;
      // Clear all timers
      if (win.__countdownTimers) {
        win.__countdownTimers.forEach((timer: NodeJS.Timeout) => clearInterval(timer));
        win.__countdownTimers = [];
      }
      // Clear all state
      win.__countdownState?.clear();
      win.__gameContentActive = null;
      win.__gameContentInstances?.clear();
      // Reset initialization flags so state gets cleared on next page load
      win.__gameSceneInitialized = false;
      win.__gameSceneInitialized2 = false;
      console.log('[GameScene] Page actually unloading (beforeunload), cleared all state and reset init flags');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // DO NOT call handleBeforeUnload on unmount - only on actual page unload!
      // This was causing the WebGL context to be lost during re-renders
    };
  }, []);

  // Initialize countdown state for this instance
  useEffect(() => {
    const instanceId = gameInstanceId.current;
    const win = window as any;
    const countdownState = win.__countdownState || new Map();

    if (!countdownState.has(instanceId)) {
      countdownState.set(instanceId, { active: false, timer: null });
    }

    // Cleanup on unmount
    return () => {
      const state = countdownState.get(instanceId);
      if (state?.timer) {
        clearInterval(state.timer);
        // Remove from global timers array
        const idx = win.__countdownTimers?.indexOf(state.timer);
        if (idx !== undefined && idx > -1 && win.__countdownTimers) {
          win.__countdownTimers.splice(idx, 1);
        }
      }
      countdownState.delete(instanceId);
    };
  }, []);

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault(); // Prevent default browser handling
    console.log('[GameScene] WebGL context lost, preventing page refresh');
    setContextLost(true);

    // Clear any existing recovery timeout
    if (contextRecoveryTimeout.current) {
      clearTimeout(contextRecoveryTimeout.current);
    }

    // Don't auto-recover, let user control
    contextRecoveryTimeout.current = setTimeout(() => {
      console.log('[GameScene] Context can be restored');
      setContextLost(false);
    }, 2000);
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log('[GameScene] WebGL context restored');
    setContextLost(false);

    // Clear recovery timeout if it exists
    if (contextRecoveryTimeout.current) {
      clearTimeout(contextRecoveryTimeout.current);
      contextRecoveryTimeout.current = undefined;
    }
  }, []);

  // Memoize Canvas gl config - MUST BE STABLE to prevent context loss
  const glConfig = useMemo(() => ({
    antialias: true, // Always use antialiasing, don't change based on renderStage
    alpha: false,
    powerPreference: "high-performance" as WebGLPowerPreference,
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: false,
    stencil: false,
    depth: true
  }), []); // Empty deps - never changes!

  // Memoize camera config
  const cameraConfig = useMemo(() => ({
    position: [0, 5, 10] as [number, number, number],
    fov: 60
  }), []);

  // Progressive enhancement with loading feedback and countdown
  useEffect(() => {
    const instanceId = gameInstanceId.current;
    const win = window as any;

    // Initialize countdownState if not exists
    if (!win.__countdownState) {
      win.__countdownState = new Map();
    }

    const countdownState = win.__countdownState;
    let state = countdownState.get(instanceId);

    // Initialize state for this instance if not exists
    if (!state) {
      state = { active: false, timer: null, hasStarted: false };
      countdownState.set(instanceId, state);
    }

    console.log(`[GameScene-${instanceId}] useEffect triggered, isPlaying: ${props.isPlaying}, state.hasStarted: ${state.hasStarted}`);

    if (!props.isPlaying) {
      console.log(`[GameScene-${instanceId}] Game stopped, cleaning up...`);
      // Reset states when not playing (but keep renderStage stable)
      // Don't change renderStage to prevent WebGL context changes
      setFullyReady(false);
      setCountdown(null);

      // Clear countdown for this instance
      if (state.timer) {
        console.log(`[GameScene-${instanceId}] Clearing countdown timer`);
        clearInterval(state.timer);
        state.timer = null;
      }

      // Reset the state but keep it in the map
      state.active = false;
      state.hasStarted = false;
      countdownState.set(instanceId, state);
      setHasStartedCountdown(false);

      return;
    }

    // Check the persistent state, not React state
    if (state.hasStarted && props.isPlaying) {
      console.log(`[GameScene-${instanceId}] Countdown already started for this instance (persistent state), setting fully ready`);
      // If we've already done countdown, just set fully ready
      setFullyReady(true);
      setHasStartedCountdown(true);
      return;
    }

    // Start loading sequence immediately when game starts
    console.log(`[GameScene-${instanceId}] Starting loading sequence for first time...`);

    // RenderStage is already 3, don't change it
    // Skip progressive loading to prevent WebGL context changes
    const timers: NodeJS.Timeout[] = [];

    // Just handle countdown after a brief delay
    const startTimer = setTimeout(() => {
      console.log(`[GameScene-${instanceId}] Scene ready...`);

      // Double-check state hasn't changed
      state = countdownState.get(instanceId);

      // Start countdown after fully loaded - but only once per instance ever
      if (state && !state.hasStarted) {
        console.log(`[GameScene-${instanceId}] Starting countdown for the first time...`);
        state.hasStarted = true;  // Mark as started immediately
        setHasStartedCountdown(true);
        countdownState.set(instanceId, state);

        // Check if countdown already active for this instance
        if (state.active) {
          console.log(`[GameScene-${instanceId}] Countdown already active for this instance, skipping`);
          return;
        }

        state.active = true;
        setCountdown(3);
        console.log(`[GameScene-${instanceId}] Countdown started: 3`);
        let count = 3;

        state.timer = setInterval(() => {
          count--;
          console.log(`[GameScene-${instanceId}] Countdown: ${count}`);
          if (count > 0) {
            setCountdown(count);
          } else {
            setCountdown(null);
            setFullyReady(true);
            console.log(`[GameScene-${instanceId}] Countdown complete, game ready!`);
            if (state.timer) {
              clearInterval(state.timer);
              state.timer = null;
              state.active = false;  // Mark as not active but hasStarted remains true
              countdownState.set(instanceId, state);
            }
          }
        }, 1000);

        // Track timer globally
        if (!win.__countdownTimers) {
          win.__countdownTimers = [];
        }
        win.__countdownTimers.push(state.timer);
      }
    }, 500);

    timers.push(startTimer);

    return () => {
      console.log(`[GameScene-${instanceId}] Cleanup called`);
      timers.forEach(clearTimeout);
    };
  }, [props.isPlaying]); // Only depend on isPlaying to prevent re-runs

  // Show a recovery screen during context loss but keep the component mounted
  if (contextLost) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 100%)',
        color: '#ffffff',
        flexDirection: 'column'
      }}>
        <h2>Recovering Graphics...</h2>
        <p>Please wait a moment</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      {/* Loading overlay */}
      {(countdown !== null) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 10, 46, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'opacity 0.5s',
          opacity: countdown !== null ? 1 : 0,
          pointerEvents: countdown !== null ? 'auto' : 'none'
        }}>
          <div style={{
            color: countdown !== null ? '#ff00ff' : '#ffffff',
            fontSize: countdown !== null ? '72px' : '24px',
            marginBottom: '20px',
            fontWeight: 'bold',
            textShadow: countdown !== null
              ? '0 0 40px rgba(255, 0, 255, 0.8), 0 0 80px rgba(255, 0, 255, 0.4)'
              : '0 0 20px rgba(0, 136, 255, 0.8)',
            animation: countdown !== null ? 'pulse 1s ease-in-out' : 'none'
          }}>
            {countdown}
          </div>
          {countdown !== null && (
            <div style={{
              color: '#00ffff',
              fontSize: '18px',
              marginTop: '-10px',
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              opacity: 0.8
            }}>
              Get Ready!
            </div>
          )}
        </div>
      )}
      <Canvas
        key="game-canvas" // Add key to prevent recreation
        camera={cameraConfig}
        gl={glConfig}
        style={{ background: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 100%)' }}
        dpr={Math.min(window.devicePixelRatio, 2)}  // Set stable DPR from start
        onCreated={({ gl }) => {
          // Add context loss/restore handlers with options
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
          gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

          // Set WebGL settings once - don't change based on renderStage
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        {/* Progressive stars with better visuals */}
        {renderStage >= 1 && (
          <Stars
            radius={100}
            depth={50}
            count={renderStage === 1 ? 100 : renderStage === 2 ? 300 : 800}
            factor={4}
            saturation={0.5}
            fade={renderStage >= 2}
            speed={0.5}
          />
        )}

        {/* Enhanced fog for depth */}
        {renderStage >= 2 && (
          <fog attach="fog" args={['#0a0a2e', 8, 60]} />
        )}

        <GameContent {...props} renderStage={renderStage} sceneReady={fullyReady} />
      <GaugeDissipator isPlaying={props.isPlaying} gaugeLevel={props.currentGauge || 30} updateGauge={props.onGaugeUpdate || (() => {})} />
        {/* Disable quality adjustment to prevent WebGL context changes
        <GamePerformanceMonitor
          showStats={false}
          onQualityAdjust={(quality) => {
            // Don't change renderStage based on performance
            // This was causing WebGL context loss!
            console.log(`[Performance] Would switch to ${quality} quality but disabled to prevent context loss`);
          }}
        />
        */}
      </Canvas>
    </div>
  );
}

export default memo(GameScene);