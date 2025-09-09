export const getApiUrl = () => {
  // In production, always use the production backend
  if (typeof window !== 'undefined' && window.location.hostname === 'dance-face-wl.up.railway.app') {
    return 'https://dance-face-wl-backend-production.up.railway.app';
  }
  
  // Use environment variable or fallback to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};