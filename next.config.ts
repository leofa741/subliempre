import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

// 🔹 Configuración del PWA
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
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|svg)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
});

// 🔹 Tu configuración existente
const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 🚨 CRÍTICO: Se eliminó el bloque `env`. 
  // Next.js lee automáticamente tu archivo `.env` para el backend.
  // Exponer JWT_SECRET, MONGODB_CNN o API_SECRET aquí los hace visibles 
  // para cualquier persona que visite tu sitio web. ¡Nunca hagas esto!
  
  images: {
    // Se recomienda quitar 'unoptimized: true' para que Next.js optimice 
    // y comprima las imágenes automáticamente, mejorando la velocidad.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Es más seguro especificar el dominio exacto que '**'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Agrega aquí otros dominios de imágenes si los usas
      },
    ],
  },
};

// 🔹 Exportar envuelto con PWA
export default withPWA(nextConfig);