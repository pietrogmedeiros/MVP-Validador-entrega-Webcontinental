import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Buscar NF na tabela nfs_storage
export async function searchNF(invoiceNumber) {
    try {
        const { data, error } = await supabase
            .from('nfs_storage')
            .select('*')
            .eq('numero_nfe', invoiceNumber.toUpperCase())
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        return data
    } catch (error) {
        console.error('Erro ao buscar NF:', error)
        throw error
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
