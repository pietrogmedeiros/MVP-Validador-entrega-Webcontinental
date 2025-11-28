// Estado da aplicação
let allDeliveries = [];
let filteredDeliveries = [];
let currentFilters = {
    status: '',
    invoice: ''
};

// Elementos DOM
let deliveriesTable, deliveriesTbody, loadingElement, emptyState;
let totalDeliveriesEl, outForDeliveryEl, cancelledDeliveriesEl, completedDeliveriesEl;
let statusFilter, searchInvoice, filtersPanel;
let deliveryModal, modalTitle, modalBody, closeModal;
let imageModal, modalImage, downloadImage, closeImageModal;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏢 Backoffice iniciado');
    initializeElements();
    setupEventListeners();
    loadDeliveries();
});

// Inicializar elementos DOM
function initializeElements() {
    // Tabela
    deliveriesTable = document.getElementById('deliveries-table');
    deliveriesTbody = document.getElementById('deliveries-tbody');
    loadingElement = document.getElementById('loading');
    emptyState = document.getElementById('empty-state');
    
    // Stats
    totalDeliveriesEl = document.getElementById('total-deliveries');
    outForDeliveryEl = document.getElementById('out-for-delivery');
    cancelledDeliveriesEl = document.getElementById('cancelled-deliveries');
    completedDeliveriesEl = document.getElementById('completed-deliveries');
    
    // Filtros
    statusFilter = document.getElementById('status-filter');
    searchInvoice = document.getElementById('search-invoice');
    filtersPanel = document.getElementById('filters-panel');
    
    // Modais
    deliveryModal = document.getElementById('delivery-modal');
    modalTitle = document.getElementById('modal-title');
    modalBody = document.getElementById('modal-body');
    closeModal = document.getElementById('close-modal');
    
    imageModal = document.getElementById('image-modal');
    modalImage = document.getElementById('modal-image');
    downloadImage = document.getElementById('download-image');
    closeImageModal = document.getElementById('close-image-modal');
}

// Configurar event listeners
function setupEventListeners() {
    // Botões do header
    document.getElementById('refresh-btn').addEventListener('click', loadDeliveries);
    document.getElementById('filter-btn').addEventListener('click', toggleFilters);
    
    // Filtros
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // Modais
    closeModal.addEventListener('click', () => hideModal(deliveryModal));
    closeImageModal.addEventListener('click', () => hideModal(imageModal));
}
            console.error('Erro no download:', error);
            alert('Erro ao fazer download. Tente novamente.');
        }
    });
    
    // Fechar modal clicando fora
    [deliveryModal, imageModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
    
    // ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal(deliveryModal);
            hideModal(imageModal);
        }
    });
}

// Carregar entregas da API
async function loadDeliveries() {
    showLoading();
    
    try {
        console.log('📦 Carregando entregas do Supabase...');
        const data = await fetchDeliveries();
        
        allDeliveries = data;
        filteredDeliveries = [...allDeliveries];
        
        updateStats();
        renderTable();
        hideLoading();
        
        console.log(`✅ ${allDeliveries.length} entregas carregadas do Supabase`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar entregas:', error);
        showError('Erro ao carregar entregas. Tente novamente.');
        hideLoading();
    }
}

// Função para gerar URL real do S3
function generateS3ImageUrl(invoiceNumber) {
    if (!invoiceNumber) return null;
    // Padrão: delivery-proof-{invoiceNumber}-{timestamp}.jpg
    // Como não temos o timestamp exato, tentamos o padrão mais comum
    return `${API_CONFIG.s3BaseURL}/delivery-proof-${invoiceNumber}-${Date.now()}.jpg`;
}

// Função para fazer download de imagem do S3
async function downloadImageFromS3(invoiceNumber) {
    try {
        // Tentar diferentes padrões de nomenclatura
        const possibleUrls = [
            `${API_CONFIG.s3BaseURL}/delivery-proof-${invoiceNumber}.jpg`,
            `${API_CONFIG.s3BaseURL}/proof-${invoiceNumber}.jpg`,
            `${API_CONFIG.s3BaseURL}/${invoiceNumber}.jpg`,
            `${API_CONFIG.s3BaseURL}/comprovante-${invoiceNumber}.jpg`
        ];

        for (const url of possibleUrls) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    return url;
                }
            } catch (e) {
                console.log(`Tentativa falhou para: ${url}`);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar imagem no S3:', error);
        return null;
    }
}

// Atualizar estatísticas
function updateStats() {
    const total = allDeliveries.length;
    const outForDelivery = allDeliveries.filter(d => d.status === 'Saiu para entrega').length;
    const cancelled = allDeliveries.filter(d => d.status === 'Cancelado').length;
    const completed = allDeliveries.filter(d => d.status === 'delivered').length;
    
    totalDeliveriesEl.textContent = total;
    outForDeliveryEl.textContent = outForDelivery;
    cancelledDeliveriesEl.textContent = cancelled;
    completedDeliveriesEl.textContent = completed;
}

// Renderizar tabela
function renderTable() {
    if (filteredDeliveries.length === 0) {
        deliveriesTable.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    
    deliveriesTable.style.display = 'table';
    emptyState.classList.add('hidden');
    
    deliveriesTbody.innerHTML = filteredDeliveries.map(delivery => {
        const statusClass = delivery.status.toLowerCase().replace(/\s+/g, '-');
        const statusText = delivery.status;
        const date = new Date(delivery.createdAt).toLocaleDateString('pt-BR');
        const value = delivery.productValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        
        return `
            <tr>
                <td><strong>${delivery.invoiceNumber}</strong></td>
                <td>
                    <div>${delivery.customerName}</div>
                    <small class="text-muted">${maskCPF(delivery.customerCPF)}</small>
                </td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${delivery.productDescription}">
                        ${delivery.productDescription}
                    </div>
                </td>
                <td><strong>${value}</strong></td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>${date}</td>
                <td>
                    ${delivery.proofImageUrl ? 
                        `<button onclick="viewImage('${delivery.proofImageUrl}', '${delivery.invoiceNumber}')" class="btn btn-small btn-primary">
                            📷 Ver
                        </button>` : 
                        '<span class="text-muted">Sem comprovante</span>'
                    }
                </td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewDetails('${delivery.invoiceNumber}')" class="btn btn-small btn-primary">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Mostrar/esconder filtros
function toggleFilters() {
    filtersPanel.classList.toggle('hidden');
}

// Aplicar filtros
function applyFilters() {
    currentFilters.status = statusFilter.value;
    currentFilters.invoice = searchInvoice.value.toLowerCase();
    
    filteredDeliveries = allDeliveries.filter(delivery => {
        const matchesStatus = !currentFilters.status || delivery.status === currentFilters.status;
        const matchesInvoice = !currentFilters.invoice || 
            delivery.invoiceNumber.toLowerCase().includes(currentFilters.invoice);
        
        return matchesStatus && matchesInvoice;
    });
    
    renderTable();
    console.log(`Filtros aplicados: ${filteredDeliveries.length} resultados`);
}

// Limpar filtros
function clearFilters() {
    statusFilter.value = '';
    searchInvoice.value = '';
    currentFilters = { status: '', invoice: '' };
    filteredDeliveries = [...allDeliveries];
    renderTable();
    console.log('Filtros limpos');
}

// Ver detalhes da entrega
function viewDetails(invoiceNumber) {
    const delivery = allDeliveries.find(d => d.invoiceNumber === invoiceNumber);
    if (!delivery) return;
    
    modalTitle.textContent = `Detalhes - ${delivery.invoiceNumber}`;
    modalBody.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div>
                <h4 style="color: #1A3A7B; margin-bottom: 10px;">Informações da Nota Fiscal</h4>
                <p><strong>Número:</strong> ${delivery.invoiceNumber}</p>
                <p><strong>Status:</strong> <span class="status-badge ${delivery.status.toLowerCase().replace(/\s+/g, '-')}">${delivery.status}</span></p>
                <p><strong>Data de Criação:</strong> ${new Date(delivery.createdAt).toLocaleString('pt-BR')}</p>
                ${delivery.deliveredAt ? `<p><strong>Data de Entrega:</strong> ${new Date(delivery.deliveredAt).toLocaleString('pt-BR')}</p>` : ''}
            </div>
            
            <div>
                <h4 style="color: #1A3A7B; margin-bottom: 10px;">Cliente</h4>
                <p><strong>Nome:</strong> ${delivery.customerName}</p>
                <p><strong>CPF:</strong> ${maskCPF(delivery.customerCPF)}</p>
            </div>
            
            <div>
                <h4 style="color: #1A3A7B; margin-bottom: 10px;">Produto</h4>
                <p><strong>Descrição:</strong> ${delivery.productDescription}</p>
                <p><strong>Valor:</strong> ${delivery.productValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            
            ${delivery.proofImageUrl ? `
                <div>
                    <h4 style="color: #1A3A7B; margin-bottom: 10px;">Comprovante</h4>
                    <button onclick="viewImage('${delivery.proofImageUrl}', '${delivery.invoiceNumber}')" class="btn btn-primary">
                        📷 Ver Comprovante
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    showModal(deliveryModal);
}

// Ver imagem
async function viewImage(imageUrl, invoiceNumber) {
    try {
        // Se não há URL, tentar buscar no S3
        if (!imageUrl || imageUrl.includes('placeholder')) {
            imageUrl = await downloadImageFromS3(invoiceNumber);
        }
        
        if (!imageUrl) {
            alert('Comprovante não encontrado para esta entrega.');
            return;
        }

        modalImage.src = imageUrl;
        downloadImage.href = imageUrl;
        downloadImage.download = `comprovante-${invoiceNumber}.jpg`;
        
        // Adicionar atributo para forçar download
        downloadImage.setAttribute('target', '_blank');
        downloadImage.setAttribute('rel', 'noopener noreferrer');
        
        showModal(imageModal);
    } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        alert('Erro ao carregar comprovante. Tente novamente.');
    }
}

// Atualizar status da entrega
function updateStatus(invoiceNumber, newStatus) {
    const confirmed = confirm(`Tem certeza que deseja alterar o status para "${newStatus}"?`);
    if (!confirmed) return;
    
    const delivery = allDeliveries.find(d => d.invoiceNumber === invoiceNumber);
    if (!delivery) return;
    
    // Simular atualização no banco
    delivery.status = newStatus;
    if (newStatus === 'delivered') {
        delivery.deliveredAt = new Date().toISOString();
    }
    
    // Atualizar interface
    updateStats();
    applyFilters(); // Re-aplicar filtros para atualizar tabela
    
    console.log(`Status da ${invoiceNumber} atualizado para: ${newStatus}`);
    
    // Em produção, faria uma chamada para o backend aqui
    // await updateDeliveryStatus(invoiceNumber, newStatus);
}

// Utilitários
function maskCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-**');
}

function showLoading() {
    loadingElement.style.display = 'block';
    deliveriesTable.style.display = 'none';
    emptyState.classList.add('hidden');
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    alert(message); // Em produção, usar um toast/notification melhor
}

function showModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Expor funções globais para onclick
window.viewDetails = viewDetails;
window.viewImage = viewImage;
window.updateStatus = updateStatus;