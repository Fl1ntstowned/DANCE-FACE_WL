import { useEffect, useState } from 'react';

export const useApiUrl = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:3001');

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // If we're on Railway production, use the production backend
      if (hostname === 'dance-face-wl.up.railway.app' || hostname.includes('railway.app')) {
        setApiUrl('https://dance-face-wl-backend-production.up.railway.app');
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        setApiUrl('http://localhost:3001');
      } else {
        // Fallback to production for any other domain
        setApiUrl('https://dance-face-wl-backend-production.up.railway.app');
      }
    }
  }, []);

  return apiUrl;
};