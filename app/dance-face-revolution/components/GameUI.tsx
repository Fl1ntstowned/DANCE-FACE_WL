'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameScore } from '../types';

interface GameUIProps {
  score: GameScore;
  gaugeLevel?: number;
}

export default function GameUI({ score, gaugeLevel = 30 }: GameUIProps) {
  const [showComboAnimation, setShowComboAnimation] = useState(false);
  const [previousCombo, setPreviousCombo] = useState(0);
  const [animatedGauge, setAnimatedGauge] = useState(gaugeLevel);
  const isHeatingUp = gaugeLevel > 50;
  const isMaxPower = animatedGauge >= 100;

  // Smoothly animate gauge changes
  useEffect(() => {
    setAnimatedGauge(gaugeLevel);
  }, [gaugeLevel]);

  useEffect(() => {
    if (score.combo > previousCombo && score.combo > 0) {
      setShowComboAnimation(true);
      setTimeout(() => setShowComboAnimation(false), 500);
    }
    setPreviousCombo(score.combo);
  }, [score.combo, previousCombo]);


  return (
    <div className="game-ui">
      <div className="ui-top-bar">
        {/* Score Display */}
        <motion.div
          className="score-display"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <div className="score-label">SCORE</div>
          <motion.div
            className="score-value"
            key={score.points}
            initial={{ scale: 1 }}
            animate={{ scale: [1.2, 1] }}
            transition={{ duration: 0.3 }}
          >
            {score.points.toLocaleString().padStart(8, '0')}
          </motion.div>
        </motion.div>

        {/* Combo Display */}
        <div className="combo-display">
          <AnimatePresence mode="wait">
            {score.combo > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="combo-number">{score.combo}</div>
                <div className="combo-label">COMBO</div>
                {score.combo > 10 && (
                  <motion.div
                    className="combo-fire"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {score.combo > 50 ? '🔥🔥🔥' : score.combo > 25 ? '🔥🔥' : '🔥'}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accuracy Display */}
        <div className="accuracy-display">
          <div className="accuracy-label">ACCURACY</div>
          <motion.div
            className="accuracy-value"
            animate={{
              color: score.accuracy >= 90 ? '#00ff00' :
                     score.accuracy >= 70 ? '#ffff00' :
                     score.accuracy >= 50 ? '#ff8800' : '#ff0000'
            }}
          >
            {score.accuracy.toFixed(1)}%
          </motion.div>
        </div>
      </div>

      {/* Health/Dance Gauge */}
      <div className="dance-gauge">
        <div className="gauge-container">
          <motion.div
            className="gauge-fill"
            style={{
              background: isMaxPower
                ? `linear-gradient(90deg, #ff00ff 0%, #ff69b4 20%, #00ffff 40%, #ffff00 60%, #ff00ff 80%, #ff1493 100%)`
                : animatedGauge >= 80
                ? `linear-gradient(90deg, #ff00ff 0%, #ff69b4 25%, #00ffff 50%, #00ff88 75%, #ffff00 100%)`
                : animatedGauge >= 60
                ? `linear-gradient(90deg, #00ff88 0%, #00ffff 50%, #00ff88 100%)`
                : animatedGauge >= 40
                ? `linear-gradient(90deg, #ffff00 0%, #ffcc00 50%, #ff8800 100%)`
                : animatedGauge >= 20
                ? `linear-gradient(90deg, #ff8800 0%, #ff6600 50%, #ff4400 100%)`
                : `linear-gradient(90deg, #ff0000 0%, #ff3333 50%, #ff6666 100%)`,
              boxShadow: isMaxPower ? '0 0 40px #ff00ff, 0 0 60px #ffff00, inset 0 0 30px rgba(255,255,255,0.8)' :
                        animatedGauge >= 80 ? '0 0 30px #ff00ff, inset 0 0 20px rgba(255,255,255,0.5)' :
                        animatedGauge >= 60 ? '0 0 20px #00ffff, inset 0 0 15px rgba(255,255,255,0.3)' :
                        animatedGauge >= 40 ? '0 0 15px #ffff00' : '0 0 10px currentColor'
            }}
            animate={{
              width: `${Math.max(2, animatedGauge)}%`, // Minimum 2% so it's always visible
              filter: isMaxPower ? [
                'brightness(1.2) saturate(1.5)',
                'brightness(1.5) saturate(2)',
                'brightness(1.2) saturate(1.5)',
              ] : isHeatingUp ? [
                'brightness(1)',
                'brightness(1.3)',
                'brightness(1)',
              ] : 'brightness(1)'
            }}
            transition={{
              width: { type: 'spring', stiffness: 100, damping: 15 },
              filter: { duration: isMaxPower ? 0.3 : 0.5, repeat: (isHeatingUp || isMaxPower) ? Infinity : 0 }
            }}
          />

          {/* Add gauge segments for better visibility */}
          <div className="gauge-segments">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="gauge-segment"
                style={{
                  left: `${i * 10}%`,
                  opacity: i * 10 < animatedGauge ? 0.3 : 0.1,
                  zIndex: 5
                }}
              />
            ))}
          </div>

          {/* Glow effect overlay when heating up */}
          {isHeatingUp && (
            <motion.div
              className="gauge-glow-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${Math.max(2, animatedGauge)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))',
                borderRadius: '17px',
                pointerEvents: 'none',
                zIndex: 12,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Fire effects at 100% */}
          {isMaxPower && (
            <div className="gauge-fire-container" style={{ overflow: 'visible' }}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`fire-${i}`}
                  className="gauge-fire"
                  style={{
                    position: 'absolute',
                    left: `${10 + i * 12}%`,
                    bottom: '100%',
                    width: '20px',
                    height: '30px',
                    background: `linear-gradient(180deg, transparent 0%, #ff6600 30%, #ffcc00 60%, #ffff00 100%)`,
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    filter: 'blur(2px)',
                    transformOrigin: 'bottom center',
                  }}
                  animate={{
                    y: [-5, -15, -5],
                    scaleY: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
              {/* Additional flame particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`spark-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${20 + i * 15}%`,
                    bottom: '100%',
                    fontSize: '24px',
                    filter: 'brightness(1.5)',
                  }}
                  animate={{
                    y: [-10, -40],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeOut',
                  }}
                >
                  🔥
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <div className="gauge-label">
          DANCE GAUGE {isMaxPower ? '🔥🔥🔥' : isHeatingUp ? '🔥' : ''}
          <span className="gauge-percent" style={{
            color: isMaxPower ? '#ff00ff' : animatedGauge >= 60 ? '#00ffff' : '#00ffff'
          }}> {Math.round(animatedGauge)}%</span>
        </div>
      </div>

      {/* Combo Animation Overlay */}
      <AnimatePresence>
        {showComboAnimation && score.combo > 0 && score.combo % 10 === 0 && (
          <motion.div
            className="combo-milestone"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="milestone-text">
              {score.combo >= 100 ? 'LEGENDARY!' :
               score.combo >= 50 ? 'AMAZING!' :
               score.combo >= 25 ? 'GREAT!' : 'NICE!'}
            </div>
            <div className="milestone-combo">{score.combo} COMBO!</div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .score-label, .accuracy-label, .gauge-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .score-value, .accuracy-value {
          font-size: 2rem;
          font-weight: bold;
        }

        .combo-fire {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
        }

        .dance-gauge {
          position: fixed;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 600px;
        }

        .gauge-container {
          height: 40px;
          background: rgba(0, 0, 0, 0.8);
          border: 3px solid;
          border-color: #ff00ff;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow:
            inset 0 2px 10px rgba(0,0,0,0.5),
            0 0 20px rgba(255, 0, 255, 0.3),
            0 0 30px rgba(0, 255, 255, 0.2);
        }

        .gauge-fill {
          height: 100%;
          border-radius: 17px;
          position: relative;
          z-index: 10;
          transition: background 0.3s ease, width 0.3s ease;
        }

        .gauge-segments {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 15;
        }

        .gauge-segment {
          position: absolute;
          width: 1px;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
        }

        .gauge-label {
          text-align: center;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .gauge-percent {
          color: #00ffff;
          font-weight: bold;
        }

        .gauge-glow-overlay {
          mix-blend-mode: screen;
        }

        .gauge-fire-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }

        .gauge-fire {
          mix-blend-mode: screen;
          animation: flicker 0.3s infinite alternate;
        }

        @keyframes flicker {
          0% { filter: brightness(1) blur(2px); }
          100% { filter: brightness(1.3) blur(1px); }
        }

        .combo-milestone {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 300;
          text-align: center;
        }

        .milestone-text {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
        }

        .milestone-combo {
          font-size: 1.5rem;
          color: #ffffff;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}