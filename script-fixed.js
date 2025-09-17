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
let invoiceNumberInput, logisticsCompanySelect, deliveryProofInput;
let submitBtn, deliveryForm, validationResult, invoiceFeedback;
let filePreview, previewImage, removeFileBtn, submissionResult, newDeliveryBtn;
let customerCpfSpan, deliveryCepSpan, productDescriptionSpan;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // Get DOM elements
    invoiceNumberInput = document.getElementById('invoice-number');
    logisticsCompanySelect = document.getElementById('logistics-company');
    deliveryProofInput = document.getElementById('delivery-proof');
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
    if (!invoiceNumberInput) {
        console.error('invoice-number element not found');
        return;
    }
    
    console.log('All DOM elements found, setting up event listeners...');
    setupEventListeners();
});

function setupEventListeners() {
    // Invoice number validation
    invoiceNumberInput.addEventListener('input', debounce(validateInvoiceNumber, 500));
    
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

// Validate invoice number
async function validateInvoiceNumber() {
    const invoiceNumber = invoiceNumberInput.value.trim();
    
    if (!invoiceNumber) {
        hideValidationResult();
        updateSubmitButton();
        return;
    }

    try {
        showLoading(invoiceFeedback, 'Validando nota fiscal...');
        
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.validate}/${invoiceNumber}`);
        const data = await response.json();
        
        if (response.ok && data.status === 'validated') {
            showValidationSuccess(data);
            showMessage('Nota fiscal encontrada!', 'success');
        } else {
            hideValidationResult();
            showMessage('Nota fiscal não encontrada.', 'error');
        }
    } catch (error) {
        console.error('Validation error:', error);
        hideValidationResult();
        showMessage('Erro ao validar nota fiscal.', 'error');
    }
    
    updateSubmitButton();
}

function showValidationSuccess(data) {
    if (customerCpfSpan) customerCpfSpan.textContent = data.customerCPF || 'N/A';
    if (deliveryCepSpan) deliveryCepSpan.textContent = data.deliveryCEP || 'N/A';
    if (productDescriptionSpan) productDescriptionSpan.textContent = data.productDescription || 'N/A';
    
    if (validationResult) {
        validationResult.classList.remove('hidden');
    }
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
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
        event.target.value = '';
        return;
    }
    
    // Removed size validation for testing
    
    showFilePreview(file);
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
    const logisticsCompany = logisticsCompanySelect?.value;
    const deliveryProofFile = deliveryProofInput?.files[0];
    
    // Validate required fields
    if (!invoiceNumber || !logisticsCompany || !deliveryProofFile) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        // Convert image to base64
        const deliveryProofBase64 = await fileToBase64(deliveryProofFile);
        
        // Prepare delivery data
        const deliveryData = {
            invoiceNumber,
            logisticsCompany,
            deliveryProof: {
                filename: deliveryProofFile.name,
                data: deliveryProofBase64,
                type: deliveryProofFile.type,
                size: deliveryProofFile.size
            }
        };
        
        // Submit to API
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.delivery}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deliveryData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessResult();
            showMessage('Entrega registrada com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro ao registrar entrega');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        showMessage(error.message || 'Erro ao enviar os dados. Tente novamente.', 'error');
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
    if (submissionResult) submissionResult.classList.add('hidden');
    hideValidationResult();
    hideFilePreview();
    updateSubmitButton();
}

// Update submit button state
function updateSubmitButton() {
    if (!submitBtn) return;
    
    const invoiceNumber = invoiceNumberInput?.value.trim();
    const logisticsCompany = logisticsCompanySelect?.value;
    const deliveryProofFile = deliveryProofInput?.files[0];
    const hasValidInvoice = !validationResult?.classList.contains('hidden');
    
    const isValid = invoiceNumber && logisticsCompany && deliveryProofFile && hasValidInvoice;
    
    submitBtn.disabled = !isValid;
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

console.log('Script loaded successfully');