// Banco de Dados Fictício (Mock Database)
const mockDatabase = [
    {
        invoiceNumber: 'NF001234567',
        customerCPF: '123.456.789-01',
        deliveryCEP: '01310-100',
        productDescription: 'Smartphone Samsung Galaxy S23 128GB Preto'
    },
    {
        invoiceNumber: 'NF002345678',
        customerCPF: '987.654.321-09',
        deliveryCEP: '04567-890',
        productDescription: 'Notebook Dell Inspiron 15 3000 Intel Core i5'
    },
    {
        invoiceNumber: 'NF003456789',
        customerCPF: '456.789.123-45',
        deliveryCEP: '22071-900',
        productDescription: 'Smart TV LG 55" 4K UHD ThinQ AI'
    },
    {
        invoiceNumber: 'NF004567890',
        customerCPF: '321.654.987-65',
        deliveryCEP: '30112-000',
        productDescription: 'Fone de Ouvido Sony WH-1000XM4 Bluetooth'
    },
    {
        invoiceNumber: 'NF005678901',
        customerCPF: '789.123.456-78',
        deliveryCEP: '70040-010',
        productDescription: 'Câmera Canon EOS Rebel T7i Kit 18-55mm'
    },
    {
        invoiceNumber: 'NF006789012',
        customerCPF: '654.321.789-32',
        deliveryCEP: '90010-150',
        productDescription: 'Tablet Apple iPad Air 64GB Wi-Fi Space Gray'
    },
    {
        invoiceNumber: 'NF007890123',
        customerCPF: '147.258.369-14',
        deliveryCEP: '80020-360',
        productDescription: 'Console PlayStation 5 Digital Edition'
    },
    {
        invoiceNumber: 'NF008901234',
        customerCPF: '258.369.147-25',
        deliveryCEP: '40070-110',
        productDescription: 'Máquina de Café Nespresso Vertuo Plus Preta'
    }
];

// Elementos DOM
const invoiceNumberInput = document.getElementById('invoice-number');
const logisticsCompanySelect = document.getElementById('logistics-company');
const deliveryProofInput = document.getElementById('delivery-proof');
const submitBtn = document.getElementById('submit-btn');
const deliveryForm = document.getElementById('delivery-form');
const validationResult = document.getElementById('validation-result');
const invoiceFeedback = document.getElementById('invoice-feedback');
const filePreview = document.getElementById('file-preview');
const previewImage = document.getElementById('preview-image');
const removeFileBtn = document.getElementById('remove-file');
const submissionResult = document.getElementById('submission-result');
const newDeliveryBtn = document.getElementById('new-delivery');

// Elementos de validação
const customerCpfSpan = document.getElementById('customer-cpf');
const deliveryCepSpan = document.getElementById('delivery-cep');
const productDescriptionSpan = document.getElementById('product-description');

// Estado da aplicação
let currentValidatedOrder = null;
let isFormValid = false;

// Utilitários
function formatCpfForDisplay(cpf) {
    // Retorna apenas os 3 primeiros dígitos seguidos de pontos e asteriscos
    return cpf.substring(0, 3) + '.***.***..**';
}

function showFeedback(element, message, type) {
    element.textContent = message;
    element.className = `field-feedback ${type}`;
}

function clearFeedback(element) {
    element.textContent = '';
    element.className = 'field-feedback';
}

function updateSubmitButton() {
    const invoiceValid = currentValidatedOrder !== null;
    const logisticsSelected = logisticsCompanySelect.value !== '';
    const fileSelected = deliveryProofInput.files.length > 0;
    
    isFormValid = invoiceValid && logisticsSelected && fileSelected;
    submitBtn.disabled = !isFormValid;
    
    if (isFormValid) {
        submitBtn.classList.remove('disabled');
    } else {
        submitBtn.classList.add('disabled');
    }
}

// Função de validação da Nota Fiscal
function validateInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber.trim()) {
        return null;
    }
    
    // Busca no banco de dados fictício
    const order = mockDatabase.find(item => 
        item.invoiceNumber.toLowerCase() === invoiceNumber.trim().toLowerCase()
    );
    
    return order || false;
}

// Event Listeners

// Validação da Nota Fiscal no evento blur
invoiceNumberInput.addEventListener('blur', function() {
    const invoiceNumber = this.value.trim();
    
    if (!invoiceNumber) {
        // Campo vazio
        this.className = 'form-input';
        validationResult.classList.add('hidden');
        clearFeedback(invoiceFeedback);
        currentValidatedOrder = null;
        updateSubmitButton();
        return;
    }
    
    const validationResult_local = validateInvoiceNumber(invoiceNumber);
    
    if (validationResult_local === null) {
        // Campo vazio após trim
        this.className = 'form-input';
        validationResult.classList.add('hidden');
        clearFeedback(invoiceFeedback);
        currentValidatedOrder = null;
    } else if (validationResult_local === false) {
        // Nota fiscal não encontrada
        this.className = 'form-input invalid';
        validationResult.classList.add('hidden');
        validationResult.classList.remove('error');
        
        // Criar div de erro temporário
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-result error';
        errorDiv.innerHTML = `
            <div class="validation-header">
                <h3>Nota Fiscal não encontrada</h3>
            </div>
            <div class="validation-content">
                <p style="text-align: center; color: #721c24; font-weight: 500;">
                    Verifique o número da NF e tente novamente.
                </p>
            </div>
        `;
        
        // Inserir após o campo de input
        this.parentNode.appendChild(errorDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
        
        showFeedback(invoiceFeedback, 'Nota Fiscal não encontrada', 'error');
        currentValidatedOrder = null;
    } else {
        // Nota fiscal encontrada
        this.className = 'form-input valid';
        currentValidatedOrder = validationResult_local;
        
        // Exibir informações validadas
        customerCpfSpan.textContent = formatCpfForDisplay(validationResult_local.customerCPF);
        deliveryCepSpan.textContent = validationResult_local.deliveryCEP;
        productDescriptionSpan.textContent = validationResult_local.productDescription;
        
        validationResult.classList.remove('hidden', 'error');
        showFeedback(invoiceFeedback, 'Nota Fiscal validada com sucesso!', 'success');
    }
    
    updateSubmitButton();
});

// Validação em tempo real no input
invoiceNumberInput.addEventListener('input', function() {
    if (this.value.trim() === '') {
        this.className = 'form-input';
        validationResult.classList.add('hidden');
        clearFeedback(invoiceFeedback);
        currentValidatedOrder = null;
        updateSubmitButton();
    }
});

// Seleção da empresa de logística
logisticsCompanySelect.addEventListener('change', function() {
    updateSubmitButton();
});

// Upload de arquivo (foto)
deliveryProofInput.addEventListener('change', function() {
    const file = this.files[0];
    
    if (file) {
        // Verificar se é uma imagem
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            this.value = '';
            filePreview.classList.add('hidden');
            updateSubmitButton();
            return;
        }
        
        // Verificar tamanho (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 10MB.');
            this.value = '';
            filePreview.classList.add('hidden');
            updateSubmitButton();
            return;
        }
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            filePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        filePreview.classList.add('hidden');
    }
    
    updateSubmitButton();
});

// Remover arquivo
removeFileBtn.addEventListener('click', function() {
    deliveryProofInput.value = '';
    filePreview.classList.add('hidden');
    updateSubmitButton();
});

// Submit do formulário
deliveryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isFormValid) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Simular envio
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simular delay de envio
    setTimeout(() => {
        // Ocultar formulário
        deliveryForm.classList.add('hidden');
        validationResult.classList.add('hidden');
        
        // Mostrar resultado de sucesso
        submissionResult.classList.remove('hidden');
        
        // Scroll para o resultado
        submissionResult.scrollIntoView({ behavior: 'smooth' });
        
        // Resetar botão
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 2000);
});

// Nova entrega
newDeliveryBtn.addEventListener('click', function() {
    // Reset do formulário
    deliveryForm.reset();
    
    // Reset do estado
    currentValidatedOrder = null;
    isFormValid = false;
    
    // Reset das classes
    invoiceNumberInput.className = 'form-input';
    
    // Ocultar elementos
    validationResult.classList.add('hidden');
    filePreview.classList.add('hidden');
    submissionResult.classList.add('hidden');
    
    // Mostrar formulário
    deliveryForm.classList.remove('hidden');
    
    // Limpar feedbacks
    clearFeedback(invoiceFeedback);
    
    // Atualizar botão
    updateSubmitButton();
    
    // Focar no primeiro campo
    invoiceNumberInput.focus();
    
    // Scroll para o topo
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    updateSubmitButton();
    
    // Auto-focus no primeiro campo
    invoiceNumberInput.focus();
    
    // Log do banco de dados para testes (apenas em desenvolvimento)
    console.log('Banco de Dados de Teste:');
    console.table(mockDatabase);
    console.log('Teste com uma das notas fiscais acima!');
});

// Prevenção de zoom em iOS quando focando inputs
document.addEventListener('touchstart', function() {
    if (window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        }
    }
});

// Service Worker para PWA (opcional - para funcionamento offline)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Registro do service worker seria implementado aqui para PWA
        console.log('Aplicação carregada com sucesso!');
    });
}