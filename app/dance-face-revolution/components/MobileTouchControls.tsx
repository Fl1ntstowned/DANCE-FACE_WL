'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowDirection } from '../types';

interface MobileTouchControlsProps {
  onArrowHit: (direction: ArrowDirection) => void;
  isPlaying: boolean;
}

export default function MobileTouchControls({ onArrowHit, isPlaying }: MobileTouchControlsProps) {
  const [activeButtons, setActiveButtons] = useState<Set<ArrowDirection>>(new Set());
  const touchTimeouts = useRef<Map<ArrowDirection, NodeJS.Timeout>>(new Map());

  const handleTouchStart = useCallback((direction: ArrowDirection) => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPlaying) return;

    // Clear any existing timeout for this button
    const existingTimeout = touchTimeouts.current.get(direction);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Add to active buttons for visual feedback
    setActiveButtons(prev => new Set(prev).add(direction));

    // Trigger the arrow hit
    onArrowHit(direction);

    // Remove active state after a short delay
    const timeout = setTimeout(() => {
      setActiveButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(direction);
        return newSet;
      });
    }, 100);

    touchTimeouts.current.set(direction, timeout);
  }, [isPlaying, onArrowHit]);

  const handleTouchEnd = useCallback(() => (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      touchTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Check if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as {opera?: string}).opera || '';
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isMobileScreen = window.innerWidth < 813;
      // Allow desktop mobile view for testing
      setIsMobile(isMobileUA || isMobileScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div className="mobile-touch-controls">
      <div className="touch-arrow-zone">
        <button
          className={`touch-arrow-button left ${activeButtons.has('left') ? 'active' : ''}`}
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleTouchEnd()}
          aria-label="Left Arrow"
        >
          ←
        </button>
      </div>
      <div className="touch-arrow-zone">
        <button
          className={`touch-arrow-button down ${activeButtons.has('down') ? 'active' : ''}`}
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleTouchEnd()}
          aria-label="Down Arrow"
        >
          ↓
        </button>
      </div>
      <div className="touch-arrow-zone">
        <button
          className={`touch-arrow-button up ${activeButtons.has('up') ? 'active' : ''}`}
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleTouchEnd()}
          aria-label="Up Arrow"
        >
          ↑
        </button>
      </div>
      <div className="touch-arrow-zone">
        <button
          className={`touch-arrow-button right ${activeButtons.has('right') ? 'active' : ''}`}
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleTouchEnd()}
          aria-label="Right Arrow"
        >
          →
        </button>
      </div>
    </div>
  );
}