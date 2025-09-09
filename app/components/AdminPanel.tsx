'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '../lib/api';

interface AdminPanelProps {
  onClose: () => void;
}

interface WalletEntry {
  address: string;
  timestamp: string;
  email?: string;
  twitter?: string;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchWallets(storedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchWallets(data.token);
      } else {
        setError('Invalid credentials! Nice try though 😏');
      }
    } catch {
      setError('Connection error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallets = async (authToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/wallets`, {
        headers: { 
          'Authorization': authToken 
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets);
        setTotal(data.total);
      }
    } catch {
      setError('Failed to fetch wallets');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadWallets = () => {
    const csvContent = wallets.map(w => 
      `${w.address},${w.email || ''},${w.twitter || ''},${new Date(w.timestamp).toLocaleString()}`
    ).join('\n');
    
    const blob = new Blob([`Address,Email,Twitter,Timestamp\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danceface-wallets-${Date.now()}.csv`;
    a.click();
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setToken('');
    setWallets([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 max-w-md w-full border border-white/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            🔐 Admin Access
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
            >
              {isLoading ? 'Checking...' : 'Login'}
            </button>
          </form>
          
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 text-white/60 hover:text-white transition-all"
          >
            Back to Main Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              🎯 Admin Dashboard
            </h2>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => fetchWallets(token)}
                className="px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm md:text-base font-semibold transition-all"
              >
                🔄 Refresh
              </button>
              <button
                onClick={downloadWallets}
                className="px-3 py-2 md:px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm md:text-base font-semibold transition-all"
              >
                📥 Download CSV
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 md:px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm md:text-base font-semibold transition-all"
              >
                Logout
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 md:px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm md:text-base font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 md:p-4 mb-6">
            <p className="text-xl md:text-2xl text-white font-bold">
              Total Wallets: <span className="text-green-400">{total}</span> 🎉
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-white py-8">Loading wallets... 🕺</div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-white min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm">#</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm">Wallet Address</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm">Email</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm">Twitter</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-2 md:p-3 text-xs md:text-sm">{index + 1}</td>
                      <td className="p-2 md:p-3 font-mono text-xs md:text-sm break-all">{wallet.address}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">{wallet.email || '-'}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">{wallet.twitter || '-'}</td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">
                        {new Date(wallet.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {wallets.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  No wallets registered yet. Time to spread the word! 📣
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}