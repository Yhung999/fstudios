import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { synthetiqResolverPlugin } from './server/synthetiqResolver.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), synthetiqResolverPlugin()],
})
