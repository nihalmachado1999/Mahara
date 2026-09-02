import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mahara',
        short_name: 'Mahara',
        description: 'Discover the beauty of Bahrain — destinations, culture, food, and events.',
        theme_color: '#FAF6EF',
        background_color: '#1A1410',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precaching (JS/CSS/HTML app shell) already happens by default —
        // this block only adds a strategy for cross-origin requests, which
        // the defaults don't cover at all.
        runtimeCaching: [
          {
            // Wikimedia + Pexels destination/food photos
            urlPattern: ({ url }) =>
              url.hostname.includes('wikimedia.org') || url.hostname.includes('pexels.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'photo-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Aladhan prayer times (Culture page) — fine to serve slightly
            // stale from cache if the network call fails
            urlPattern: ({ url }) => url.hostname.includes('aladhan.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prayer-times-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
          {
            // Open-Meteo weather (used inside the itinerary Edge Function,
            // not called from the browser directly, but harmless to cover)
            urlPattern: ({ url }) => url.hostname.includes('open-meteo.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 6 * 60 * 60, // 6 hours
              },
            },
          },
        ],
      },
    }),
  ],
})