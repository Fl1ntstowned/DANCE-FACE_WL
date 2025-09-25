export const getApiUrl = () => {
  // Check for production domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domains - all use the same Railway backend
    if (hostname === 'satoshibrowser.xyz' ||
        hostname === 'www.satoshibrowser.xyz' ||
        hostname === 'dance-face-wl.up.railway.app' ||
        hostname.includes('railway.app') ||
        !hostname.includes('localhost')) {
      // ALWAYS use production backend for non-localhost domains
      return 'https://dance-face-wl-backend-production.up.railway.app';
    }
  }

  // ONLY use localhost when actually on localhost
  return 'http://localhost:3001';
};