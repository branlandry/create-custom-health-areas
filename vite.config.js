import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/create-custom-health-areas/',   // must match repo name exactly, with leading+trailing slash
})
