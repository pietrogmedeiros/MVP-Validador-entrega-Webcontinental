import { useEffect, useMemo, useState } from 'react'

// Tema alinhado ao visual original: card claro, tabela com bordas e cabeçalho destacado
const tableClass = 'deliveries-table'

type Delivery = {
  id: number
  invoiceNumber: string
  customerName?: string
  customerCPF?: string
  productDescription?: string
  productValue?: number
  status?: string
  createdAt?: string
  proofImageUrl?: string
  logisticsCompany?: string
  dataEntrega?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function maskCPF(cpf?: string | null) {
  if (!cpf) return '—'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-**')
}

export default function Backoffice() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        console.log('🔍 Fetching from:', `${API_URL}/api/validations`)
        const res = await fetch(`${API_URL}/api/validations`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        console.log('📦 Raw data received:', data)
        const mapped: Delivery[] = Array.isArray(data)
          ? data.map((d: any) => ({
              id: d.id,
              invoiceNumber: d.codigoEntrega || d.invoiceNumber || 'N/A',
              customerName: d.metadados?.clientName,
              customerCPF: d.metadados?.clientCpf,
              productDescription: d.metadados?.produto,
              productValue: d.metadados?.valor,
              status: d.status || 'pendente',
              createdAt: d.createdAt,
              proofImageUrl: d.metadados?.proofUrl,
              logisticsCompany: d.metadados?.logisticsCompany,
              dataEntrega: d.dataEntrega,
            }))
          : []
        console.log('✅ Mapped deliveries:', mapped)
        setDeliveries(mapped)
      } catch (err) {
        console.error('❌ Error loading deliveries:', err)
        setDeliveries([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesStatus = !statusFilter || (d.status || '').toLowerCase() === statusFilter.toLowerCase()
      const text = `${d.invoiceNumber} ${d.customerName ?? ''}`.toLowerCase()
      const matchesSearch = !search || text.includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [deliveries, statusFilter, search])

  const handleDownload = async (id: number, nfe: string) => {
    try {
      // Fazer requisição para baixar o arquivo diretamente
      const link = document.createElement('a')
      link.href = `${API_URL}/api/validations/download/${id}`
      link.download = `comprovante_${nfe}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error(err)
      alert('Erro ao baixar comprovante')
    }
  }

  return (
    <div className="backoffice-container">
      <section className="backoffice-card">
        <div className="backoffice-header">
        <div>
          <h2 style={{ margin: '0 0 6px', color: '#1A3A7B', fontSize: '28px' }}>Backoffice</h2>
          <p className="muted" style={{ margin: 0, fontSize: '16px' }}>Lista e filtros de entregas</p>
        </div>
        <div className="backoffice-filters">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status (todos)</option>
            <option value="recebido">Recebido</option>
            <option value="delivered">Entregue</option>
            <option value="Saiu para entrega">Saiu para entrega</option>
            <option value="cancelado">Cancelado</option>
            <option value="pendente">Pendente</option>
          </select>
          <input
            className="form-input"
            placeholder="Buscar NF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 200 }}
          />
        </div>
      </div>

      {loading && <p className="muted" style={{ fontSize: '16px' }}>Carregando...</p>}

      {!loading && (
        <div className="backoffice-table-wrapper">
          <table className={tableClass}>
            <thead>
              <tr>
                <th>NF</th>
                <th>Cliente</th>
                <th>Tipo Entrega</th>
                <th>Logística</th>
                <th>Status</th>
                <th>Data Registro</th>
                <th>Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id || d.invoiceNumber}>
                  <td><strong>{d.invoiceNumber}</strong></td>
                  <td>
                    <div>{d.customerName ?? '—'}</div>
                    <small className="muted">{maskCPF(d.customerCPF)}</small>
                  </td>
                  <td>{d.productDescription ?? '—'}</td>
                  <td>{d.logisticsCompany ?? '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500',
                      background: d.status === 'delivered' || d.status === 'recebido' ? '#d4edda' : '#f8d7da',
                      color: d.status === 'delivered' || d.status === 'recebido' ? '#155724' : '#721c24'
                    }}>
                      {d.status || 'pendente'}
                    </span>
                  </td>
                  <td>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    {d.proofImageUrl ? (
                      <button
                        onClick={() => handleDownload(d.id, d.invoiceNumber)}
                        style={{
                          padding: '6px 12px',
                          background: '#1E90FF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        Baixar
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }} className="muted">
                    Nenhum resultado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </section>
    </div>
  )
}
