import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

// 🚨 VALIDACIÓN DE VARIABLES DE ENTORNO (Fail-Fast)
// Si alguna de estas falta en Vercel, el build fallará inmediatamente con un error claro.
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'ID_GOOGLE',
  'GOOGLE_SECRET',
  'JWT_SECRET',
  'MONGODB_CNN'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`
      ❌ ERROR CRÍTICO DE COMPILACIÓN EN VERCEL:
      La variable de entorno "${envVar}" no está definida.
      Por favor, ve a Vercel > Settings > Environment Variables y agrégala.
    `);
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
  cacheStartUrl: true,
  dynamicStartUrl: true,
  publicExcludes: ['!node_modules/**/*'],
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    // ⚠️ NO DEBE HABER NADA DE 'runtimeCaching' AQUÍ
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ⚠️ NO DEBE HABER UN BLOQUE 'env' AQUÍ (es un riesgo de seguridad)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default withPWA(nextConfig);