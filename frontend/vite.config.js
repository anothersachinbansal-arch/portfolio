import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Move Vite cache out of OneDrive to avoid EPERM lock issues on Windows
  cacheDir: path.join(os.tmpdir(), 'vite-cache', 'portfolio')
})
