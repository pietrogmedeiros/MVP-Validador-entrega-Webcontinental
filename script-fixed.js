// Import Supabase
import { searchNF, saveDelivery, uploadProof } from './supabase.js'

// API Configuration - Always use HTTPS
const API_CONFIG = {
    baseURL: 'https://mw8t3gzzo9.execute-api.us-east-2.amazonaws.com/prod',
    endpoints: {
        validate: '/validate',
        delivery: '/delivery',
        health: '/health'
    }
};

// DOM Elements - exact match with HTML
let invoiceNumberInput, deliveryTypeSelect, logisticsCompanySelect, deliveryProofInput;
let clientNameInput, clientCpfInput, clientFields, logisticsFields;
let submitBtn, deliveryForm, validationResult, invoiceFeedback;
let filePreview, previewImage, removeFileBtn, submissionResult, newDeliveryBtn;
let customerCpfSpan, deliveryCepSpan, productDescriptionSpan;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Get DOM elements
    invoiceNumberInput = document.getElementById('invoice-number');
    deliveryTypeSelect = document.getElementById('delivery-type');
    logisticsCompanySelect = document.getElementById('logistics-company');
    deliveryProofInput = document.getElementById('delivery-proof');
    clientNameInput = document.getElementById('client-name');
    clientCpfInput = document.getElementById('client-cpf');
    clientFields = document.getElementById('client-fields');
    logisticsFields = document.getElementById('logistics-fields');
    submitBtn = document.getElementById('submit-btn');
    deliveryForm = document.getElementById('delivery-form');
    validationResult = document.getElementById('validation-result');
    invoiceFeedback = document.getElementById('invoice-feedback');
    filePreview = document.getElementById('file-preview');
    previewImage = document.getElementById('preview-image');
    removeFileBtn = document.getElementById('remove-file');
    submissionResult = document.getElementById('submission-result');
    newDeliveryBtn = document.getElementById('new-delivery');
    customerCpfSpan = document.getElementById('customer-cpf');
    deliveryCepSpan = document.getElementById('delivery-cep');
    productDescriptionSpan = document.getElementById('product-description');

    // Check if all elements exist
    console.log('Checking elements...');
    console.log('deliveryTypeSelect:', deliveryTypeSelect);
    console.log('clientFields:', clientFields);
    console.log('logisticsFields:', logisticsFields);
    
    if (!invoiceNumberInput) {
        console.error('invoice-number element not found');
        return;
    }
    
    if (!deliveryTypeSelect) {
        console.error('delivery-type element not found - this is critical!');
        return;
    }
    
    console.log('All DOM elements found, setting up event listeners...');
    
    // Initialize form state - remove required from conditional fields initially
    initializeFormState();
    setupEventListeners();
    
    // Initialize barcode scanner
    initBarcodeScanner();
});

// Initialize form state
function initializeFormState() {
    console.log('🔧 Initializing form state...');
    
    // Remove required attributes from conditional fields initially
    if (clientNameInput) clientNameInput.removeAttribute('required');
    if (clientCpfInput) clientCpfInput.removeAttribute('required');
    if (logisticsCompanySelect) logisticsCompanySelect.removeAttribute('required');
    
    // Ensure conditional fields are hidden
    if (clientFields) clientFields.classList.add('hidden');
    if (logisticsFields) logisticsFields.classList.add('hidden');
    
    console.log('✅ Form state initialized');
}

function setupEventListeners() {
    // Invoice number validation
    invoiceNumberInput.addEventListener('blur', validateInvoiceNumber);
    invoiceNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validateInvoiceNumber();
        }
    });
    
    // Delivery type selection
    deliveryTypeSelect.addEventListener('change', function() {
        handleDeliveryTypeChange();
        updateSubmitButton();
    });
    
    // CPF formatting for client
    if (clientCpfInput) {
        clientCpfInput.addEventListener('input', formatCPF);
        clientCpfInput.addEventListener('input', updateSubmitButton);
    }
    
    // Client name input
    if (clientNameInput) {
        clientNameInput.addEventListener('input', updateSubmitButton);
    }
    
    // Logistics company selection
    if (logisticsCompanySelect) {
        logisticsCompanySelect.addEventListener('change', updateSubmitButton);
    }
    
    // File handling
    deliveryProofInput.addEventListener('change', handleFileSelection);
    
    // Form submission
    deliveryForm.addEventListener('submit', handleFormSubmission);
    
    // Remove file button
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', removeSelectedFile);
    }
    
    // New delivery button
    if (newDeliveryBtn) {
        newDeliveryBtn.addEventListener('click', resetForm);
    }
    
    console.log('Event listeners set up successfully');
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle delivery type change
function handleDeliveryTypeChange() {
    console.log('🔄 handleDeliveryTypeChange called!');
    const deliveryType = deliveryTypeSelect.value;
    console.log('Selected delivery type:', deliveryType);
    
    // First, reset all conditional fields
    resetConditionalFields();
    
    // Show appropriate fields with animation
    setTimeout(() => {
        if (deliveryType === 'cliente') {
            console.log('📋 Showing CLIENT fields');
            showClientFields();
        } else if (deliveryType === 'transportadora') {
            console.log('🚚 Showing LOGISTICS fields');
            showLogisticsFields();
        }
        updateSubmitButton();
    }, 50);
}

// Reset all conditional fields
function resetConditionalFields() {
    console.log('🔄 Resetting conditional fields...');
    
    // Hide all conditional fields
    if (clientFields) {
        clientFields.classList.add('hidden');
        clientFields.classList.remove('show');
    }
    if (logisticsFields) {
        logisticsFields.classList.add('hidden');
        logisticsFields.classList.remove('show');
    }
    
    // Remove all required attributes
    if (clientNameInput) clientNameInput.removeAttribute('required');
    if (clientCpfInput) clientCpfInput.removeAttribute('required');
    if (logisticsCompanySelect) logisticsCompanySelect.removeAttribute('required');
    
    // Clear validation from hidden fields
    clearFieldValidation(clientNameInput);
    clearFieldValidation(clientCpfInput);
    clearFieldValidation(logisticsCompanySelect);
}

// Show client fields
function showClientFields() {
    if (clientFields) {
        clientFields.classList.remove('hidden');
        clientFields.classList.add('show');
        
        // Set required attributes only for client fields
        if (clientNameInput) clientNameInput.setAttribute('required', 'required');
        if (clientCpfInput) clientCpfInput.setAttribute('required', 'required');
        
        console.log('✅ Client fields shown and required attributes set');
    }
}

// Show logistics fields
function showLogisticsFields() {
    if (logisticsFields) {
        logisticsFields.classList.remove('hidden');
        logisticsFields.classList.add('show');
        
        // Set required attribute only for logistics field
        if (logisticsCompanySelect) logisticsCompanySelect.setAttribute('required', 'required');
        
        console.log('✅ Logistics fields shown and required attributes set');
    }
}

// Format CPF input
function formatCPF(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    event.target.value = value;
}

// Clear field validation
function clearFieldValidation(element) {
    if (element && element.classList) {
        element.classList.remove('error', 'success');
    }
}

// Validate invoice number
async function validateInvoiceNumber() {
    const invoiceNumber = invoiceNumberInput.value.trim();
    
    if (!invoiceNumber) {
        hideValidationResult();
        clearInvoiceFeedback();
        updateSubmitButton();
        return;
    }

    try {
        // Mostrar popup de loading
        showLoadingPopup();
        
        // Buscar NF no Supabase
        const nfData = await searchNF(invoiceNumber);
        
        if (nfData) {
            // NF encontrada no Supabase
            clearInvoiceFeedback();
            
            // Salvar dados para uso posterior
            currentValidatedOrder = {
                invoiceNumber: invoiceNumber.toUpperCase(),
                ...nfData
            };
            
            // Mostrar resultado
            invoiceNumberInput.className = 'form-input valid';
            validationResult.classList.remove('hidden', 'error');
            showFeedback(invoiceFeedback, 'Nota Fiscal validada com sucesso!', 'success');
            showMessage('Nota fiscal encontrada!', 'success');
            console.log('✅ Nota fiscal validada no Supabase');
        } else {
            // NF não encontrada
            hideValidationResult();
            clearInvoiceFeedback();
            invoiceNumberInput.className = 'form-input invalid';
            showFeedback(invoiceFeedback, 'Nota Fiscal não encontrada', 'error');
            showMessage('Nota fiscal não encontrada.', 'error');
            console.log('❌ Nota fiscal não encontrada no Supabase');
            currentValidatedOrder = null;
        }
    } catch (error) {
        console.error('Validation error:', error);
        hideValidationResult();
        clearInvoiceFeedback();
        invoiceNumberInput.className = 'form-input invalid';
        showMessage('Erro ao validar nota fiscal.', 'error');
        currentValidatedOrder = null;
    } finally {
        // Esconder popup de loading sempre (após sucesso ou erro)
        setTimeout(() => {
            hideLoadingPopup();
        }, 500); // Pequeno delay para melhor UX
    }
    
    updateSubmitButton();
}

// Função para mostrar o popup de loading
function showLoadingPopup() {
    const popup = document.getElementById('loading-popup');
    if (popup) {
        popup.classList.remove('hidden');
        console.log('📱 Showing loading popup...');
    }
}

// Função para esconder o popup de loading
function hideLoadingPopup() {
    const popup = document.getElementById('loading-popup');
    if (popup) {
        popup.classList.add('hidden');
        console.log('📱 Hiding loading popup...');
    }
}

// Clear invoice feedback
function clearInvoiceFeedback() {
    if (invoiceFeedback) {
        invoiceFeedback.innerHTML = '';
        invoiceFeedback.style.display = 'none';
    }
}

function showValidationSuccess(data) {
    if (customerCpfSpan) customerCpfSpan.textContent = data.customerCPF || 'N/A';
    if (deliveryCepSpan) deliveryCepSpan.textContent = data.deliveryCEP || 'N/A';
    if (productDescriptionSpan) productDescriptionSpan.textContent = data.productDescription || 'N/A';
    
    // Verificar se a entrega foi cancelada
    if (data.deliveryStatus === 'Cancelado') {
        showCancelledDeliveryPopup(data.invoiceNumber);
        return; // Não mostra o resultado da validação se foi cancelado
    }
    
    if (validationResult) {
        validationResult.classList.remove('hidden');
    }
}

// Função para mostrar popup de entrega cancelada
function showCancelledDeliveryPopup(invoiceNumber) {
    console.log('🚫 Entrega cancelada detectada para NF:', invoiceNumber);
    
    // Criar popup se não existir
    let popup = document.getElementById('cancelled-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'cancelled-popup';
        popup.className = 'cancelled-popup';
        popup.innerHTML = `
            <div class="cancelled-content">
                <div class="cancelled-icon">⚠️</div>
                <h2>Entrega Cancelada</h2>
                <p>A entrega da nota fiscal <strong>${invoiceNumber}</strong> foi <strong>CANCELADA</strong>.</p>
                <p>Por favor, não realize a entrega.</p>
                <button onclick="closeCancelledPopup()" class="cancelled-close-btn">Fechar</button>
            </div>
        `;
        document.body.appendChild(popup);
    } else {
        // Atualizar conteúdo se já existir
        popup.querySelector('strong').textContent = invoiceNumber;
    }
    
    popup.classList.remove('hidden');
    popup.style.display = 'flex';
}

// Função para fechar popup de cancelamento
function closeCancelledPopup() {
    const popup = document.getElementById('cancelled-popup');
    if (popup) {
        popup.classList.add('hidden');
        popup.style.display = 'none';
    }
    
    // Limpar o campo de nota fiscal para nova tentativa
    if (invoiceNumberInput) {
        invoiceNumberInput.value = '';
        invoiceNumberInput.focus();
    }
    hideValidationResult();
    updateSubmitButton();
}

function hideValidationResult() {
    if (validationResult) {
        validationResult.classList.add('hidden');
    }
    clearMessage();
}

// File handling
function handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (!file) {
        hideFilePreview();
        updateSubmitButton();
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
        event.target.value = '';
        updateSubmitButton();
        return;
    }
    
    // Removed size validation for testing
    
    showFilePreview(file);
    updateSubmitButton();
}

function showFilePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        if (previewImage) {
            previewImage.src = e.target.result;
        }
        if (filePreview) {
            filePreview.classList.remove('hidden');
        }
        updateSubmitButton();
    };
    reader.readAsDataURL(file);
}

function hideFilePreview() {
    if (filePreview) {
        filePreview.classList.add('hidden');
    }
    updateSubmitButton();
}

function removeSelectedFile() {
    if (deliveryProofInput) {
        deliveryProofInput.value = '';
    }
    hideFilePreview();
}

// Form submission
async function handleFormSubmission(event) {
    event.preventDefault();
    
    const invoiceNumber = invoiceNumberInput?.value.trim();
    const deliveryType = deliveryTypeSelect?.value;
    const deliveryProofFile = deliveryProofInput?.files[0];
    
    // Validate basic required fields
    if (!invoiceNumber || !deliveryType || !deliveryProofFile) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    let logisticsCompany = '';
    let clientName = '';
    let clientCpf = '';
    
    // Validate conditional fields based on delivery type
    if (deliveryType === 'transportadora') {
        logisticsCompany = logisticsCompanySelect?.value;
        if (!logisticsCompany) {
            showMessage('Por favor, selecione a empresa de logística.', 'error');
            return;
        }
    } else if (deliveryType === 'cliente') {
        clientName = clientNameInput?.value.trim();
        clientCpf = clientCpfInput?.value.trim();
        
        if (!clientName || !clientCpf) {
            showMessage('Por favor, preencha o nome e CPF do cliente.', 'error');
            return;
        }
        
        // Validate CPF format (basic validation)
        if (clientCpf.replace(/\D/g, '').length !== 11) {
            showMessage('Por favor, digite um CPF válido.', 'error');
            return;
        }
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        // Upload comprovante para Supabase Storage
        console.log('📸 Fazendo upload do comprovante...');
        const proofUrl = await uploadProof(invoiceNumber, deliveryProofFile);
        
        // Salvar entrega no Supabase
        const deliveryRecord = await saveDelivery({
            invoiceNumber,
            deliveryType,
            logisticsCompany: deliveryType === 'transportadora' ? logisticsCompany : null,
            clientName: deliveryType === 'cliente' ? clientName : null,
            clientCpf: deliveryType === 'cliente' ? clientCpf : null,
            proofUrl
        });
        
        console.log('✅ Entrega salva no Supabase:', deliveryRecord);
        showSuccessResult();
        showMessage('Entrega registrada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Submit error:', error);
        showMessage(error.message || 'Erro ao registrar entrega. Tente novamente.', 'error');
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrar Entrega';
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function showSuccessResult() {
    if (deliveryForm) deliveryForm.style.display = 'none';
    if (submissionResult) submissionResult.classList.remove('hidden');
}

function resetForm() {
    if (deliveryForm) {
        deliveryForm.reset();
        deliveryForm.style.display = 'block';
    }
    
    // Hide all conditional fields
    if (clientFields) {
        clientFields.classList.add('hidden');
        clientFields.classList.remove('show');
    }
    if (logisticsFields) {
        logisticsFields.classList.add('hidden');
        logisticsFields.classList.remove('show');
    }
    
    // Clear required attributes
    if (clientNameInput) clientNameInput.removeAttribute('required');
    if (clientCpfInput) clientCpfInput.removeAttribute('required');
    if (logisticsCompanySelect) logisticsCompanySelect.removeAttribute('required');
    
    if (submissionResult) submissionResult.classList.add('hidden');
    hideValidationResult();
    hideFilePreview();
    updateSubmitButton();
}

// Update submit button state
function updateSubmitButton() {
    if (!submitBtn) return;
    
    console.log('🔄 Updating submit button...');
    
    const invoiceNumber = invoiceNumberInput?.value.trim();
    const deliveryType = deliveryTypeSelect?.value;
    const deliveryProofFile = deliveryProofInput?.files[0];
    const hasValidInvoice = !validationResult?.classList.contains('hidden');
    
    console.log('📋 Form state check:');
    console.log('  - Invoice number:', invoiceNumber);
    console.log('  - Delivery type:', deliveryType);
    console.log('  - Has file:', !!deliveryProofFile);
    console.log('  - Has valid invoice:', hasValidInvoice);
    
    let typeFieldsValid = false;
    if (deliveryType === 'transportadora') {
        const logistics = logisticsCompanySelect?.value;
        typeFieldsValid = !!logistics;
        console.log('  - Logistics company:', logistics, '| Valid:', typeFieldsValid);
    } else if (deliveryType === 'cliente') {
        const clientName = clientNameInput?.value.trim();
        const clientCpf = clientCpfInput?.value.trim();
        const cpfValid = clientCpf && clientCpf.replace(/\D/g, '').length === 11;
        typeFieldsValid = clientName && cpfValid;
        console.log('  - Client name:', clientName);
        console.log('  - Client CPF:', clientCpf, '| Valid:', cpfValid);
        console.log('  - Type fields valid:', typeFieldsValid);
    }
    
    const isValid = invoiceNumber && deliveryType && typeFieldsValid && deliveryProofFile && hasValidInvoice;
    
    console.log('🎯 Final validation:', isValid);
    
    submitBtn.disabled = !isValid;
    
    if (isValid) {
        console.log('✅ Submit button ENABLED');
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    } else {
        console.log('❌ Submit button DISABLED');
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
    }
}

// Utility functions
function showMessage(message, type) {
    // Create or update message element
    let messageElement = document.getElementById('message-display');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message-display';
        document.querySelector('.container').insertBefore(messageElement, document.querySelector('main'));
    }
    
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

function clearMessage() {
    const messageElement = document.getElementById('message-display');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

function showLoading(element, text) {
    if (element) {
        element.innerHTML = `<span class="loading">${text}</span>`;
        element.style.display = 'block';
    }
}

// Barcode Scanner Functionality
function initBarcodeScanner() {
    const scanButton = document.getElementById('scan-button');
    const scannerModal = document.getElementById('scanner-modal');
    const closeScanner = document.getElementById('close-scanner');
    const invoiceInput = document.getElementById('invoice-number');

    if (!scanButton || !scannerModal) {
        console.log('Scanner elements not found');
        return;
    }

    scanButton.addEventListener('click', function() {
        scannerModal.classList.add('active');
        startScanner();
    });

    closeScanner.addEventListener('click', function() {
        stopScanner();
        scannerModal.classList.remove('active');
    });

    function startScanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scanner-viewport'),
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_39_vin_reader",
                    "codabar_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "i2of5_reader"
                ]
            },
        }, function(err) {
            if (err) {
                console.error(err);
                alert('Erro ao iniciar câmera. Verifique as permissões.');
                scannerModal.classList.remove('active');
                return;
            }
            console.log("Scanner initialized");
            Quagga.start();
        });

        Quagga.onDetected(function(result) {
            const code = result.codeResult.code;
            console.log("Barcode detected:", code);
            
            // Extract only numbers from the barcode
            let numbers = code.replace(/\D/g, '');
            
            // Get the last 9 digits (formato NF: NF + 9 dígitos)
            if (numbers.length >= 9) {
                numbers = numbers.slice(-9);
            }
            
            if (numbers.length >= 8) {
                // Add "NF" prefix to the numbers
                invoiceInput.value = 'NF' + numbers;
                stopScanner();
                scannerModal.classList.remove('active');
                
                // Trigger validation
                invoiceInput.dispatchEvent(new Event('blur'));
            }
        });
    }

    function stopScanner() {
        Quagga.stop();
    }
}

console.log('Script loaded successfully');