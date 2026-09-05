import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Scoped to /api/v1 (everything Vesk.Api serves) so /api/contact stays
      // free for the Vercel function in api/contact.ts — run `vercel dev` to
      // exercise it locally.
      '/api/v1': 'http://localhost:5216',
      '/hubs': {
        target: 'http://localhost:5216',
        ws: true,
      },
    },
  },
})
