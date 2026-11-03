import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import aitDevtools from "@apps-in-toss/devtools/unplugin";

// https://vite.dev/config/
export default defineConfig({
  server: {
    strictPort: true,
    // Windows file events can be missed during adapter regeneration.
    watch: { usePolling: process.platform === 'win32', interval: 300 },
  },
  plugins: [aitDevtools.vite(), react()],
})
