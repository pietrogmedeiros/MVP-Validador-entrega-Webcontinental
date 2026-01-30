import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// carrega variáveis de ambiente antes de ler SUPABASE_URL/KEY
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('⚠️ Supabase não configurado (SUPABASE_URL/SUPABASE_SERVICE_KEY ausentes), usando mock')
    return null
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}
