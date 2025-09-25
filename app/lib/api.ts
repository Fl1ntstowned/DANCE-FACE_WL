export const getApiUrl = () => {
  // Check for production domains
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domains - all use the same Railway backend
    if (hostname === 'satoshibrowser.xyz' ||
        hostname === 'www.satoshibrowser.xyz' ||
        hostname === 'dance-face-wl.up.railway.app' ||
        hostname.includes('railway.app')) {
      return 'https://dance-face-wl-backend-production.up.railway.app';
    }
  }

  // Use environment variable or fallback to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};