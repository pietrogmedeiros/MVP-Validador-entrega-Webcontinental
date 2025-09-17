# Critérios de Validação de Imagem - Validador de Entrega

## Resumo dos Critérios Atuais

O sistema de validação de imagem possui os seguintes critérios **BÁSICOS** implementados:

### 1. **Formato de Arquivo**
- ✅ Deve ser um arquivo de imagem válido
- ✅ Formatos aceitos: JPG, JPEG, PNG, GIF, WebP, etc.
- ❌ Não aceita: PDF, DOC, TXT, vídeos, etc.

### 2. **Tamanho do Arquivo**
- ✅ **Mínimo**: 1KB (1.024 bytes)
- ✅ **Máximo**: 10MB (10.485.760 bytes)
- ❌ Imagens menores que 1KB são rejeitadas (podem estar corrompidas)
- ❌ Imagens maiores que 10MB são rejeitadas

### 3. **Formato Base64**
- ✅ Deve ser convertível para Base64 válido
- ✅ Deve conter o cabeçalho `data:image/` correto
- ❌ Dados corrompidos ou inválidos são rejeitados

## ⚠️ LIMITAÇÕES ATUAIS

O sistema atual **NÃO** possui validação avançada de qualidade:

### O que NÃO é verificado:
- ❌ **Nitidez da imagem** (se está tremida/borrada)
- ❌ **Clareza do texto** (se é legível)
- ❌ **Luminosidade** (se está muito escura/clara)
- ❌ **Enquadramento** (se o documento está bem posicionado)
- ❌ **Resolução mínima** (pixels específicos)
- ❌ **Conteúdo da imagem** (se realmente é um comprovante)

## 🛠️ Possíveis Melhorias

Para implementar validação mais rigorosa, seria necessário adicionar:

### 1. **Análise de Nitidez**
```javascript
// Detectar blur/tremor usando análise de gradiente
function isImageBlurry(imageData) {
    // Implementar algoritmo de detecção de blur
    // Ex: Variance of Laplacian, FFT analysis
}
```

### 2. **Verificação de Luminosidade**
```javascript
// Verificar se a imagem não está muito escura/clara
function hasGoodLighting(imageData) {
    // Analisar histograma de cores
    // Verificar contraste adequado
}
```

### 3. **Resolução Mínima**
```javascript
// Garantir resolução mínima para legibilidade
if (width < 800 || height < 600) {
    throw new Error('Resolução muito baixa - mínimo 800x600');
}
```

### 4. **OCR Básico**
```javascript
// Verificar se há texto legível na imagem
function containsReadableText(imageData) {
    // Usar biblioteca como Tesseract.js
    // Verificar % de confiança do OCR
}
```

## 📱 Teste Prático

Para testar os critérios atuais:

### ✅ **Imagens que DEVEM passar:**
- Foto clara do celular (>1KB, <10MB)
- Screenshot de comprovante
- Foto de documento bem iluminada

### ❌ **Imagens que DEVEM falhar:**
- Arquivos muito pequenos (<1KB)
- Arquivos muito grandes (>10MB)
- Formatos não-imagem (PDF, DOC)
- Imagens corrompidas

## 🎯 Recomendação

Se você teve imagens rejeitadas que visualmente pareciam boas, provavelmente foi por:

1. **Tamanho do arquivo muito pequeno** (< 1KB)
2. **Formato inválido** (não é realmente uma imagem)
3. **Erro de conversão** Base64

**Solução temporária**: Tire fotos diretamente pelo aplicativo da câmera ou salve capturas de tela em qualidade alta (geralmente >1KB automaticamente).