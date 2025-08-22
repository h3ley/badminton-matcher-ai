import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.CF_PAGES_COMMIT_SHA?.slice(0,7) ||
      process.env.npm_package_version || 'dev'
    ),
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      manifest: {
        id: '/',
        name: 'Badminton Matcher',
        short_name: 'Matcher',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
})
