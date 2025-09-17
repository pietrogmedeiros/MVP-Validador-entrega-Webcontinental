#!/bin/bash

# Validador de Entrega - Pacote de Deploy Estático
# Para usuários com permissões limitadas na AWS

echo "📦 Criando pacote de deploy estático"
echo "=================================="

# Criar diretório de build
BUILD_DIR="build-static"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

echo "[INFO] Copiando arquivos do frontend..."

# Copiar arquivos essenciais
cp index.html $BUILD_DIR/
cp styles.css $BUILD_DIR/
cp script.js $BUILD_DIR/  # Versão com mock database para demo
cp favicon.png $BUILD_DIR/

# Copiar assets se existir
if [ -d "assets" ]; then
    cp -r assets $BUILD_DIR/
fi

# Criar um arquivo de configuração para produção
cat > $BUILD_DIR/config.js << 'EOF'
// Configuração para deploy em produção
window.VALIDADOR_CONFIG = {
    mode: 'demo',
    apiUrl: null, // Para modo demo, usa dados mockados
    version: '1.0.0',
    environment: 'production'
};
EOF

# Atualizar index.html para usar modo demo
sed -i.bak 's|script-api.js|script.js|g' $BUILD_DIR/index.html

echo "[INFO] Criando arquivo README para deploy..."

cat > $BUILD_DIR/README-DEPLOY.md << 'EOF'
# Deploy do Validador de Entrega

## Opções de Hospedagem

### 1. Netlify (Recomendado)
1. Acesse https://netlify.com
2. Faça upload da pasta `build-static`
3. Configure domínio personalizado (opcional)

### 2. Vercel
1. Acesse https://vercel.com
2. Conecte com GitHub ou faça upload direto
3. Deploy automático

### 3. GitHub Pages
1. Crie repositório no GitHub
2. Faça upload dos arquivos
3. Ative GitHub Pages nas configurações

### 4. AWS S3 (se tiver permissões)
```bash
aws s3 sync . s3://seu-bucket --delete
aws s3 website s3://seu-bucket --index-document index.html
```

### 5. Qualquer servidor web
- Apache
- Nginx
- IIS
- Servidor local (python -m http.server)

## Modo Atual: DEMO
- Dados mockados para demonstração
- Validação de qualidade de imagem funcional
- Para produção, configure backend real

EOF

echo "[INFO] Criando arquivo zip para upload..."
cd $BUILD_DIR
zip -r ../validador-entrega-deploy.zip .
cd ..

echo ""
echo "✅ Pacote criado com sucesso!"
echo ""
echo "📁 Arquivos disponíveis:"
echo "   • Pasta: $BUILD_DIR/"
echo "   • Arquivo: validador-entrega-deploy.zip"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Faça upload da pasta $BUILD_DIR/ ou do arquivo .zip"
echo "   2. Configure em qualquer provedor de hospedagem estática"
echo "   3. Acesse o README-DEPLOY.md para instruções específicas"
echo ""
echo "🌐 Recomendação: Use Netlify.com para deploy rápido e gratuito"