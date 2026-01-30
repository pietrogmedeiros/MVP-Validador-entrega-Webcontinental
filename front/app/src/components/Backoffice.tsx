import { useEffect, useMemo, useState } from 'react'

// Tema alinhado ao visual original: card claro, tabela com bordas e cabeçalho destacado
const cardClass = 'validation-result'
const tableClass = 'deliveries-table'

type Delivery = {
  invoiceNumber: string
  customerName?: string
  customerCPF?: string
  productDescription?: string
  productValue?: number
  status?: string
  createdAt?: string
  proofImageUrl?: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function formatCurrency(value?: number) {
  if (!value && value !== 0) return '-'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function maskCPF(cpf = '') {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-**') || '—'
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
        const res = await fetch(`${API_URL}/api/validations`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const mapped: Delivery[] = Array.isArray(data)
          ? data.map((d: any) => ({
              invoiceNumber: d.codigoEntrega || d.invoiceNumber || 'N/A',
              customerName: d.metadados?.clientName,
              customerCPF: d.metadados?.clientCpf,
              productDescription: d.metadados?.produto,
              productValue: d.metadados?.valor,
              status: d.status || 'pendente',
              createdAt: d.createdAt,
              proofImageUrl: d.metadados?.proofUrl,
            }))
          : []
        setDeliveries(mapped)
      } catch (err) {
        console.error(err)
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

  return (
    <section
      className={cardClass}
      style={{
        border: 'none',
        background: '#fff',
        boxShadow: '0 12px 35px -18px rgba(15, 23, 42, 0.35)',
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 6px', color: '#1A3A7B' }}>Backoffice</h2>
          <p className="muted" style={{ margin: 0 }}>Lista e filtros de entregas</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status (todos)</option>
            <option value="delivered">Entregue</option>
            <option value="Saiu para entrega">Saiu para entrega</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <input
            className="form-input"
            placeholder="Buscar NF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 160 }}
          />
        </div>
      </div>

      {loading && <p className="muted">Carregando...</p>}

      {!loading && (
        <div style={{ overflowX: 'auto' }}>
          <table
            className={tableClass}
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              minWidth: '960px',
              background: '#fff',
              border: '1px solid #e1e5e9',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>NF</th>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Cliente</th>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Produto</th>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Valor</th>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Status</th>
                <th style={{ background: '#f8f9fa', color: '#1A3A7B', padding: '12px', textAlign: 'left', borderBottom: '1px solid #e1e5e9' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.invoiceNumber}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e1e5e9' }}><strong>{d.invoiceNumber}</strong></td>
                  <td>
                    <div style={{ padding: '12px 12px 4px', borderBottom: '1px solid #e1e5e9' }}>{d.customerName ?? '—'}</div>
                    <div style={{ padding: '0 12px 12px', borderBottom: '1px solid #e1e5e9' }}>
                      <small className="muted">{maskCPF(d.customerCPF)}</small>
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e1e5e9' }}>{d.productDescription ?? '—'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e1e5e9' }}>{formatCurrency(d.productValue)}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e1e5e9' }}>{d.status || 'pendente'}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e1e5e9' }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '12px' }} className="muted">
                    Nenhum resultado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
