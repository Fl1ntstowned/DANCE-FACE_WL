'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function RhythmMeter() {
  const [beatPhase, setBeatPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBeatPhase((prev) => (prev + 1) % 4);
    }, 500); // 120 BPM beat
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative z-30">
      <div className="flex gap-2 items-center justify-center">
        {/* Beat indicators */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: beatPhase === index ? 1.5 : 1,
              opacity: beatPhase === index ? 1 : 0.3,
            }}
            transition={{ duration: 0.1 }}
            className={`w-4 h-4 md:w-6 md:h-6 rounded-full ${
              beatPhase === index 
                ? 'bg-gradient-to-br from-cyan-400 to-pink-500 shadow-[0_0_20px_rgba(0,255,255,0.8)]' 
                : 'bg-gray-700'
            }`}
          />
        ))}
        
        {/* BPM Display */}
        <div className="ml-4 text-cyan-400 font-mono text-sm md:text-base">
          <span className="text-xs text-gray-500">BPM</span>
          <div className="text-xl font-bold chrome-text">120</div>
        </div>
        
        {/* Perfect/Great/Good indicator */}
        <motion.div
          key={beatPhase}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="ml-4"
        >
          <span className={`text-lg md:text-xl font-black ${
            beatPhase === 0 ? 'text-yellow-400 neon-glow' :
            beatPhase === 1 ? 'text-green-400 neon-glow' :
            beatPhase === 2 ? 'text-cyan-400 neon-glow' :
            'text-pink-500 neon-glow'
          }`}>
            {beatPhase === 0 ? 'PERFECT!' :
             beatPhase === 1 ? 'GREAT!' :
             beatPhase === 2 ? 'GOOD!' :
             'COOL!'}
          </span>
        </motion.div>
      </div>
      
      {/* Rhythm wave visualization */}
      <div className="mt-4 flex gap-1 items-end justify-center h-12">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: `${20 + Math.sin((beatPhase + i) * 0.5) * 30}px`,
              backgroundColor: beatPhase % 2 === 0 ? '#00ffff' : '#ff00ff',
            }}
            transition={{ duration: 0.3 }}
            className="w-1 md:w-2 rounded-full"
            style={{
              boxShadow: '0 0 10px currentColor',
            }}
          />
        ))}
      </div>
    </div>
  );
}