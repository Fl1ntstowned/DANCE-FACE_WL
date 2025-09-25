import { getApiUrl } from './api';
import { LeaderboardEntry, LeaderboardSubmission } from '../dance-face-revolution/types';

const API_BASE = getApiUrl();

export interface LeaderboardFilters {
  difficulty?: 'all' | 'easy' | 'medium' | 'hard' | 'extreme';
  timeFilter?: 'all' | 'daily' | 'weekly' | 'monthly';
  limit?: number;
}

export interface UserLeaderboardData {
  bestScore: LeaderboardEntry | null;
  totalGames: number;
  allScores?: LeaderboardEntry[];
}

export const leaderboardAPI = {
  // Submit a new score to the leaderboard
  async submitScore(submission: LeaderboardSubmission): Promise<{ success: boolean; rank: number; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit score');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  },

  // Get leaderboard with optional filters
  async getLeaderboard(filters: LeaderboardFilters = {}): Promise<LeaderboardEntry[]> {
    try {
      const params = new URLSearchParams();

      if (filters.difficulty && filters.difficulty !== 'all') {
        params.append('difficulty', filters.difficulty);
      }

      if (filters.timeFilter && filters.timeFilter !== 'all') {
        params.append('timeFilter', filters.timeFilter);
      }

      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const url = `${API_BASE}/api/leaderboard${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // Get user's best score and stats
  async getUserStats(walletAddress: string): Promise<UserLeaderboardData> {
    try {
      const response = await fetch(`${API_BASE}/api/leaderboard/user/${encodeURIComponent(walletAddress)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Connect to Satoshi Browser for wallet verification
  async connectSatoshiBrowser(): Promise<string | null> {
    try {
      // Check if Satoshi Browser extension is available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).satoshi) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const satoshi = (window as any).satoshi;

        // Request wallet connection
        const accounts = await satoshi.requestAccounts();

        if (accounts && accounts.length > 0) {
          // Get the first taproot address
          const address = accounts[0];

          // Validate that it's a taproot address
          if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
            return address;
          } else {
            throw new Error('Please select a Taproot address (starting with bc1p or tb1p)');
          }
        }
      } else {
        // If Satoshi Browser is not installed, open the website
        window.open('https://satoshibrowser.xyz', '_blank');
        return null;
      }
    } catch (error) {
      console.error('Error connecting to Satoshi Browser:', error);
      throw error;
    }

    return null;
  },

  // Check if wallet is whitelisted
  async checkWhitelistStatus(walletAddress: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/wallets`);

      if (!response.ok) {
        throw new Error('Failed to fetch whitelist');
      }

      const wallets = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wallets.some((wallet: any) =>
        wallet.address.toLowerCase() === walletAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      return false;
    }
  }
};

export default leaderboardAPI;