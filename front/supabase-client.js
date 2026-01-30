// Supabase Client Global - Carregado via CDN
const supabaseUrl = 'https://pnbsjmwatuhyijsuyjqe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYnNqbXdhdHVoeWlqc3V5anFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTA2ODEsImV4cCI6MjA3Njg4NjY4MX0.DWETpGIUySVrooL81Ho-oM2mDS1ZqD3dDEoAqvLst7g'

// Verificar se window.supabase existe (carregado via CDN)
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase não foi carregado via CDN')
} else {
    console.log('✅ Supabase CDN carregado')
}

// Criar o cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Cliente Supabase inicializado')
