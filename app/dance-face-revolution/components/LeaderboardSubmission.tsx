'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameScore } from '../types';

interface LeaderboardSubmissionProps {
  score: GameScore;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  songTitle: string;
  onSubmit: (data: { xHandle: string; walletAddress: string }) => Promise<void>;
  onSkip: () => void;
}

export default function LeaderboardSubmission({
  score,
  difficulty,
  songTitle,
  onSubmit,
  onSkip
}: LeaderboardSubmissionProps) {
  const [xHandle, setXHandle] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Prevent browser autocapitalization on mount
  useEffect(() => {
    const xInput = document.getElementById('xhandle-input') as HTMLInputElement;
    const walletInput = document.getElementById('wallet-input') as HTMLInputElement;

    if (xInput) {
      xInput.setAttribute('autocapitalize', 'off');
      xInput.setAttribute('autocorrect', 'off');
      xInput.style.textTransform = 'none';
    }

    if (walletInput) {
      walletInput.setAttribute('autocapitalize', 'off');
      walletInput.setAttribute('autocorrect', 'off');
      walletInput.style.textTransform = 'none';
    }
  }, []);

  const validateTaprootAddress = (address: string): boolean => {
    // Taproot addresses start with 'bc1p' for mainnet or 'tb1p' for testnet
    const taprootRegex = /^(bc1p|tb1p)[a-z0-9]{39,59}$/;
    return taprootRegex.test(address.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate X handle
    if (!xHandle.trim()) {
      setError('Please enter your X (Twitter) handle');
      return;
    }

    // Validate wallet address
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }

    if (!validateTaprootAddress(walletAddress)) {
      setError('Please enter a valid Taproot address (starts with bc1p or tb1p)');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({ xHandle: xHandle.trim(), walletAddress: walletAddress.trim() });
      setSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onSkip();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score');
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return '#00ff00';
      case 'medium': return '#ffff00';
      case 'hard': return '#ff8800';
      case 'extreme': return '#ff0000';
      default: return '#ffffff';
    }
  };

  const getGrade = () => {
    if (score.accuracy >= 95) return 'SSS';
    if (score.accuracy >= 90) return 'SS';
    if (score.accuracy >= 85) return 'S';
    if (score.accuracy >= 80) return 'A';
    if (score.accuracy >= 70) return 'B';
    if (score.accuracy >= 60) return 'C';
    if (score.accuracy >= 50) return 'D';
    return 'F';
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="leaderboard-submission-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 255, 0.2))',
            border: '2px solid #00ff00',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            ✅
          </motion.div>
          <h2 style={{ color: '#00ff00', fontSize: '2rem', marginBottom: '1rem' }}>
            SCORE SUBMITTED!
          </h2>
          <p style={{ color: '#00ffff' }}>
            You&apos;re now on the leaderboard!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="leaderboard-submission-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 46, 0.98), rgba(0, 0, 0, 0.98))',
          border: '2px solid rgba(255, 0, 255, 0.5)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%'
        }}
      >
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          SUBMIT TO LEADERBOARD
        </h2>

        {/* Score Summary */}
        <div style={{
          background: 'rgba(255, 0, 255, 0.1)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>SONG</div>
              <div style={{ color: '#00ffff' }}>{songTitle}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>DIFFICULTY</div>
              <div style={{ color: getDifficultyColor(), textTransform: 'uppercase' }}>{difficulty}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>SCORE</div>
              <div style={{ color: '#ffff00', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {score.points.toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>GRADE</div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${
                  getGrade() === 'SSS' ? '#ff00ff, #00ffff' :
                  getGrade().startsWith('S') ? '#00ffff, #00ff00' :
                  '#ffff00, #ff8800'
                })`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {getGrade()}
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>COMBO</div>
              <div style={{ color: '#ff00ff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {score.maxCombo}x
              </div>
            </div>
            <div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>ACCURACY</div>
              <div style={{ color: '#00ff00', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {score.accuracy.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#ff00ff', display: 'block', marginBottom: '0.5rem' }}>
              X (Twitter) Handle
            </label>
            <input
              type="text"
              name="xhandle"
              id="xhandle-input"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@yourhandle"
              disabled={isSubmitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 0, 255, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '1rem',
                fontFamily: 'inherit',
                textTransform: 'none',
                WebkitTextSecurity: 'none'
              } as React.CSSProperties}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#00ffff', display: 'block', marginBottom: '0.5rem' }}>
              Bitcoin Taproot Address for Whitelist
            </label>
            <input
              type="text"
              name="walletaddress"
              id="wallet-input"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="bc1p... or tb1p..."
              disabled={isSubmitting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                textTransform: 'none',
                WebkitTextSecurity: 'none'
              } as React.CSSProperties}
            />
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Must be a valid Taproot address (starts with bc1p or tb1p)
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.5)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#ff6666'
              }}
            >
              {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '1rem',
                background: isSubmitting
                  ? 'rgba(128, 128, 128, 0.3)'
                  : 'linear-gradient(45deg, #ff00ff, #00ffff)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              SKIP
            </button>
          </div>
        </form>

        <p style={{
          color: '#ffff00',
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem'
        }}>
          🏆 Top players earn whitelist spots! Check the leaderboard for details.
        </p>
      </motion.div>
    </motion.div>
  );
}