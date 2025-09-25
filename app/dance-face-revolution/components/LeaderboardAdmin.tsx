'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import leaderboardAPI from '../../lib/leaderboard-api';
import { LeaderboardEntry } from '../types';

interface LeaderboardAdminProps {
  onClose: () => void;
}

export default function LeaderboardAdmin({ onClose }: LeaderboardAdminProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'extreme'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'wallets'>('csv');

  useEffect(() => {
    fetchLeaderboard();
  }, [difficultyFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardAPI.getLeaderboard({
        difficulty: difficultyFilter,
        limit: 1000
      });
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllWallets = async () => {
    const wallets = leaderboard
      .map(entry => entry.walletAddress || entry.address || '')
      .filter(Boolean)
      .join('\n');
    await copyToClipboard(wallets, 'all-wallets');
  };

  const exportData = () => {
    let exportContent = '';
    let filename = '';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (exportFormat) {
      case 'csv':
        exportContent = 'Rank,X Handle,Wallet Address,Score,Combo,Accuracy,Grade,Difficulty,Song,Date\n';
        exportContent += leaderboard.map(entry =>
          `${entry.rank},"${entry.xHandle || ''}","${entry.walletAddress || entry.address || ''}",${entry.score},${entry.combo},${entry.accuracy},${entry.grade},${entry.difficulty},"${entry.songTitle}","${new Date(entry.timestamp).toISOString()}"`
        ).join('\n');
        filename = `leaderboard_${timestamp}.csv`;
        break;

      case 'json':
        exportContent = JSON.stringify(leaderboard, null, 2);
        filename = `leaderboard_${timestamp}.json`;
        break;

      case 'wallets':
        exportContent = leaderboard
          .map(entry => entry.walletAddress || entry.address || '')
          .filter(Boolean)
          .join('\n');
        filename = `wallets_${timestamp}.txt`;
        break;
    }

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="admin-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.98)',
        zIndex: 3000,
        padding: '2rem',
        overflowY: 'auto'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(20, 20, 50, 0.95), rgba(0, 0, 0, 0.95))',
          border: '2px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '20px',
          padding: '2rem'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid rgba(255, 0, 255, 0.2)',
          paddingBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🔧 LEADERBOARD ADMIN
          </h2>
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

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 0, 255, 0.1)',
            border: '1px solid rgba(255, 0, 255, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#ff00ff', fontSize: '2rem', fontWeight: 'bold' }}>
              {leaderboard.length}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Total Entries
            </div>
          </div>
          <div style={{
            background: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#00ffff', fontSize: '2rem', fontWeight: 'bold' }}>
              {new Set(leaderboard.map(e => e.walletAddress || e.address)).size}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Unique Wallets
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 0, 0.1)',
            border: '1px solid rgba(255, 255, 0, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffff00', fontSize: '2rem', fontWeight: 'bold' }}>
              {leaderboard[0]?.score.toLocaleString() || 0}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              High Score
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Difficulty Filter */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'easy', 'medium', 'hard', 'extreme'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                style={{
                  padding: '0.5rem 1rem',
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
                  borderRadius: '10px',
                  color: difficultyFilter === diff ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem'
                }}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Export Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'wallets')}
              style={{
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: '#ffffff'
              }}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="wallets">Wallets Only</option>
            </select>
            <button
              onClick={exportData}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(45deg, #00ff00, #00ffff)',
                border: 'none',
                borderRadius: '10px',
                color: '#000000',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📥 Export
            </button>
            <button
              onClick={copyAllWallets}
              style={{
                padding: '0.5rem 1.5rem',
                background: copied === 'all-wallets'
                  ? 'rgba(0, 255, 0, 0.3)'
                  : 'linear-gradient(45deg, #ff00ff, #ffff00)',
                border: 'none',
                borderRadius: '10px',
                color: copied === 'all-wallets' ? '#00ff00' : '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {copied === 'all-wallets' ? '✅ Copied!' : '📋 Copy All Wallets'}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{
          overflowX: 'auto',
          maxHeight: '60vh',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#00ffff' }}>
              Loading leaderboard data...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                zIndex: 10
              }}>
                <tr style={{ borderBottom: '2px solid rgba(255, 0, 255, 0.3)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>RANK</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>X HANDLE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>WALLET</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>SCORE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>DIFF</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>GRADE</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff00ff' }}>SONG</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>DATE</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff00ff' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const walletAddress = entry.walletAddress || entry.address || '';
                  const entryId = `${entry.rank}-${walletAddress}`;
                  return (
                    <tr
                      key={entryId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem', color: '#ffffff' }}>
                        #{entry.rank}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#00ffff' }}>
                        {entry.xHandle || '-'}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px'
                          }}>
                            {walletAddress}
                          </span>
                          <button
                            onClick={() => copyToClipboard(walletAddress, entryId)}
                            style={{
                              background: copied === entryId ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '5px',
                              padding: '0.25rem 0.5rem',
                              color: copied === entryId ? '#00ff00' : '#ffffff',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {copied === entryId ? '✅' : '📋'}
                          </button>
                        </div>
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        color: '#ffff00',
                        fontWeight: 'bold'
                      }}>
                        {entry.score.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        color: entry.difficulty === 'easy' ? '#00ff00'
                             : entry.difficulty === 'medium' ? '#ffff00'
                             : entry.difficulty === 'hard' ? '#ff8800'
                             : '#ff0000',
                        textTransform: 'uppercase',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {entry.difficulty}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${
                          entry.grade === 'SSS' ? '#ff00ff, #00ffff' :
                          entry.grade.startsWith('S') ? '#00ffff, #00ff00' :
                          '#ffff00, #ff8800'
                        })`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {entry.grade}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {entry.songTitle}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85rem'
                      }}>
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            const details = `Rank: ${entry.rank}
X Handle: ${entry.xHandle || 'N/A'}
Wallet: ${walletAddress}
Score: ${entry.score.toLocaleString()}
Combo: ${entry.combo}x
Accuracy: ${entry.accuracy.toFixed(1)}%
Grade: ${entry.grade}
Difficulty: ${entry.difficulty}
Song: ${entry.songTitle}
Perfect: ${entry.perfect || 0}
Great: ${entry.great || 0}
Good: ${entry.good || 0}
Miss: ${entry.miss || 0}
Date: ${new Date(entry.timestamp).toISOString()}`;
                            copyToClipboard(details, `details-${entryId}`);
                          }}
                          style={{
                            background: copied === `details-${entryId}` ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                            border: '1px solid rgba(0, 255, 255, 0.3)',
                            borderRadius: '5px',
                            padding: '0.25rem 0.75rem',
                            color: copied === `details-${entryId}` ? '#00ff00' : '#00ffff',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          {copied === `details-${entryId}` ? 'Copied!' : 'Copy All'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 0, 255, 0.1)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#ff00ff', fontSize: '0.9rem' }}>
            💾 Data is automatically saved to backend/leaderboard.json
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Use Export buttons to download data in various formats
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}