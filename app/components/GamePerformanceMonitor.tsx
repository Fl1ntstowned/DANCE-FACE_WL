'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

interface PerformanceStats {
  fps: number;
  avgFps: number;
  drops: number;
}

export function useGamePerformance() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    avgFps: 60,
    drops: 0
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const dropCount = useRef(0);

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const delta = currentTime - lastTime.current;

    // Update FPS every 10 frames
    if (frameCount.current % 10 === 0) {
      const fps = Math.round(1000 / (delta / 10));
      fpsHistory.current.push(fps);

      // Keep only last 30 samples
      if (fpsHistory.current.length > 30) {
        fpsHistory.current.shift();
      }

      // Count drops below 30 FPS
      if (fps < 30) {
        dropCount.current++;
      }

      // Calculate average
      const avgFps = Math.round(
        fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
      );

      setStats({
        fps,
        avgFps,
        drops: dropCount.current
      });

      lastTime.current = currentTime;
      frameCount.current = 0;
    }
  });

  return stats;
}

interface GamePerformanceMonitorProps {
  onQualityAdjust?: (quality: 'low' | 'medium' | 'high') => void;
  showStats?: boolean;
}

export default function GamePerformanceMonitor({
  onQualityAdjust,
  showStats = false
}: GamePerformanceMonitorProps) {
  const stats = useGamePerformance();
  const lastAdjustTime = useRef(0);

  useEffect(() => {
    // Auto-adjust quality based on performance
    const now = Date.now();
    if (onQualityAdjust && now - lastAdjustTime.current > 5000) {
      if (stats.avgFps < 30 && stats.drops > 5) {
        onQualityAdjust('low');
        console.log('[Performance] Switching to low quality - FPS:', stats.avgFps);
        lastAdjustTime.current = now;
      } else if (stats.avgFps < 45 && stats.drops > 2) {
        onQualityAdjust('medium');
        console.log('[Performance] Switching to medium quality - FPS:', stats.avgFps);
        lastAdjustTime.current = now;
      } else if (stats.avgFps > 55 && stats.drops === 0) {
        onQualityAdjust('high');
        console.log('[Performance] Switching to high quality - FPS:', stats.avgFps);
        lastAdjustTime.current = now;
      }
    }
  }, [stats, onQualityAdjust]);

  if (!showStats) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: stats.avgFps < 30 ? '#ff4444' : stats.avgFps < 45 ? '#ffaa44' : '#44ff44',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      <div>FPS: {stats.fps}</div>
      <div>AVG: {stats.avgFps}</div>
      <div>DROPS: {stats.drops}</div>
    </div>
  );
}