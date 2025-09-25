'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '../types';
import leaderboardAPI from '../../lib/leaderboard-api';

interface LeaderboardProps {
  onClose: () => void;
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'extreme'>('all');
  const [userStats, setUserStats] = useState<{ bestScore: LeaderboardEntry | null; totalGames: number } | null>(null);
  const [userWallet, setUserWallet] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    checkUserWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, difficultyFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardAPI.getLeaderboard({
        difficulty: difficultyFilter,
        timeFilter,
        limit: 100
      });
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const checkUserWallet = async () => {
    try {
      // Try to get wallet from localStorage or connect to Satoshi Browser
      const storedWallet = localStorage.getItem('userWallet');
      if (storedWallet) {
        setUserWallet(storedWallet);
        const stats = await leaderboardAPI.getUserStats(storedWallet);
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to get user stats:', error);
    }
  };

  // Wallet connect functionality removed - users now input wallet directly during score submission

  const getWhitelistStatus = (rank: number) => {
    if (rank <= 10) return { eligible: true, tier: 'LEGENDARY' };
    if (rank <= 25) return { eligible: true, tier: 'EPIC' };
    if (rank <= 50) return { eligible: true, tier: 'RARE' };
    if (rank <= 100) return { eligible: true, tier: 'COMMON' };
    return { eligible: false, tier: null };
  };

  return (
    <motion.div
      className="leaderboard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <motion.div
        className="leaderboard-container"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 46, 0.95), rgba(0, 0, 0, 0.95))',
          border: '2px solid rgba(255, 0, 255, 0.5)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <motion.h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            GLOBAL LEADERBOARD
          </motion.h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #ff00ff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ff00ff',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Whitelist Info */}
        <motion.div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1))',
            border: '1px solid rgba(255, 255, 0, 0.5)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '2rem'
          }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ color: '#ffff00', marginBottom: '0.5rem' }}>🏆 WHITELIST OPPORTUNITIES</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ color: '#ff00ff' }}>Top 10: LEGENDARY</div>
            <div style={{ color: '#00ffff' }}>Top 25: EPIC</div>
            <div style={{ color: '#00ff00' }}>Top 50: RARE</div>
            <div style={{ color: '#ffff00' }}>Top 100: COMMON</div>
          </div>
        </motion.div>

        {/* Filters */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Time Filter */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
            {(['all', 'daily', 'weekly', 'monthly'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: timeFilter === filter ? 'rgba(255, 0, 255, 0.3)' : 'transparent',
                  border: `1px solid ${timeFilter === filter ? '#ff00ff' : 'rgba(255, 255, 255, 0.3)'}`,
                  borderRadius: '20px',
                  color: timeFilter === filter ? '#ff00ff' : '#ffffff',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {(['all', 'easy', 'medium', 'hard', 'extreme'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                style={{
                  padding: '0.4rem 1rem',
                  background: difficultyFilter === diff
                    ? diff === 'easy' ? 'rgba(0, 255, 0, 0.3)'
                    : diff === 'medium' ? 'rgba(255, 255, 0, 0.3)'
                    : diff === 'hard' ? 'rgba(255, 136, 0, 0.3)'
                    : diff === 'extreme' ? 'rgba(255, 0, 0, 0.3)'
                    : 'rgba(128, 0, 255, 0.3)'
                    : 'transparent',
                  border: `1px solid ${
                    difficultyFilter === diff
                      ? diff === 'easy' ? '#00ff00'
                      : diff === 'medium' ? '#ffff00'
                      : diff === 'hard' ? '#ff8800'
                      : diff === 'extreme' ? '#ff0000'
                      : '#8000ff'
                      : 'rgba(255, 255, 255, 0.3)'
                  }`,
                  borderRadius: '15px',
                  color: difficultyFilter === diff
                    ? diff === 'easy' ? '#00ff00'
                    : diff === 'medium' ? '#ffff00'
                    : diff === 'hard' ? '#ff8800'
                    : diff === 'extreme' ? '#ff0000'
                    : '#8000ff'
                    : '#ffffff',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  fontWeight: difficultyFilter === diff ? 'bold' : 'normal'
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#00ffff', padding: '4rem' }}>
            Loading leaderboard...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 0, 255, 0.3)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>RANK</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>PLAYER</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>SCORE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>DIFFICULTY</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>COMBO</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>ACCURACY</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>GRADE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>WHITELIST</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leaderboard.map((entry, index) => {
                    const whitelist = getWhitelistStatus(entry.rank);
                    return (
                      <motion.tr
                        key={entry.address}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          background: index === 0 ? 'rgba(255, 215, 0, 0.1)' :
                                    index === 1 ? 'rgba(192, 192, 192, 0.1)' :
                                    index === 2 ? 'rgba(205, 127, 50, 0.1)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '1rem', color: '#ffffff' }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {entry.rank === 1 ? '🥇' :
                             entry.rank === 2 ? '🥈' :
                             entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: '#00ffff' }}>{entry.xHandle || entry.username || 'Anonymous'}</div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {entry.walletAddress || entry.address}
                          </div>
                          {entry.songTitle && (
                            <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.75rem' }}>
                              {entry.songTitle}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ffff00', fontWeight: 'bold' }}>
                          {entry.score.toLocaleString()}
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: entry.difficulty === 'easy' ? '#00ff00'
                               : entry.difficulty === 'medium' ? '#ffff00'
                               : entry.difficulty === 'hard' ? '#ff8800'
                               : '#ff0000',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {entry.difficulty}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>
                          {entry.combo}x
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#00ff00' }}>
                          {entry.accuracy.toFixed(1)}%
                        </td>
                        <td style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          background: `linear-gradient(45deg, ${
                            entry.grade === 'SSS' ? '#ff00ff, #00ffff' :
                            entry.grade === 'SS' ? '#00ffff, #00ff00' :
                            entry.grade === 'S' ? '#00ff00, #ffff00' :
                            '#ffff00, #ff8800'
                          })`,
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {entry.grade}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          {whitelist.eligible && (
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '10px',
                              background: whitelist.tier === 'LEGENDARY' ? 'rgba(255, 0, 255, 0.2)' :
                                        whitelist.tier === 'EPIC' ? 'rgba(0, 255, 255, 0.2)' :
                                        whitelist.tier === 'RARE' ? 'rgba(0, 255, 0, 0.2)' :
                                        'rgba(255, 255, 0, 0.2)',
                              color: whitelist.tier === 'LEGENDARY' ? '#ff00ff' :
                                    whitelist.tier === 'EPIC' ? '#00ffff' :
                                    whitelist.tier === 'RARE' ? '#00ff00' : '#ffff00',
                              fontSize: '0.8rem',
                              fontWeight: 'bold'
                            }}>
                              {whitelist.tier}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Your Best Score */}
        <motion.div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 255, 0.2))',
            border: '2px solid #ff00ff',
            borderRadius: '10px'
          }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 style={{ color: '#ff00ff', marginBottom: '1rem' }}>YOUR BEST SCORE</h3>
          {userStats && userStats.bestScore ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>SCORE</div>
                  <div style={{ color: '#ffff00', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {userStats.bestScore.score.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>RANK</div>
                  <div style={{ color: '#00ffff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    #{userStats.bestScore.rank}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>COMBO</div>
                  <div style={{ color: '#ff00ff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {userStats.bestScore.combo}x
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>ACCURACY</div>
                  <div style={{ color: '#00ff00', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {userStats.bestScore.accuracy.toFixed(1)}%
                  </div>
                </div>
              </div>
              <p style={{ color: '#00ffff', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Total games played: {userStats.totalGames}
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>SCORE</div>
                  <div style={{ color: '#ffff00', fontSize: '1.5rem', fontWeight: 'bold' }}>--</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>RANK</div>
                  <div style={{ color: '#00ffff', fontSize: '1.5rem', fontWeight: 'bold' }}>--</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>COMBO</div>
                  <div style={{ color: '#ff00ff', fontSize: '1.5rem', fontWeight: 'bold' }}>--</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>ACCURACY</div>
                  <div style={{ color: '#00ff00', fontSize: '1.5rem', fontWeight: 'bold' }}>--%</div>
                </div>
              </div>
              <p style={{ color: '#ffff00', textAlign: 'center', marginTop: '1rem' }}>
                Play a game and submit your score to get on the leaderboard!
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}