import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

const shortSha = process.env.CF_PAGES_COMMIT_SHA?.slice(0,7) ?? null

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),    
    __APP_COMMIT__:  JSON.stringify(shortSha),    
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
