// API Configuration
const API_CONFIG = {
    // Production API Gateway URL
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' // Local development
        : 'https://mw8t3gzzo9.execute-api.us-east-2.amazonaws.com/prod', // Production API
    endpoints: {
        validate: '/validate',
        delivery: '/delivery',
        health: '/health'
    }
};

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

// API Functions
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Validate invoice number with API
async function validateInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber.trim()) {
        return null;
    }
    
    try {
        showLoadingState(invoiceNumberInput, true);
        const data = await makeApiRequest(`${API_CONFIG.endpoints.validate}/${invoiceNumber.trim()}`);
        return data;
    } catch (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            return false; // Invoice not found
        }
        throw error; // Re-throw other errors
    } finally {
        showLoadingState(invoiceNumberInput, false);
    }
}

// Submit delivery data to API
async function submitDelivery(deliveryData) {
    return await makeApiRequest(API_CONFIG.endpoints.delivery, {
        method: 'POST',
        body: JSON.stringify(deliveryData)
    });
}

// Show loading state for inputs
function showLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Convert file to base64 (for API submission)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Validate image quality using Canvas analysis
function validateImageQuality(imageElement) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = imageElement.naturalWidth || imageElement.width;
            canvas.height = imageElement.naturalHeight || imageElement.height;
            
            // Draw image to canvas
            ctx.drawImage(imageElement, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Calculate image metrics
            let totalBrightness = 0;
            let totalVariance = 0;
            let brightnessList = [];
            
            // Analyze each pixel (skip alpha channel, process every 4th pixel for performance)
            for (let i = 0; i < pixels.length; i += 16) { // Skip every 4 pixels
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                // Calculate brightness (luminance)
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                brightnessList.push(brightness);
                totalBrightness += brightness;
            }
            
            const avgBrightness = totalBrightness / brightnessList.length;
            
            // Calculate variance (measure of contrast/blur)
            for (let brightness of brightnessList) {
                totalVariance += Math.pow(brightness - avgBrightness, 2);
            }
            
            const variance = totalVariance / brightnessList.length;
            const standardDeviation = Math.sqrt(variance);
            
            // Quality thresholds
            const qualityMetrics = {
                brightness: avgBrightness,
                contrast: standardDeviation,
                resolution: canvas.width * canvas.height
            };
            
            // Validation rules
            const validation = {
                isValid: true,
                errors: [],
                metrics: qualityMetrics
            };
            
            // Check if image is too dark
            if (avgBrightness < 30) {
                validation.isValid = false;
                validation.errors.push('Imagem muito escura. Tire a foto em local com mais iluminação.');
            }
            
            // Check if image is too bright (overexposed)
            if (avgBrightness > 240) {
                validation.isValid = false;
                validation.errors.push('Imagem muito clara/superexposta. Evite flash direto ou luz muito forte.');
            }
            
            // Check if image has low contrast (possibly blurry)
            if (standardDeviation < 20) {
                validation.isValid = false;
                validation.errors.push('Imagem desfocada ou com baixo contraste. Tire uma foto mais nítida.');
            }
            
            // Check minimum resolution
            if (qualityMetrics.resolution < 200000) { // Less than ~500x400
                validation.isValid = false;
                validation.errors.push('Resolução muito baixa. Use uma câmera de melhor qualidade.');
            }
            
            console.log('Image quality metrics:', qualityMetrics);
            console.log('Validation result:', validation);
            
            resolve(validation);
            
        } catch (error) {
            console.error('Error validating image quality:', error);
            reject(new Error('Erro ao analisar qualidade da imagem'));
        }
    });
}

// Show image quality feedback to user
function showImageQualityFeedback(validation, container) {
    // Remove existing feedback
    const existingFeedback = container.querySelector('.image-quality-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `image-quality-feedback ${validation.isValid ? 'valid' : 'invalid'}`;
    
    if (validation.isValid) {
        feedbackDiv.innerHTML = `
            <div class="quality-success">
                <span class="quality-icon">✓</span>
                <span class="quality-message">Imagem com boa qualidade!</span>
            </div>
        `;
    } else {
        const errorsList = validation.errors.map(error => `<li>${error}</li>`).join('');
        feedbackDiv.innerHTML = `
            <div class="quality-error">
                <span class="quality-icon">⚠</span>
                <div class="quality-message">
                    <strong>Problemas detectados na imagem:</strong>
                    <ul>${errorsList}</ul>
                    <p>Por favor, tire uma nova foto.</p>
                </div>
            </div>
        `;
    }
    
    container.appendChild(feedbackDiv);
    
    return validation.isValid;
}

// Event Listeners

// Validação da Nota Fiscal no evento blur
invoiceNumberInput.addEventListener('blur', async function() {
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
    
    try {
        const validationResult_local = await validateInvoiceNumber(invoiceNumber);
        
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
            customerCpfSpan.textContent = validationResult_local.customerCPF;
            deliveryCepSpan.textContent = validationResult_local.deliveryCEP;
            productDescriptionSpan.textContent = validationResult_local.productDescription;
            
            validationResult.classList.remove('hidden', 'error');
            showFeedback(invoiceFeedback, 'Nota Fiscal validada com sucesso!', 'success');
        }
    } catch (error) {
        console.error('Validation error:', error);
        this.className = 'form-input invalid';
        validationResult.classList.add('hidden');
        showFeedback(invoiceFeedback, 'Erro ao validar nota fiscal. Tente novamente.', 'error');
        currentValidatedOrder = null;
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

        // Handle form submission
    document.getElementById('deliveryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const numeroNf = document.getElementById('numeroNf').value.trim();
        const motorista = document.getElementById('motorista').value.trim();
        const dataEntrega = document.getElementById('dataEntrega').value;
        const horaEntrega = document.getElementById('horaEntrega').value;
        const observacoes = document.getElementById('observacoes').value.trim();
        const comprovanteFile = document.getElementById('comprovante').files[0];
        
        // Validate required fields
        if (!numeroNf || !motorista || !dataEntrega || !horaEntrega) {
            showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Validate delivery proof
        if (!comprovanteFile) {
            showMessage('Por favor, anexe o comprovante de entrega.', 'error');
            return;
        }
        
        // Re-validate image quality before submission
        try {
            const img = new Image();
            const fileReader = new FileReader();
            
            await new Promise((resolve, reject) => {
                fileReader.onload = async function(e) {
                    img.onload = async function() {
                        try {
                            const qualityValidation = await validateImageQuality(img);
                            if (!qualityValidation.isValid) {
                                showMessage('A imagem do comprovante não atende aos critérios de qualidade. Por favor, tire uma nova foto.', 'error');
                                reject(new Error('Image quality validation failed'));
                                return;
                            }
                            resolve();
                        } catch (error) {
                            console.warn('Could not validate image quality, proceeding anyway:', error);
                            resolve(); // Proceed if validation fails
                        }
                    };
                    img.src = e.target.result;
                };
                fileReader.readAsDataURL(comprovanteFile);
            });
        } catch (error) {
            console.error('Image quality validation error:', error);
            return; // Stop submission if quality validation fails
        }
        
        // Show loading state
        const submitButton = document.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        try {
            // Convert image to base64
            const comprovanteBase64 = await fileToBase64(comprovanteFile);
            
            // Prepare delivery data
            const deliveryData = {
                numeroNf,
                motorista,
                dataEntrega,
                horaEntrega,
                observacoes,
                comprovante: {
                    filename: comprovanteFile.name,
                    data: comprovanteBase64,
                    type: comprovanteFile.type,
                    size: comprovanteFile.size
                }
            };
            
            // Submit to API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deliveryData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showMessage('Entrega validada e registrada com sucesso!', 'success');
                
                // Show success details
                if (result.delivery) {
                    const successDetails = document.getElementById('successDetails');
                    successDetails.innerHTML = `
                        <h3>Detalhes da Entrega Registrada:</h3>
                        <p><strong>NF:</strong> ${result.delivery.numeroNf}</p>
                        <p><strong>Cliente:</strong> ${result.delivery.cliente}</p>
                        <p><strong>Produto:</strong> ${result.delivery.produto}</p>
                        <p><strong>Motorista:</strong> ${result.delivery.motorista}</p>
                        <p><strong>Data/Hora:</strong> ${result.delivery.dataEntrega} às ${result.delivery.horaEntrega}</p>
                        <p><strong>Status:</strong> Entregue ✓</p>
                        <p><strong>Comprovante:</strong> Anexado com sucesso</p>
                        ${result.delivery.observacoes ? `<p><strong>Observações:</strong> ${result.delivery.observacoes}</p>` : ''}
                    `;
                    successDetails.style.display = 'block';
                }
                
                // Reset form
                document.getElementById('deliveryForm').reset();
                document.getElementById('imagePreview').style.display = 'none';
                
            } else {
                throw new Error(result.error || 'Erro ao registrar entrega');
            }
            
        } catch (error) {
            console.error('Submit error:', error);
            showMessage(error.message || 'Erro ao enviar os dados. Tente novamente.', 'error');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });// Remover arquivo
removeFileBtn.addEventListener('click', function() {
    deliveryProofInput.value = '';
    filePreview.classList.add('hidden');
    updateSubmitButton();
});

// Submit do formulário
deliveryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!isFormValid) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    try {
        // Mostrar estado de carregamento
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Preparar dados para envio
        const file = deliveryProofInput.files[0];
        let deliveryProofData = null;
        
        if (file) {
            deliveryProofData = await fileToBase64(file);
        }
        
        const deliveryData = {
            invoiceNumber: currentValidatedOrder.invoiceNumber,
            logisticsCompany: logisticsCompanySelect.value,
            deliveryProof: deliveryProofData
        };
        
        // Enviar para API
        const result = await submitDelivery(deliveryData);
        
        // Sucesso - ocultar formulário e mostrar resultado
        deliveryForm.classList.add('hidden');
        validationResult.classList.add('hidden');
        submissionResult.classList.remove('hidden');
        
        // Scroll para o resultado
        submissionResult.scrollIntoView({ behavior: 'smooth' });
        
        console.log('Delivery registered successfully:', result);
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('Erro ao registrar entrega. Tente novamente.');
    } finally {
        // Resetar botão
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
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
document.addEventListener('DOMContentLoaded', async function() {
    updateSubmitButton();
    
    // Auto-focus no primeiro campo
    invoiceNumberInput.focus();
    
    // Test API connection
    try {
        await makeApiRequest(API_CONFIG.endpoints.health);
        console.log('API connection successful');
    } catch (error) {
        console.warn('API connection failed, falling back to development mode:', error);
        // In development, you could fall back to mock data here
    }
    
    console.log('Aplicação carregada com sucesso!');
    console.log('Teste com notas fiscais: NF001234567, NF002345678, NF003456789, etc.');
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