'use client';

import { useState, useEffect } from 'react';

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime >= lastTime + 1000) {
        const currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFps);
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    // Start measuring after a short delay
    const timeoutId = setTimeout(() => {
      setShowMonitor(true);
      measureFPS();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (!showMonitor) return null;

  const getFpsColor = () => {
    if (fps >= 50) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    return '#ff0000';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-xs font-mono p-2 rounded border border-gray-700">
      <div style={{ color: getFpsColor() }}>
        FPS: {fps}
      </div>
    </div>
  );
}