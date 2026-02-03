import { useEffect, useMemo, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

type ValidationResult = {
  id?: string
  codigoEntrega: string
  status?: string
  metadados?: Record<string, unknown>
  createdAt?: string
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

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

  async function handleValidate(code?: string) {
    const nfNumber = code || codigoEntrega
    setError(null)
    setValidation(null)
    if (!nfNumber.trim()) {
      setError('Informe o número da NF')
      return
    }
    setLoadingValidate(true)
    showLoading()
    try {
      console.log('Validando NF:', nfNumber)
      const res = await fetch(`${API_URL}/api/validations?codigoEntrega=${encodeURIComponent(nfNumber)}`)
      console.log('Status da resposta:', res.status)
      
      if (!res.ok) {
        throw new Error(`Erro ao validar (${res.status})`)
      }
      
      const data: ValidationResult[] = await res.json()
      console.log('Dados recebidos:', data)
      
      if (!Array.isArray(data) || data.length === 0) {
        setError('NF não encontrada')
        setValidation(null)
        return
      }
      
      setValidation(data[0])
      setError(null)
    } catch (err: unknown) {
      console.error('Erro completo:', err)
      if (err instanceof Error) {
        setError(`Erro: ${err.message}`)
      } else {
        setError('Falha ao validar NF')
      }
    } finally {
      setLoadingValidate(false)
      hideLoading()
    }
  }

  function handleOpenScanner() {
    setShowScanner(true)
  }

  function handleCloseScanner() {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setShowScanner(false)
  }

  function onScanSuccess(decodedText: string) {
    setCodigoEntrega(decodedText)
    handleCloseScanner()
    // Validar diretamente com o valor escaneado
    handleValidate(decodedText)
  }

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'barcode-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 150 },
          formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // Todos os formatos de código de barras
        },
        false
      )
      scannerRef.current.render(onScanSuccess, (error) => {
        console.warn(`Erro no scanner: ${error}`)
      })
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [showScanner])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!canSubmit) {
      setError('Preencha todos os campos obrigatórios e valide a NF')
      return
    }
    setLoadingSubmit(true)
    showLoading()
    try {
      // Enviar tudo como multipart/form-data
      const formData = new FormData()
      formData.append('codigoEntrega', codigoEntrega)
      formData.append('deliveryType', deliveryType)
      
      if (deliveryType === 'transportadora') {
        formData.append('logisticsCompany', logisticsCompany)
      } else if (deliveryType === 'cliente') {
        formData.append('clientName', clientName)
        formData.append('clientCpf', clientCpf)
      }
      
      if (file) {
        formData.append('proof', file)
      }

      const res = await fetch(`${API_URL}/api/validations`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Erro ao registrar (${res.status})`)
      const data: ValidationResult = await res.json()
      setValidation(data)
      setShowSuccessModal(true)
      
      // Limpar campos após sucesso
      setDeliveryType('')
      setLogisticsCompany('')
      setClientName('')
      setClientCpf('')
      setFile(null)
      setFilePreview(null)
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
          <button type="button" className="scan-btn" onClick={handleOpenScanner} title="Escanear código de barras">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="2" height="12" fill="currentColor" />
              <rect x="6" y="6" width="1" height="12" fill="currentColor" />
              <rect x="9" y="6" width="2" height="12" fill="currentColor" />
              <rect x="13" y="6" width="1" height="12" fill="currentColor" />
              <rect x="16" y="6" width="1" height="12" fill="currentColor" />
              <rect x="19" y="6" width="2" height="12" fill="currentColor" />
            </svg>
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

      {error && !validation && (
        <div className="alert alert-error" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33' }}>
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px 30px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48px'
            }}>
              ✓
            </div>
            <h2 style={{ 
              color: '#1f2937', 
              marginBottom: '12px',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              Entrega Registrada!
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Sua entrega foi registrada com sucesso no sistema.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false)
                setValidation(null)
                setCodigoEntrega('')
                setDeliveryType('')
                setLogisticsCompany('')
                setClientCpf('')
                setClientName('')
              }}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Nova Entrega
            </button>
          </div>
        </div>
      )}

      {/* Modal Scanner de Código de Barras */}
      {showScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#1f2937', 
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              Escaneie o Código de Barras
            </h2>
            <div id="barcode-reader" style={{ width: '100%' }}></div>
            <button
              type="button"
              onClick={handleCloseScanner}
              style={{
                marginTop: '16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </form>
  )
}

export default Validator
