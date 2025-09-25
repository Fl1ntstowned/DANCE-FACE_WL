'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import AdminPanel from './components/AdminPanel';
import RhythmMeter from './components/RhythmMeter';
import PerformanceMonitor from './components/PerformanceMonitor';
import './ddr-effects.css';
import './mobile-optimizations.css';

const ModelViewer = dynamic(() => import('./components/ModelViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-black/50 rounded-xl md:rounded-2xl animate-pulse flex items-center justify-center text-cyan-400 text-sm md:text-base">Loading 3D Model...</div>
});

const MobileModelViewer = dynamic(() => import('./components/MobileModelViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] sm:h-[350px] bg-black/50 rounded-xl animate-pulse flex items-center justify-center text-cyan-400 text-sm">Loading 3D Model...</div>
});

export default function Home() {
  const deviceInfo = useDeviceDetection();
  const [requestType, setRequestType] = useState<'individual' | 'community'>('individual');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Set initial volume
    if (audioRef.current) {
      audioRef.current.volume = 0.7; // Increased to 70% volume
    }

    // Add click listener to start music on first interaction
    const handleFirstClick = () => {
      if (!hasUserInteracted && audioRef.current) {
        audioRef.current.play().then(() => {
          console.log('Music started playing');
          setHasUserInteracted(true);
        }).catch(error => {
          console.error('Failed to play audio:', error);
        });
      }
    };

    // Try autoplay first
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setHasUserInteracted(true);
      }).catch(() => {
        // If autoplay fails, wait for user interaction
        console.log('Autoplay blocked, waiting for user interaction');
        document.addEventListener('click', handleFirstClick);
        document.addEventListener('touchstart', handleFirstClick);
      });
    }

    return () => {
      document.removeEventListener('click', handleFirstClick);
      document.removeEventListener('touchstart', handleFirstClick);
    };
  }, [hasUserInteracted]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.7; // Match the increased volume
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };


  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <main className="min-h-screen bg-black overflow-x-hidden relative scanlines tv-static">
      {/* Performance Monitor for Development */}
      {deviceInfo.isMobile && <PerformanceMonitor />}
      
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src="/Untitled video - Made with Clipchamp.m4a"
        loop
      />

      {/* Click to Play Music Prompt - DDR Style */}
      <AnimatePresence>
        {!hasUserInteracted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.1) 2px,
                  rgba(0, 255, 255, 0.1) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 0, 255, 0.1) 2px,
                  rgba(255, 0, 255, 0.1) 4px
                )
              `
            }}
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().then(() => {
                  setHasUserInteracted(true);
                }).catch(error => {
                  console.error('Failed to play audio:', error);
                });
              }
            }}
          >
            <div className="relative">
              {/* Rotating arrows around the button */}
              <div className="absolute inset-0 animate-spin-slow">
                <span className="absolute -top-16 left-1/2 -translate-x-1/2 text-5xl text-yellow-400 text-3d">↑</span>
                <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-5xl text-cyan-400 text-3d">↓</span>
                <span className="absolute top-1/2 -left-16 -translate-y-1/2 text-5xl text-pink-500 text-3d">←</span>
                <span className="absolute top-1/2 -right-16 -translate-y-1/2 text-5xl text-green-400 text-3d">→</span>
              </div>
              
              <div className="relative text-center p-12 electric-border bg-black/90" 
                   style={{
                     background: 'linear-gradient(145deg, rgba(0,0,0,0.95), rgba(20,0,40,0.95))',
                     boxShadow: '0 0 100px rgba(0,255,255,0.5), inset 0 0 50px rgba(255,0,255,0.2)'
                   }}>
                
                {/* Japanese text corners */}
                <span className="absolute top-2 left-2 text-pink-500 font-bold text-xl neon-glow">音楽</span>
                <span className="absolute top-2 right-2 text-cyan-400 font-bold text-xl neon-glow">開始</span>
                <span className="absolute bottom-2 left-2 text-yellow-400 font-bold text-xl neon-glow">準備</span>
                <span className="absolute bottom-2 right-2 text-green-400 font-bold text-xl neon-glow">完了</span>
                
                {/* Main content */}
                <div className="mb-6">
                  <div className="text-yellow-400 text-sm font-mono mb-2 chrome-text">PRESS START</div>
                  <div className="flex justify-center gap-2 mb-4">
                    <span className="text-6xl animate-pulse text-pink-500 text-3d">♪</span>
                    <span className="text-6xl animate-pulse animation-delay-200 text-cyan-400 text-3d">♫</span>
                    <span className="text-6xl animate-pulse animation-delay-400 text-yellow-400 text-3d">♪</span>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="chrome-animated text-3d-title inline-block">START</span>
                  <span className="holographic-text text-3d-title inline-block ml-3">MUSIC</span>
                </h2>
                
                <div className="flex justify-center gap-4 mb-4">
                  <div className="text-green-400 neon-glow">
                    <span className="text-xs">PERFECT</span>
                    <div className="text-2xl font-bold">100%</div>
                  </div>
                  <div className="text-yellow-400 neon-glow">
                    <span className="text-xs">GREAT</span>
                    <div className="text-2xl font-bold">SSS</div>
                  </div>
                  <div className="text-pink-500 neon-glow">
                    <span className="text-xs">COMBO</span>
                    <div className="text-2xl font-bold">MAX</div>
                  </div>
                </div>
                
                <div className="energy-bar mb-4"></div>
                
                <p className="text-cyan-400 font-mono text-sm animate-pulse neon-glow">
                  ▶ CLICK ANYWHERE TO BEGIN ◀
                </p>
                
                {/* Difficulty stars */}
                <div className="flex justify-center gap-1 mt-4">
                  <span className="text-yellow-400 text-xl animate-pulse">★</span>
                  <span className="text-yellow-400 text-xl animate-pulse animation-delay-100">★</span>
                  <span className="text-yellow-400 text-xl animate-pulse animation-delay-200">★</span>
                  <span className="text-yellow-400 text-xl animate-pulse animation-delay-300">★</span>
                  <span className="text-yellow-400 text-xl animate-pulse animation-delay-400">★</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-full p-3 hover:bg-cyan-500/20 transition-all group"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 cyber-grid">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
        <div className="radar-sweep"></div>
      </div>
      
      {/* Floating Particles - Only on desktop */}
      {deviceInfo.isDesktop && (
        <div className="fixed inset-0 pointer-events-none z-5">
          <span className="particle text-4xl" style={{left: '10%', animationDelay: '0s', color: '#00ffff'}}>◆</span>
          <span className="particle text-3xl" style={{left: '20%', animationDelay: '1s', color: '#ff00ff'}}>●</span>
          <span className="particle text-5xl" style={{left: '30%', animationDelay: '2s', color: '#ffff00'}}>★</span>
          <span className="particle text-4xl" style={{left: '40%', animationDelay: '3s', color: '#00ff00'}}>▲</span>
          <span className="particle text-3xl" style={{left: '50%', animationDelay: '4s', color: '#ff00ff'}}>◆</span>
          <span className="particle text-5xl" style={{left: '60%', animationDelay: '5s', color: '#00ffff'}}>●</span>
          <span className="particle text-4xl" style={{left: '70%', animationDelay: '6s', color: '#ffff00'}}>★</span>
          <span className="particle text-3xl" style={{left: '80%', animationDelay: '7s', color: '#00ff00'}}>▲</span>
          <span className="particle text-5xl" style={{left: '90%', animationDelay: '8s', color: '#ff00ff'}}>◆</span>
        </div>
      )}

      {/* DDR Arrow Rain Left - Only on desktop */}
      {deviceInfo.isDesktop && (
        <div className="fixed left-12 md:left-20 lg:left-28 top-0 h-full w-12 overflow-hidden z-10 pointer-events-none">
          <div className="arrow-rain">
            <span className="arrow-fall" style={{animationDelay: '0s'}}>↓</span>
            <span className="arrow-fall" style={{animationDelay: '0.5s'}}>←</span>
            <span className="arrow-fall" style={{animationDelay: '1s'}}>↑</span>
            <span className="arrow-fall" style={{animationDelay: '1.5s'}}>→</span>
            <span className="arrow-fall" style={{animationDelay: '2s'}}>↓</span>
            <span className="arrow-fall" style={{animationDelay: '2.5s'}}>↑</span>
            <span className="arrow-fall" style={{animationDelay: '3s'}}>←</span>
            <span className="arrow-fall" style={{animationDelay: '3.5s'}}>→</span>
          </div>
        </div>
      )}

      {/* DDR Style Left Side Japanese Text - Hidden on mobile */}
      <div className="hidden md:flex fixed left-8 md:left-12 lg:left-16 top-0 h-full w-16 md:w-24 lg:w-32 flex-col items-center justify-center z-20 pointer-events-none">
        <div className="writing-vertical text-3d text-cyan-400 text-3xl md:text-4xl lg:text-5xl font-black animate-float neon-glow">
          ダンス
        </div>
        <div className="writing-vertical text-3d text-pink-500 text-3xl md:text-4xl lg:text-5xl font-black mt-6 animate-float animation-delay-200 neon-glow">
          フェイス
        </div>
        <div className="writing-vertical text-3d text-yellow-400 text-2xl md:text-3xl lg:text-4xl font-black mt-6 animate-float animation-delay-400 neon-glow">
          革命的
        </div>
      </div>

      {/* DDR Arrow Rain Right - Only on desktop */}
      {deviceInfo.isDesktop && (
        <div className="fixed right-12 md:right-20 lg:right-28 top-0 h-full w-12 overflow-hidden z-10 pointer-events-none">
          <div className="arrow-rain">
            <span className="arrow-fall" style={{animationDelay: '0.3s'}}>↑</span>
            <span className="arrow-fall" style={{animationDelay: '0.8s'}}>→</span>
            <span className="arrow-fall" style={{animationDelay: '1.3s'}}>↓</span>
            <span className="arrow-fall" style={{animationDelay: '1.8s'}}>←</span>
            <span className="arrow-fall" style={{animationDelay: '2.3s'}}>↑</span>
            <span className="arrow-fall" style={{animationDelay: '2.8s'}}>↓</span>
            <span className="arrow-fall" style={{animationDelay: '3.3s'}}>→</span>
            <span className="arrow-fall" style={{animationDelay: '3.8s'}}>←</span>
          </div>
        </div>
      )}

      {/* DDR Style Right Side Japanese Text - Hidden on mobile */}
      <div className="hidden md:flex fixed right-8 md:right-12 lg:right-16 top-0 h-full w-16 md:w-24 lg:w-32 flex-col items-center justify-center z-20 pointer-events-none">
        <div className="writing-vertical text-3d text-pink-500 text-3xl md:text-4xl lg:text-5xl font-black animate-float neon-glow">
          序数
        </div>
        <div className="writing-vertical text-3d text-cyan-400 text-3xl md:text-4xl lg:text-5xl font-black mt-6 animate-float animation-delay-200 neon-glow">
          顔面
        </div>
        <div className="writing-vertical text-3d text-green-400 text-2xl md:text-3xl lg:text-4xl font-black mt-6 animate-float animation-delay-400 neon-glow">
          遊戯
        </div>
      </div>


      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* DDR Score/Combo Style Display */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-yellow-400 font-bold text-lg md:text-xl neon-glow">
              <span className="text-xs chrome-text">SCORE</span>
              <div className="text-2xl md:text-3xl holographic-text">999999</div>
            </div>
            <div className="text-pink-500 font-bold text-lg md:text-xl neon-glow">
              <span className="text-xs chrome-text">COMBO</span>
              <div className="text-2xl md:text-3xl animate-pulse holographic-text">MAX!</div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 relative inline-block perspective-1000">
            <span className="chrome-animated text-3d-title inline-block mr-4 glitch-text" data-text="DANCE">
              DANCE
            </span>
            <span className="holographic-text text-3d-title inline-block animate-float-slow animation-delay-500">
              FACE
            </span>
            <div className="absolute -top-6 -right-6 text-yellow-400 text-3xl animate-spin-slow text-3d">✦</div>
            <div className="absolute -bottom-6 -left-6 text-pink-500 text-3xl animate-spin-slow animation-delay-200 text-3d">♫</div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 text-green-400 text-2xl animate-bounce text-3d">✨</div>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-green-400 text-xl animate-pulse neon-glow">◀</span>
            <p className="chrome-text text-sm md:text-lg lg:text-xl font-mono px-4 py-2 text-center electric-border rounded-lg">
              A DANCE REVOLUTION ORDINAL COLLECTION | HYBRID CODE
            </p>
            <span className="text-green-400 text-xl animate-pulse neon-glow">▶</span>
          </div>
          
          {/* Energy Bar */}
          <div className="w-64 mx-auto mt-4 mb-4">
            <div className="energy-bar"></div>
          </div>
          
          {/* DDR Difficulty Stars */}
          <div className="flex justify-center gap-1 mt-2">
            <span className="text-yellow-400 text-xl text-3d animate-pulse-slow">★</span>
            <span className="text-yellow-400 text-xl text-3d animate-pulse-slow animation-delay-100">★</span>
            <span className="text-yellow-400 text-xl text-3d animate-pulse-slow animation-delay-200">★</span>
            <span className="text-yellow-400 text-xl text-3d animate-pulse-slow animation-delay-300">★</span>
            <span className="text-yellow-400 text-xl text-3d animate-pulse-slow animation-delay-400">★</span>
            <span className="text-gray-600 text-xl">★</span>
            <span className="text-gray-600 text-xl">★</span>
            <span className="text-gray-600 text-xl">★</span>
            <span className="text-gray-600 text-xl">★</span>
            <span className="text-gray-600 text-xl">★</span>
          </div>
        </motion.div>

        {/* Dance Face Revolution Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <a
            href="/dance-face-revolution"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-70 group-hover:opacity-100 animate-pulse"></div>
            <button className="relative px-8 py-4 bg-black border-2 border-transparent rounded-full font-bold text-xl uppercase tracking-wider transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                    style={{
                      background: 'linear-gradient(145deg, rgba(0,0,0,0.9), rgba(20,0,40,0.9))',
                      borderImage: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff) 1',
                      borderImageSlice: 1,
                    }}>
              <span className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🎮</span>
                <span className="bg-gradient-to-r from-pink-500 via-yellow-500 to-cyan-500 bg-clip-text text-transparent">
                  PLAY DANCE FACE REVOLUTION 69
                </span>
                <span className="text-2xl animate-bounce animation-delay-200">🎮</span>
              </span>
              <div className="absolute -top-2 -right-2 text-yellow-400 text-xl animate-spin">★</div>
              <div className="absolute -bottom-2 -left-2 text-pink-500 text-xl animate-spin animation-delay-500">♫</div>
              <div className="text-xs text-cyan-400 mt-1 text-center">
                EARN WHITELIST SPOTS • HIGH SCORES WIN
              </div>
            </button>
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {deviceInfo.isMobile ? <MobileModelViewer /> : <ModelViewer />}
            
            {/* BPM Rhythm Meter - Only on desktop */}
            {deviceInfo.isDesktop && (
              <div className="mt-6">
                <RhythmMeter />
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-6 lg:p-8 electric-border shadow-[0_0_50px_rgba(0,255,255,0.3)] perspective-card"
          >
            <div className="mb-6 lg:mb-8 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 chrome-animated">
                JOIN THE WHITELIST
              </h2>
              <p className="text-sm lg:text-base text-cyan-400/80 neon-glow">
                Reserve your spot in the DanceFace ordinals collection
              </p>
            </div>

          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-black/50 rounded-xl">
              <button
                type="button"
                onClick={() => setRequestType('individual')}
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-semibold transition-all ${
                  requestType === 'individual' 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setRequestType('community')}
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-semibold transition-all ${
                  requestType === 'community' 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                Community
              </button>
            </div>

            <AnimatePresence mode="wait">
              {requestType === 'community' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                    <div className="text-yellow-400 font-bold text-lg mb-2">
                      COMMUNITY COLLABORATIONS FULL
                    </div>
                    <p className="text-yellow-300/80 text-sm">
                      We&apos;ve reached capacity for now!
                    </p>
                    <p className="text-yellow-300/80 text-sm mt-2">
                      Stay tuned as we do have some more spots available in challenges.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-4">
              {requestType === 'individual' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <div className="text-yellow-400 font-bold text-lg mb-2">
                    INDIVIDUAL COLLABORATIONS FULL
                  </div>
                  <p className="text-yellow-300/80 text-sm">
                    We&apos;ve reached capacity for now!
                  </p>
                  <p className="text-yellow-300/80 text-sm mt-2">
                    Stay tuned as we do have some more spots available in challenges.
                  </p>
                </div>
              )}
            </div>
          </div>

            <div className="mt-6 lg:mt-8 p-4 bg-purple-900/20 rounded-xl rainbow-border">
              <h3 className="text-purple-400 font-bold mb-2 text-sm md:text-base chrome-text">PROJECT HIGHLIGHTS</h3>
              <ul className="text-gray-400 text-xs md:text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 neon-glow">▸</span>
                  First fully rigged GLB ordinal inscription
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-500 neon-glow">▸</span>
                  Hybrid code-based animation system
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400 neon-glow">▸</span>
                  On-chain dance moves
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400 neon-glow">▸</span>
                  Limited collection of unique characters
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

      </div>
      
      {/* Stage Lighting Effects */}
      <div className="fixed top-0 left-0 w-full h-32 pointer-events-none z-10">
        <div className="w-full h-full bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent animate-pulse"></div>
      </div>
      <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none z-10">
        <div className="w-full h-full bg-gradient-to-t from-pink-500/20 via-transparent to-transparent animate-pulse"></div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: upright;
          letter-spacing: 0.2em;
        }
        
        .text-3d {
          text-shadow: 
            0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25),
            0 10px 10px rgba(0,0,0,.2),
            0 20px 20px rgba(0,0,0,.15),
            0 0 40px currentColor,
            0 0 60px currentColor,
            0 0 80px currentColor;
          transform: translateZ(50px);
        }
        
        .text-3d-title {
          text-shadow: 
            0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25),
            0 10px 10px rgba(0,0,0,.2),
            0 20px 20px rgba(0,0,0,.15);
          transform-style: preserve-3d;
          transform: perspective(1000px) rotateY(-5deg) translateZ(20px);
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateZ(0) rotateX(0deg);
          }
          50% { 
            transform: translateY(-10px) translateZ(20px) rotateX(5deg);
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0) rotateY(-5deg) translateZ(20px);
          }
          50% { 
            transform: translateY(-15px) rotateY(-5deg) translateZ(40px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        @keyframes arrow-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .arrow-rain {
          position: relative;
          height: 100%;
        }
        
        .arrow-fall {
          position: absolute;
          font-size: 2rem;
          color: rgba(0, 255, 255, 0.6);
          animation: arrow-fall 8s linear infinite;
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
          filter: blur(0.5px);
        }
        
        .arrow-fall:nth-child(odd) {
          color: rgba(255, 0, 255, 0.6);
          left: 0;
        }
        
        .arrow-fall:nth-child(even) {
          color: rgba(255, 255, 0, 0.6);
          right: 0;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .arrow-box {
          background: linear-gradient(45deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4));
          border: 2px solid currentColor;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </main>
  );
}