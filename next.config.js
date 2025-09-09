/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://dance-face-wl-backend-production.up.railway.app'
        : 'http://localhost:3001')
  }
}

module.exports = nextConfig