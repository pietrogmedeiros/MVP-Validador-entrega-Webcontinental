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
            .eq('numero_nf', invoiceNumber.toUpperCase())
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
                numero_nf: deliveryData.invoiceNumber,
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
        const fileName = `${invoiceNumber.toUpperCase()}.jpg`
        const { data, error } = await supabase
            .storage
            .from('comprovantes_entregas')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) {
            throw error
        }

        // Retornar URL pública do arquivo
        const { data: { publicUrl } } = supabase
            .storage
            .from('comprovantes_entregas')
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error) {
        console.error('Erro ao fazer upload:', error)
        throw error
    }
}
