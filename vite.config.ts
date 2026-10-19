import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base + HashRouter lets the build run from any GitHub Pages sub-path.
export default defineConfig({
  plugins: [react()],
  base: './',
})
