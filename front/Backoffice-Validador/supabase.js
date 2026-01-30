// Inicializar Supabase globalmente
const supabaseUrl = 'https://pnbsjmwatuhyijsuyjqe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYnNqbXdhdHVoeWlqc3V5anFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTA2ODEsImV4cCI6MjA3Njg4NjY4MX0.DWETpGIUySVrooL81Ho-oM2mDS1ZqD3dDEoAqvLst7g'

// Criar o cliente Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Supabase backoffice inicializado')

// Buscar todas as entregas da tabela delivery_output
async function fetchDeliveries() {
    try {
        console.log('📦 Buscando entregas do Supabase...');
        
        const { data, error } = await supabase
            .from('delivery_output')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro ao buscar entregas:', error);
            return [];
        }
        
        console.log(`✅ ${data?.length || 0} entregas carregadas`);
        return data || [];
    } catch (error) {
        console.error('❌ Erro exceção:', error);
        return [];
    }
}

// Buscar entregas com filtro
async function fetchDeliveriesFiltered(filters = {}) {
    try {
        let query = supabase
            .from('delivery_output')
            .select('*');
        
        // Filtros opcionais
        if (filters.numero_nfe) {
            query = query.ilike('numero_nfe', `%${filters.numero_nfe}%`);
        }
        if (filters.status_entrega) {
            query = query.eq('status_entrega', filters.status_entrega);
        }
        if (filters.empresa_logistica) {
            query = query.eq('empresa_logistica', filters.empresa_logistica);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Erro ao buscar com filtros:', error);
            return [];
        }
        
        return data || [];
    } catch (error) {
        console.error('❌ Erro exceção:', error);
        return [];
    }
}

// Atualizar status de uma entrega
async function updateDeliveryStatus(id, newStatus) {
    try {
        const { data, error } = await supabase
            .from('delivery_output')
            .update({ status_entrega: newStatus })
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('❌ Erro ao atualizar status:', error);
            return null;
        }
        
        console.log('✅ Status atualizado:', data[0]);
        return data[0];
    } catch (error) {
        console.error('❌ Erro exceção:', error);
        return null;
    }
}

// Deletar uma entrega
async function deleteDelivery(id) {
    try {
        const { error } = await supabase
            .from('delivery_output')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('❌ Erro ao deletar:', error);
            return false;
        }
        
        console.log('✅ Entrega deletada');
        return true;
    } catch (error) {
        console.error('❌ Erro exceção:', error);
        return false;
    }
}
