import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    tailwindcss(),   // ← Tailwind v4 Vite plugin
    react(),
    crx({ manifest }),
  ],
})