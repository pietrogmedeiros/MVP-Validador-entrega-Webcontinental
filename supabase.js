import { createClient } from '@supabase/supabase-js'

// Usar as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pnbsjmwatuhyijsuyjqe.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYnNqbXdhdHVoeWlqc3V5anFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTA2ODEsImV4cCI6MjA3Njg4NjY4MX0.DWETpGIUySVrooL81Ho-oM2mDS1ZqD3dDEoAqvLst7g'

console.log('🔌 Inicializando Supabase...')
console.log('URL:', supabaseUrl ? '✅ Carregada' : '❌ Não encontrada')
console.log('Chave:', supabaseAnonKey ? '✅ Carregada' : '❌ Não encontrada')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Buscar NF na tabela nfs_storage
export async function searchNF(invoiceNumber) {
    try {
        console.log('🔍 Buscando NF:', invoiceNumber);
        
        const { data, error } = await supabase
            .from('nfs_storage')
            .select('*')
            .eq('numero_nfe', invoiceNumber.toUpperCase())
            .single()

        if (error) {
            console.error('❌ Erro na query:', error);
            // Retornar null se não encontrado (código 406 ou PGRST116)
            if (error.code === 'PGRST116' || error.status === 406) {
                console.log('ℹ️ NF não encontrada');
                return null;
            }
            throw error;
        }

        console.log('✅ NF encontrada:', data);
        return data;
    } catch (error) {
        console.error('Erro ao buscar NF:', error);
        return null;
    }
}

// Salvar comprovante de entrega
export async function saveDelivery(deliveryData) {
    try {
        const { data, error } = await supabase
            .from('delivery_output')
            .insert([{
                numero_nfe: deliveryData.invoiceNumber,
                tipo_entrega: deliveryData.deliveryType,
                empresa_logistica: deliveryData.logisticsCompany || null,
                nome_cliente: deliveryData.clientName || null,
                cpf_cliente: deliveryData.clientCpf || null,
                comprovante_url: deliveryData.proofUrl,
                data_hora_registro: new Date().toISOString(),
                created_at: new Date().toISOString()
            }])
            .select()

        if (error) {
            throw error
        }

        return data[0]
    } catch (error) {
        console.error('Erro ao salvar entrega:', error)
        throw error
    }
}

// Upload de comprovante para o bucket
export async function uploadProof(invoiceNumber, file) {
    try {
        // Gerar nome único para o arquivo com timestamp
        const timestamp = new Date().getTime();
        const extension = file.type.includes('image') ? 'jpg' : 'jpg';
        const fileName = `${invoiceNumber.toUpperCase()}_${timestamp}.${extension}`;
        
        // Criar pasta com data para organizar os comprovantes
        const today = new Date().toISOString().split('T')[0];
        const filePath = `comprovantes/${today}/${fileName}`;

        // Upload do arquivo para o bucket 'comprovantes_entregas'
        const { data, error } = await supabase
            .storage
            .from('comprovantes_entregas')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'image/jpeg'
            });

        if (error) {
            throw error;
        }

        // Retornar URL pública do arquivo
        const { data: { publicUrl } } = supabase
            .storage
            .from('comprovantes_entregas')
            .getPublicUrl(filePath);

        console.log('✅ Comprovante salvo no bucket:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('Erro ao fazer upload do comprovante:', error);
        throw error;
    }
}
