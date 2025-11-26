import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __VITE_SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
    __VITE_SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY)
  },
  server: {
    middlewareMode: false,
  }
})
