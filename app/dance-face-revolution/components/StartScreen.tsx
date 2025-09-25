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
  const [carouselDirection, setCarouselDirection] = useState<'left' | 'right'>('right');
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
    setCarouselDirection('left');
    setSelectedSongIndex((prev) => (prev - 1 + songs.length) % songs.length);

    // Auto-play preview for new song if preview was already playing
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      setIsPreviewPlaying(true);
    } else if (!isPreviewPlaying) {
      setIsPreviewPlaying(true);
    }
  };

  const handleNextSong = () => {
    setCarouselDirection('right');
    setSelectedSongIndex((prev) => (prev + 1) % songs.length);

    // Auto-play preview for new song if preview was already playing
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      setIsPreviewPlaying(true);
    } else if (!isPreviewPlaying) {
      setIsPreviewPlaying(true);
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
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.9
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
        background: 'linear-gradient(135deg, rgba(10, 10, 46, 0.4) 0%, rgba(26, 26, 62, 0.5) 50%, rgba(10, 10, 46, 0.4) 100%)',
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

      {/* Content wrapper */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100vh',
        position: 'relative',
        zIndex: 10,
        padding: '1rem',
        paddingTop: '1.5rem',
        gap: '0.5rem'
      }}>

      {/* Game Title */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        style={{
          marginBottom: '0.5rem',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: '900',
          background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          textAlign: 'center',
          animation: 'gradientShift 3s ease infinite',
          position: 'relative',
          zIndex: 10,
          lineHeight: '1',
          whiteSpace: 'nowrap'
        }}
      >
        DANCE FACE REVOLUTION
      </motion.h1>

      {/* Song Carousel */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          width: '90%',
          maxWidth: '850px',
          margin: '0',
          position: 'relative',
          zIndex: 20
        }}
      >
        <h2 style={{
          color: '#00ffff',
          textAlign: 'center',
          marginBottom: '2rem',
          marginTop: '0.3rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontSize: '1.2rem',
          textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
        }}>
          SELECT TRACK
        </h2>

        <div style={{
          position: 'relative',
          minHeight: '320px',
          perspective: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Previous button */}
          <motion.button
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevSong}
            style={{
              position: 'absolute',
              left: '10px',
              top: '180px',
              background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.8), rgba(40, 40, 80, 0.8))',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #ff00ff, #00ffff) 1',
              borderRadius: '15px',
              width: '60px',
              height: '60px',
              color: '#ffffff',
              fontSize: '2.5rem',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 10px 40px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ‹
          </motion.button>

          {/* 3D Carousel Container */}
          <div className="carousel-container" style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Show 3 cards: previous, current, next */}
            {[-1, 0, 1].map((offset) => {
              const index = (selectedSongIndex + offset + songs.length) % songs.length;
              const song = songs[index];
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={`${song.id}-${offset}`}
                  initial={{
                    x: carouselDirection === 'right' ? 300 : -300,
                    opacity: 0,
                    rotateY: carouselDirection === 'right' ? 45 : -45
                  }}
                  animate={{
                    x: offset * 380,
                    y: isCenter ? 0 : -50,
                    opacity: isCenter ? 1 : 0.5,
                    scale: isCenter ? 1 : 0.7,
                    z: isCenter ? 50 : -100,
                    rotateY: offset * 25
                  }}
                  exit={{
                    x: carouselDirection === 'right' ? -300 : 300,
                    opacity: 0,
                    rotateY: carouselDirection === 'right' ? -45 : 45
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20
                  }}
                  style={{
                    position: 'absolute',
                    width: '340px',
                    minWidth: '340px',
                    maxWidth: '340px',
                    background: isCenter
                      ? 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 40, 80, 0.9))'
                      : 'linear-gradient(135deg, rgba(20, 20, 40, 0.7), rgba(40, 40, 80, 0.6))',
                    border: '2px solid',
                    borderImage: `linear-gradient(45deg, ${isCenter ? '#ff00ff' : '#ff00ff88'}, ${isCenter ? '#00ffff' : '#00ffff88'}) 1`,
                    borderRadius: '20px',
                    padding: '1.2rem',
                    backdropFilter: isCenter ? 'blur(20px)' : 'blur(8px)',
                    boxShadow: isCenter
                      ? '0 15px 60px rgba(255, 0, 255, 0.3), 0 0 80px rgba(0, 255, 255, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.03)'
                      : '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 0, 255, 0.1)',
                    transformStyle: 'preserve-3d',
                    pointerEvents: isCenter ? 'auto' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      color: isCenter ? '#ff00ff' : '#ff00ff77',
                      fontSize: isCenter ? '1.4rem' : '1.2rem',
                      marginBottom: '0.3rem',
                      textShadow: isCenter ? '0 0 20px rgba(255, 0, 255, 0.5)' : 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '700',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {song.title}
                    </h3>
                    <p style={{
                      color: isCenter ? '#ffffff' : '#ffffff77',
                      fontSize: isCenter ? '0.95rem' : '0.85rem',
                      marginBottom: '0.3rem',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {song.artist}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '1.5rem',
                      marginTop: '0.5rem',
                      opacity: isCenter ? 1 : 0.6,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <span style={{
                        color: '#00ffff',
                        fontSize: isCenter ? '0.85rem' : '0.75rem',
                        fontWeight: '600',
                        textShadow: isCenter ? '0 0 8px rgba(0, 255, 255, 0.4)' : 'none'
                      }}>
                        BPM: {song.bpm}
                      </span>
                      <span style={{
                        color: '#ffff00',
                        fontSize: isCenter ? '0.85rem' : '0.75rem',
                        fontWeight: '600',
                        textShadow: isCenter ? '0 0 8px rgba(255, 255, 0, 0.4)' : 'none'
                      }}>
                        {song.genre}
                      </span>
                      {songDurations[song.id] && (
                        <span style={{
                          color: '#ff69b4',
                          fontSize: isCenter ? '0.85rem' : '0.75rem',
                          fontWeight: '600',
                          textShadow: isCenter ? '0 0 8px rgba(255, 105, 180, 0.4)' : 'none'
                        }}>
                          {formatDuration(songDurations[song.id])}
                        </span>
                      )}
                    </div>

                    {/* Only show preview button for center card */}
                    {isCenter && (
                      <>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePreview();
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.4rem 1.2rem',
                            background: isPreviewPlaying
                              ? 'linear-gradient(135deg, #ff0066, #ff00ff)'
                              : 'linear-gradient(135deg, #00ff66, #00ffff)',
                            border: 'none',
                            borderRadius: '25px',
                            color: '#ffffff',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            boxShadow: isPreviewPlaying
                              ? '0 5px 30px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                              : '0 5px 30px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}
                        >
                          {isPreviewPlaying ? '⏸ PAUSE' : '▶ PREVIEW'}
                        </motion.button>

                        {/* Auto-play indicator with waveform */}
                        {isPreviewPlaying && (
                          <div style={{
                            marginTop: '0.3rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '2px',
                              height: '15px',
                              alignItems: 'flex-end'
                            }}>
                              {[...Array(11)].map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: '2px',
                                    height: `${5 + Math.random() * 10}px`,
                                    background: 'linear-gradient(180deg, #ff00ff, #00ffff)',
                                    borderRadius: '2px',
                                    animation: `waveform ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.05}s`
                                  }}
                                />
                              ))}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#ff00ff',
                              animation: 'pulse 2s infinite'
                            }}>
                              ♪ Auto-Playing ♪
                            </div>
                          </div>
                        )}

                        {/* Difficulty stars */}
                        <div style={{ marginTop: '0.8rem' }}>
                          <p style={{
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                          }}>
                            Difficulty Rating
                          </p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.4rem',
                            maxWidth: '240px',
                            margin: '0 auto'
                          }}>
                            {Object.entries(song.difficulty).map(([diff, rating]) => (
                              <div key={diff} style={{
                                textAlign: 'center',
                                padding: '0.25rem 0.3rem',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '6px',
                                border: `1px solid ${getDifficultyColor(diff)}33`
                              }}>
                                <div style={{
                                  color: getDifficultyColor(diff),
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  marginBottom: '0.2rem',
                                  textTransform: 'uppercase'
                                }}>
                                  {diff}
                                </div>
                                <div style={{ fontSize: '0', lineHeight: '1' }}>
                                  {Array.from({ length: 10 }, (_, i) => (
                                    <span key={i} style={{
                                      color: i < rating ? getDifficultyColor(diff) : '#333333',
                                      fontSize: '0.6rem',
                                      textShadow: i < rating ? `0 0 3px ${getDifficultyColor(diff)}` : 'none'
                                    }}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextSong}
            style={{
              position: 'absolute',
              right: '10px',
              top: '180px',
              background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.8), rgba(40, 40, 80, 0.8))',
              border: '2px solid',
              borderImage: 'linear-gradient(135deg, #ff00ff, #00ffff) 1',
              borderRadius: '15px',
              width: '60px',
              height: '60px',
              color: '#ffffff',
              fontSize: '2.5rem',
              cursor: 'pointer',
              zIndex: 100,
              boxShadow: '0 10px 40px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ›
          </motion.button>
        </div>

        {/* Song counter with dots */}
        <div style={{
          textAlign: 'center',
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.4rem'
        }}>
          {songs.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === selectedSongIndex ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: index === selectedSongIndex
                  ? 'linear-gradient(90deg, #ff00ff, #00ffff)'
                  : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                setCarouselDirection(index > selectedSongIndex ? 'right' : 'left');
                setSelectedSongIndex(index);
                if (!hasUserInteracted) {
                  setHasUserInteracted(true);
                  setIsPreviewPlaying(true);
                } else if (!isPreviewPlaying) {
                  setIsPreviewPlaying(true);
                }
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Difficulty Selection */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ width: '90%', maxWidth: '600px', margin: '0', marginTop: '2rem', position: 'relative', zIndex: 20 }}
      >
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          justifyContent: 'center',
          flexWrap: 'nowrap'
        }}>
          {(['easy', 'medium', 'hard', 'extreme'] as const).map((diff) => (
            <motion.button
              key={diff}
              onClick={(e) => {
                e.preventDefault();
                console.log('[StartScreen] Difficulty clicked:', diff);
                setSelectedDifficulty(diff);
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.8rem 1.5rem',
                background: selectedDifficulty === diff
                  ? `linear-gradient(135deg, ${getDifficultyColor(diff)}40, ${getDifficultyColor(diff)}20)`
                  : 'rgba(0, 0, 0, 0.5)',
                border: '2px solid',
                borderColor: getDifficultyColor(diff),
                borderRadius: '40px',
                color: getDifficultyColor(diff),
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: selectedDifficulty === diff
                  ? `0 0 25px ${getDifficultyColor(diff)}`
                  : 'none',
                transition: 'all 0.3s',
                minWidth: '120px'
              }}
            >
              {diff}
              <div style={{ fontSize: '0.65rem', marginTop: '0.1rem' }}>
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
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '2.2rem',
          position: 'relative',
          zIndex: 30
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={handleStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.3rem',
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '1rem 1.8rem',
            fontSize: '1.1rem',
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
          marginTop: '2.2rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Use ARROW KEYS or W/A/S/D to hit the notes!</p>
        <p style={{ marginTop: '0.3rem', color: '#ff00ff', fontSize: '0.85rem' }}>
          Hit Perfect notes to build combo and increase score!
        </p>
      </motion.div>

      </div> {/* End of content wrapper */}

    </motion.div>
  );
}