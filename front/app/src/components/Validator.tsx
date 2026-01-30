import { useEffect, useMemo, useState } from 'react'

type ValidationResult = {
  id?: string
  codigoEntrega: string
  status?: string
  metadados?: Record<string, unknown>
  createdAt?: string
}

type UploadResponse = {
  url: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function Validator() {
  const [codigoEntrega, setCodigoEntrega] = useState('')
  const [deliveryType, setDeliveryType] = useState('')
  const [logisticsCompany, setLogisticsCompany] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientCpf, setClientCpf] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loadingValidate, setLoadingValidate] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // controla popup de loading
  const showLoading = () => {
    const el = document.getElementById('loading-popup')
    if (el) el.classList.remove('hidden')
  }
  const hideLoading = () => {
    const el = document.getElementById('loading-popup')
    if (el) el.classList.add('hidden')
  }

  useEffect(() => {
    if (!file) return setFilePreview(null)
    const reader = new FileReader()
    reader.onload = () => setFilePreview(reader.result as string)
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])

  // Valida automaticamente ao perder foco do input ou ao mudar valor (debounce leve)
  useEffect(() => {
    if (!codigoEntrega.trim()) return
    const handler = setTimeout(() => {
      if (!loadingValidate) void handleValidate()
    }, 300)
    return () => clearTimeout(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoEntrega])

  const canSubmit = useMemo(() => {
    return (
      !!validation?.codigoEntrega &&
      deliveryType !== '' &&
      (deliveryType === 'cliente' ? clientName !== '' && clientCpf !== '' : logisticsCompany !== '') &&
      !!file
    )
  }, [validation, deliveryType, logisticsCompany, clientName, clientCpf, file])

  async function handleValidate() {
    setError(null)
    setSuccess(null)
    setValidation(null)
    if (!codigoEntrega.trim()) {
      setError('Informe o número da NF')
      return
    }
    setLoadingValidate(true)
    showLoading()
    try {
      const res = await fetch(`${API_URL}/api/validations?codigoEntrega=${encodeURIComponent(codigoEntrega)}`)
      if (!res.ok) throw new Error(`Erro ao validar (${res.status})`)
      const data: ValidationResult[] = await res.json()
      if (data.length === 0) {
        setError('NF não encontrada')
        setValidation(null)
        return
      }
      setValidation(data[0])
      setSuccess('NF validada com sucesso')
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao validar NF')
    } finally {
      setLoadingValidate(false)
      hideLoading()
    }
  }

  async function uploadFile(): Promise<string | null> {
    if (!file) return null
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_URL}/api/uploads`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Falha no upload')
    const data: UploadResponse = await res.json()
    return data.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!canSubmit) {
      setError('Preencha todos os campos obrigatórios e valide a NF')
      return
    }
    setLoadingSubmit(true)
    showLoading()
    try {
      const proofUrl = await uploadFile()
      const payload = {
        codigoEntrega,
        metadados: {
          deliveryType,
          logisticsCompany: deliveryType === 'transportadora' ? logisticsCompany : undefined,
          clientName: deliveryType === 'cliente' ? clientName : undefined,
          clientCpf: deliveryType === 'cliente' ? clientCpf : undefined,
          proofUrl,
        },
      }
      const res = await fetch(`${API_URL}/api/validations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Erro ao registrar (${res.status})`)
      const data: ValidationResult = await res.json()
      setSuccess('Entrega registrada com sucesso')
      setValidation(data)
    } catch (err: unknown) {
      console.error(err)
      setError('Falha ao registrar entrega')
    } finally {
      setLoadingSubmit(false)
      hideLoading()
    }
  }

  return (
    <form id="delivery-form" className="delivery-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">
          Número da Nota Fiscal
          <span className="required">*</span>
        </label>
        <div className="input-with-button">
          <input
            type="text"
            className={`form-input ${validation ? 'valid' : ''}`}
            placeholder="Digite o número da NF"
            value={codigoEntrega}
            onChange={(e) => setCodigoEntrega(e.target.value)}
            required
          />
          <button type="button" className="scan-btn" onClick={handleValidate} disabled={loadingValidate || !codigoEntrega}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="2" height="12" fill="currentColor" />
              <rect x="6" y="6" width="1" height="12" fill="currentColor" />
              <rect x="9" y="6" width="2" height="12" fill="currentColor" />
              <rect x="13" y="6" width="1" height="12" fill="currentColor" />
              <rect x="16" y="6" width="1" height="12" fill="currentColor" />
              <rect x="19" y="6" width="2" height="12" fill="currentColor" />
            </svg>
            {loadingValidate ? 'Validando...' : 'Validar NF'}
          </button>
        </div>
        <div className="field-feedback">{error ? <span className="error">{error}</span> : null}</div>
      </div>

      <div id="validation-result" className={`validation-result ${validation ? '' : 'hidden'} ${error ? 'error' : ''}`}>
        <div className="validation-header">
          <h3>Nota Fiscal Validada</h3>
        </div>
        <div className="validation-content">
          <div className="validation-item">
            <span className="label">CPF (Confirmação):</span>
            <span className="value">{String(validation?.metadados?.cpf ?? '—')}</span>
          </div>
          <div className="validation-item">
            <span className="label">CEP (Destino):</span>
            <span className="value">{String(validation?.metadados?.cep ?? '—')}</span>
          </div>
          <div className="validation-item">
            <span className="label">Produto:</span>
            <span className="value">{String(validation?.metadados?.produto ?? '—')}</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Você é?
          <span className="required">*</span>
        </label>
        <select className="form-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} required>
          <option value="">Selecione o tipo</option>
          <option value="cliente">Cliente</option>
          <option value="transportadora">Transportadora</option>
        </select>
      </div>

      <div id="client-fields" className={`conditional-fields ${deliveryType === 'cliente' ? 'show' : 'hidden'}`}>
        <div className="form-group">
          <label className="form-label">
            Seu nome completo
            <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Digite o nome completo"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            Seu CPF
            <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="000.000.000-00"
            maxLength={14}
            value={clientCpf}
            onChange={(e) => setClientCpf(e.target.value)}
          />
        </div>
      </div>

      <div id="logistics-fields" className={`conditional-fields ${deliveryType === 'transportadora' ? 'show' : 'hidden'}`}>
        <div className="form-group">
          <label className="form-label">
            Empresa de Logística
            <span className="required">*</span>
          </label>
          <select className="form-select" value={logisticsCompany} onChange={(e) => setLogisticsCompany(e.target.value)}>
            <option value="">Selecione a transportadora</option>
            <option value="loggi">Loggi</option>
            <option value="correios">Correios</option>
            <option value="jadlog">Jadlog</option>
            <option value="frota-propria">Frota Própria</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Anexar Comprovante (Foto)
          <span className="required">*</span>
        </label>
        <input
          type="file"
          className="form-file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <div className="file-info">Toque para tirar uma foto do comprovante</div>
        <div id="file-preview" className={`file-preview ${filePreview ? '' : 'hidden'}`}>
          <div className="preview-header">
            <span className="preview-label">Comprovante selecionado:</span>
          </div>
          <div className="preview-image-container">
            {filePreview && <img id="preview-image" src={filePreview} alt="Preview do comprovante" />}
          </div>
          <div className="preview-actions">
            <button type="button" id="remove-file" className="remove-file" onClick={() => { setFile(null); setFilePreview(null); }}>
              🗑️ Remover foto
            </button>
          </div>
        </div>
      </div>

      <button type="submit" id="submit-btn" className="submit-btn" disabled={!canSubmit || loadingSubmit}>
        <span className="btn-text">{loadingSubmit ? 'Enviando...' : 'Registrar Entrega'}</span>
      </button>

      <div id="submission-result" className={`submission-result ${success ? '' : 'hidden'}`}>
        <div className="success-message">
          <h3>Entrega Registrada com Sucesso!</h3>
          <p>Obrigado por utilizar nosso sistema de validação.</p>
          <button type="button" id="new-delivery" className="new-delivery-btn" onClick={() => { setValidation(null); setFile(null); setFilePreview(null); setSuccess(null); setCodigoEntrega(''); setDeliveryType(''); setLogisticsCompany(''); setClientCpf(''); setClientName(''); }}>
            Nova Entrega
          </button>
        </div>
      </div>
    </form>
  )
}

export default Validator
