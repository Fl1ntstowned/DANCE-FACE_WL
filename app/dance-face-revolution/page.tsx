'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import GameUI from './components/GameUI';
import Leaderboard from './components/Leaderboard';
import StartScreen from './components/StartScreen';
import { GameState, GameScore } from './types';
import { Song } from './songData';
import './game-styles.css';

// Dynamic import GameScene to avoid SSR issues with Three.js
const GameScene = dynamic(() => import('./components/GameScene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a2e',
      color: '#ffffff'
    }}>
      Loading Game...
    </div>
  )
});

export default function DanceFaceRevolution() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState<GameScore>({
    points: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
    accuracy: 100
  });
  const [gaugeLevel, setGaugeLevel] = useState(30); // Track gauge level at top level
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('medium');
  const audioRef = useRef<HTMLAudioElement>(null);

  const startGame = useCallback((song: Song, diff: typeof difficulty) => {
    console.log('[DanceFaceRevolution] Starting game:', { song: song.title, diff, duration: song.duration });
    setSelectedSong(song);
    setDifficulty(diff);
    setGameState('playing');
    console.log('[DanceFaceRevolution] Game state set to playing');
    setGaugeLevel(30); // Reset gauge to starting level
    setScore({
      points: 0,
      combo: 0,
      maxCombo: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      accuracy: 100,
    });

    if (audioRef.current) {
      audioRef.current.src = song.file;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }, []);

  const endGame = useCallback(() => {
    setGameState('results');
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const returnToMenu = useCallback(() => {
    setGameState('menu');
    setShowLeaderboard(false);
  }, []);

  const updateScore = useCallback((update: Partial<GameScore> | ((prev: GameScore) => Partial<GameScore>)) => {
    setScore(prev => {
      const actualUpdate = typeof update === 'function' ? update(prev) : update;

      console.log('[UpdateScore] Previous state:', prev);
      console.log('[UpdateScore] Update received:', actualUpdate);

      // Properly accumulate judgment counts
      const newScore = {
        ...prev,
        points: actualUpdate.points !== undefined ? actualUpdate.points : prev.points,
        combo: actualUpdate.combo !== undefined ? actualUpdate.combo : prev.combo,
        perfect: prev.perfect + (actualUpdate.perfect || 0),
        great: prev.great + (actualUpdate.great || 0),
        good: prev.good + (actualUpdate.good || 0),
        miss: prev.miss + (actualUpdate.miss || 0),
        maxCombo: prev.maxCombo,
        accuracy: prev.accuracy
      };

      // Log miss updates specifically
      if (actualUpdate.miss) {
        console.log('[Miss Tracked] Adding', actualUpdate.miss, 'to existing', prev.miss, '=', newScore.miss);
      }

      // Update max combo if needed
      if (newScore.combo > newScore.maxCombo) {
        newScore.maxCombo = newScore.combo;
      }

      // Calculate accuracy based on arrows seen so far
      const totalHits = newScore.perfect + newScore.great + newScore.good;
      const totalArrowsSeen = totalHits + newScore.miss; // Arrows that have been judged (hit or miss)

      console.log('[Accuracy Calc] Hits:', totalHits, 'Misses:', newScore.miss,
                  'Total Arrows Seen:', totalArrowsSeen);

      if (totalArrowsSeen > 0) {
        // Accuracy = percentage of judged arrows that were hit
        const rawAccuracy = (totalHits / totalArrowsSeen) * 100;
        newScore.accuracy = Math.min(100, Math.round(rawAccuracy * 10) / 10); // Cap at 100%, round to 1 decimal
        console.log('[Accuracy Calc] Hit rate:', totalHits, '/', totalArrowsSeen, '=', newScore.accuracy + '%');
      } else {
        newScore.accuracy = 100;
      }

      console.log('[Score Update]', {
        perfect: newScore.perfect,
        great: newScore.great,
        good: newScore.good,
        miss: newScore.miss,
        arrowsSeen: totalArrowsSeen,
        accuracy: `${newScore.accuracy.toFixed(1)}%`,
        combo: newScore.combo,
        maxCombo: newScore.maxCombo,
        points: newScore.points
      });

      return newScore;
    });
  }, []);

  useEffect(() => {
    // Preload audio and set up ended event
    if (audioRef.current) {
      audioRef.current.volume = 0.7;

      // Add event listener for when audio ends
      const handleAudioEnded = () => {
        console.log('[DanceFaceRevolution] Music ended, ending game');
        endGame();
      };

      audioRef.current.addEventListener('ended', handleAudioEnded);

      // Cleanup
      const audio = audioRef.current;
      return () => {
        audio?.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, [endGame]);

  return (
    <main className="dfr-container">
      <audio ref={audioRef} />

      {/* Debug State Display */}
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '10px',
        background: 'rgba(255,0,0,0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        color: '#ffffff',
        zIndex: 9999
      }}>
        <div>Game State: {gameState}</div>
        <div>Difficulty: {difficulty}</div>
        <div>Song: {selectedSong?.title || 'None'}</div>
        <div>Gauge: {gaugeLevel.toFixed(1)}%</div>
        <div>Combo: {score.combo}</div>
        <div>Accuracy: {score.accuracy.toFixed(1)}%</div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <StartScreen
            onStartGame={startGame}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: '100%',
              height: '100vh',
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 50
            }}
          >
            <GameScene
              difficulty={difficulty}
              onUpdateScore={updateScore}
              onEndGame={endGame}
              isPlaying={gameState === 'playing'}
              onGaugeUpdate={setGaugeLevel}
              currentGauge={gaugeLevel}
              songDuration={selectedSong?.duration || 120}
              songBPM={selectedSong?.bpm || 128}
            />
            <GameUI score={score} gaugeLevel={gaugeLevel} />
          </motion.div>
        )}

        {gameState === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="results-screen"
          >
            <h1 className="results-title">STAGE CLEAR!</h1>
            <div className="results-stats">
              <div className="stat-row">
                <span>Score</span>
                <span className="stat-value">{score.points.toLocaleString()}</span>
              </div>
              <div className="stat-row">
                <span>Max Combo</span>
                <span className="stat-value">{score.maxCombo}</span>
              </div>
              <div className="stat-row">
                <span>Accuracy</span>
                <span className="stat-value">{score.accuracy.toFixed(2)}%</span>
              </div>
              <div className="stat-row">
                <span>Total Arrows</span>
                <span className="stat-value">{score.perfect + score.great + score.good + score.miss}</span>
              </div>
              <div className="judgment-grid">
                <div className="judgment perfect">
                  <span>PERFECT</span>
                  <span>{score.perfect}</span>
                </div>
                <div className="judgment great">
                  <span>GREAT</span>
                  <span>{score.great}</span>
                </div>
                <div className="judgment good">
                  <span>GOOD</span>
                  <span>{score.good}</span>
                </div>
                <div className="judgment miss">
                  <span>MISS</span>
                  <span>{score.miss}</span>
                </div>
              </div>
              <div className="grade">
                {score.accuracy >= 95 ? 'SSS' :
                 score.accuracy >= 90 ? 'SS' :
                 score.accuracy >= 85 ? 'S' :
                 score.accuracy >= 80 ? 'A' :
                 score.accuracy >= 70 ? 'B' :
                 score.accuracy >= 60 ? 'C' :
                 score.accuracy >= 50 ? 'D' : 'F'}
              </div>
            </div>
            <div className="results-actions">
              <button onClick={() => selectedSong && startGame(selectedSong, difficulty)} className="btn-replay">
                PLAY AGAIN
              </button>
              <button onClick={returnToMenu} className="btn-menu">
                MAIN MENU
              </button>
              <button onClick={() => setShowLeaderboard(true)} className="btn-leaderboard">
                LEADERBOARD
              </button>
            </div>
          </motion.div>
        )}

        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}