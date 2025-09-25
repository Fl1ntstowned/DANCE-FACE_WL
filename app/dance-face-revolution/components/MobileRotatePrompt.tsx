'use client';

import { useEffect, useState } from 'react';

export default function MobileRotatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as {opera?: string}).opera || '';
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isMobileScreen = window.innerWidth < 813;

      // Allow desktop mobile view for testing (check screen size only)
      const isMobile = isMobileUA || isMobileScreen;

      const isPortrait = window.innerHeight > window.innerWidth;

      setShowPrompt(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="mobile-rotate-prompt">
      <div className="rotate-icon">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="30" width="40" height="60" rx="4" stroke="#00ffff" strokeWidth="3" />
          <rect x="35" y="35" width="10" height="2" fill="#00ffff" />
          <circle cx="40" cy="83" r="3" stroke="#00ffff" strokeWidth="1" />
          <path d="M70 50 L85 50 M85 50 L80 45 M85 50 L80 55" stroke="#ff00ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>Please Rotate Your Phone</h2>
      <p>Turn your phone sideways for the best gaming experience!</p>
      <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.8 }}>
        This game is optimized for landscape mode on mobile devices.
      </p>
    </div>
  );
}