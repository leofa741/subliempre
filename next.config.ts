import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

// 🚨 VALIDACIÓN DE VARIABLES (La dejamos, es excelente)
const requiredEnvVars = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'ID_GOOGLE', 'GOOGLE_SECRET', 'JWT_SECRET', 'MONGODB_CNN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ ERROR: Falta la variable de entorno "${envVar}"`);
  }
}

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  sw: '/sw.js',
  scope: '/',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: { skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  output: 'standalone', // ✅ CLAVE PARA DOCKER: Crea una carpeta autocontenida y ligera
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
};

export default withPWA(nextConfig);