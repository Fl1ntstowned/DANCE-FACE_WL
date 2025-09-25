'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { songs, Song } from '../songData';
import '../start-screen.css';

interface StartScreenProps {
  onStartGame: (song: Song, difficulty: 'easy' | 'medium' | 'hard' | 'extreme') => void;
  onShowLeaderboard: () => void;
}

export default function StartScreen({ onStartGame, onShowLeaderboard }: StartScreenProps) {
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('easy');
  const [songDurations, setSongDurations] = useState<{ [key: string]: number }>({});
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const selectedSong = songs[selectedSongIndex];

  // Load song durations
  useEffect(() => {
    const loadDuration = async (song: Song) => {
      const audio = new Audio(song.file);
      return new Promise<void>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          setSongDurations(prev => ({ ...prev, [song.id]: audio.duration }));
          resolve();
        });
        audio.addEventListener('error', () => {
          console.error(`Failed to load ${song.file}`);
          resolve();
        });
      });
    };

    // Load all song durations
    songs.forEach(song => loadDuration(song));
  }, []);

  // Handle song preview when song changes and user has interacted
  useEffect(() => {
    if (audioRef.current && hasUserInteracted && isPreviewPlaying) {
      audioRef.current.src = selectedSong.file;
      audioRef.current.volume = 0.3;
      audioRef.current.currentTime = 10; // Start preview from 10 seconds
      audioRef.current.play().catch(e => {
        console.log('Preview play failed:', e);
        setIsPreviewPlaying(false);
      });
    }
  }, [selectedSong, hasUserInteracted, isPreviewPlaying]);

  // Toggle preview playback
  const togglePreview = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    if (audioRef.current) {
      if (isPreviewPlaying) {
        audioRef.current.pause();
        setIsPreviewPlaying(false);
      } else {
        audioRef.current.src = selectedSong.file;
        audioRef.current.volume = 0.3;
        audioRef.current.currentTime = 10;
        audioRef.current.play().then(() => {
          setIsPreviewPlaying(true);
        }).catch(e => {
          console.error('Failed to play preview:', e);
          setIsPreviewPlaying(false);
        });
      }
    }
  };

  const handleStartGame = () => {
    console.log('[StartScreen] handleStartGame called');
    console.log('[StartScreen] selectedSong:', selectedSong);
    console.log('[StartScreen] selectedDifficulty:', selectedDifficulty);
    console.log('[StartScreen] onStartGame function:', onStartGame);

    // Stop preview if playing
    if (audioRef.current && isPreviewPlaying) {
      audioRef.current.pause();
      setIsPreviewPlaying(false);
    }

    const songWithDuration = { ...selectedSong, duration: songDurations[selectedSong.id] || 120 };
    console.log('[StartScreen] songWithDuration:', songWithDuration);

    try {
      onStartGame(songWithDuration, selectedDifficulty);
    } catch (error) {
      console.error('[StartScreen] Error calling onStartGame:', error);
    }
  };

  const handlePrevSong = () => {
    setSelectedSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    // If preview is playing and user has interacted, continue playing for new song
    if (isPreviewPlaying && hasUserInteracted && audioRef.current) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = songs[(selectedSongIndex - 1 + songs.length) % songs.length].file;
          audioRef.current.currentTime = 10;
          audioRef.current.play().catch(e => console.log('Auto-play on song change failed:', e));
        }
      }, 100);
    }
  };

  const handleNextSong = () => {
    setSelectedSongIndex((prev) => (prev + 1) % songs.length);
    // If preview is playing and user has interacted, continue playing for new song
    if (isPreviewPlaying && hasUserInteracted && audioRef.current) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = songs[(selectedSongIndex + 1) % songs.length].file;
          audioRef.current.currentTime = 10;
          audioRef.current.play().catch(e => console.log('Auto-play on song change failed:', e));
        }
      }, 100);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#00ff00';
      case 'medium': return '#ffff00';
      case 'hard': return '#ff8800';
      case 'extreme': return '#ff0000';
      default: return '#ffffff';
    }
  };

  return (
    <motion.div
      className="start-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 100
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 1
        }}
      >
        <source src="/1758588230567-7c4b630c7d99aa76 (1).mp4" type="video/mp4" />
      </video>

      {/* Light overlay for better text readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(10, 10, 46, 0.3) 0%, rgba(26, 26, 62, 0.3) 100%)',
        zIndex: 1
      }} />

      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.1) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out infinite',
        pointerEvents: 'none', // Don't block clicks
        zIndex: 2
      }} />

      {/* Audio element for preview */}
      <audio ref={audioRef} loop />

      {/* Game Title */}
      <motion.h1
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        style={{
          marginBottom: '1rem',
          fontSize: 'clamp(2.5rem, 7vw, 4rem)',
          fontWeight: '900',
          background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textAlign: 'center',
          animation: 'gradientShift 3s ease infinite',
          position: 'relative',
          zIndex: 10
        }}
      >
        DANCE FACE
        <br />
        REVOLUTION
      </motion.h1>

      {/* Song Carousel */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '2rem auto',
          position: 'relative',
          zIndex: 20
        }}
      >
        <h2 style={{
          color: '#00ffff',
          textAlign: 'center',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          SELECT TRACK
        </h2>

        <div style={{ position: 'relative', minHeight: '250px' }}>
          {/* Previous button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevSong}
            style={{
              position: 'absolute',
              left: '-50px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 0, 255, 0.3)',
              border: '2px solid #ff00ff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ffffff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            ‹
          </motion.button>

          {/* Song Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSong.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))',
                border: '2px solid',
                borderImage: 'linear-gradient(45deg, #ff00ff, #00ffff) 1',
                borderRadius: '20px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 40px rgba(255, 0, 255, 0.3)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  color: '#ff00ff',
                  fontSize: '1.8rem',
                  marginBottom: '0.5rem',
                  textShadow: '0 0 20px rgba(255, 0, 255, 0.5)'
                }}>
                  {selectedSong.title}
                </h3>
                <p style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {selectedSong.artist}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                  <span style={{ color: '#00ffff' }}>
                    BPM: {selectedSong.bpm}
                  </span>
                  <span style={{ color: '#ffff00' }}>
                    {selectedSong.genre}
                  </span>
                  {songDurations[selectedSong.id] && (
                    <span style={{ color: '#ff69b4' }}>
                      {formatDuration(songDurations[selectedSong.id])}
                    </span>
                  )}
                </div>

                {/* Preview Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1.5rem',
                    background: isPreviewPlaying
                      ? 'linear-gradient(135deg, #ff0066, #ff00ff)'
                      : 'linear-gradient(135deg, #00ff66, #00ffff)',
                    border: 'none',
                    borderRadius: '25px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: isPreviewPlaying
                      ? '0 0 20px rgba(255, 0, 255, 0.5)'
                      : '0 0 20px rgba(0, 255, 255, 0.5)'
                  }}
                >
                  {isPreviewPlaying ? '⏸ PAUSE' : '▶ PREVIEW'}
                </motion.button>

                {/* Auto-play indicator with waveform */}
                {isPreviewPlaying && (
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '2px',
                      height: '20px',
                      alignItems: 'flex-end'
                    }}>
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '3px',
                            height: `${5 + Math.random() * 15}px`,
                            background: 'linear-gradient(180deg, #ff00ff, #00ffff)',
                            borderRadius: '2px',
                            animation: `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#ff00ff',
                      animation: 'pulse 2s infinite'
                    }}>
                      ♪ Now Playing Preview ♪
                    </div>
                  </div>
                )}

                {/* Difficulty stars */}
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Difficulty Rating:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {Object.entries(selectedSong.difficulty).map(([diff, rating]) => (
                      <div key={diff} style={{ textAlign: 'center' }}>
                        <div style={{ color: getDifficultyColor(diff), fontSize: '0.8rem' }}>
                          {diff.toUpperCase()}
                        </div>
                        <div>
                          {Array.from({ length: 10 }, (_, i) => (
                            <span key={i} style={{
                              color: i < rating ? getDifficultyColor(diff) : '#333333',
                              fontSize: '0.8rem'
                            }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextSong}
            style={{
              position: 'absolute',
              right: '-50px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 0, 255, 0.3)',
              border: '2px solid #ff00ff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ffffff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            ›
          </motion.button>
        </div>

        {/* Song counter */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          {selectedSongIndex + 1} / {songs.length}
        </div>
      </motion.div>

      {/* Difficulty Selection */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ width: '100%', maxWidth: '600px', margin: '2rem auto', position: 'relative', zIndex: 20 }}
      >
        <h2 style={{
          color: '#ffff00',
          textAlign: 'center',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em'
        }}>
          SELECT DIFFICULTY
        </h2>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {(['easy', 'medium', 'hard', 'extreme'] as const).map((diff) => (
            <motion.button
              key={diff}
              onClick={(e) => {
                e.preventDefault();
                console.log('[StartScreen] Difficulty clicked:', diff);
                setSelectedDifficulty(diff);
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: '1rem 2rem',
                background: selectedDifficulty === diff
                  ? `linear-gradient(135deg, ${getDifficultyColor(diff)}40, ${getDifficultyColor(diff)}20)`
                  : 'rgba(0, 0, 0, 0.5)',
                border: '2px solid',
                borderColor: getDifficultyColor(diff),
                borderRadius: '50px',
                color: getDifficultyColor(diff),
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontSize: '1rem',
                boxShadow: selectedDifficulty === diff
                  ? `0 0 30px ${getDifficultyColor(diff)}`
                  : 'none',
                transition: 'all 0.3s'
              }}
            >
              {diff}
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                ★ {selectedSong.difficulty[diff]}/10
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '2rem',
          position: 'relative',
          zIndex: 30
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={handleStartGame}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            padding: '1.5rem 3rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
            border: 'none',
            borderRadius: '50px',
            color: '#ffffff',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 0 50px rgba(255, 0, 255, 0.5)',
            position: 'relative',
            zIndex: 50
          }}
        >
          START GAME
        </motion.button>

        <motion.button
          onClick={onShowLeaderboard}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            padding: '1.5rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            background: 'transparent',
            border: '2px solid #ffff00',
            borderRadius: '50px',
            color: '#ffff00',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            position: 'relative',
            zIndex: 50
          }}
        >
          LEADERBOARD
        </motion.button>
      </motion.div>

      {/* Instructions */}
      <motion.div
        style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Use ARROW KEYS or W/A/S/D to hit the notes!</p>
        <p style={{ marginTop: '0.5rem', color: '#ff00ff' }}>
          Hit Perfect notes to build combo and increase score!
        </p>
      </motion.div>

    </motion.div>
  );
}