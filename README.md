# Validador de Entrega - Webcontinental

Sistema de validação de entregas com upload de comprovantes e validação de notas fiscais.

## 🚀 Funcionalidades

- ✅ **Dropdown condicional**: Cliente ou Transportadora
- ✅ **Campos dinâmicos**: Nome/CPF para clientes ou empresa para transportadoras
- ✅ **Validação de nota fiscal** automática
- ✅ **Upload de comprovantes** com preview
- ✅ **Interface responsiva** para mobile
- ✅ **Formatação automática** de CPF
- ✅ **QR Codes de acesso** com branding Webcontinental

## 📱 Acesso

**URL da aplicação**: https://validador-entrega-website-1758128536.s3.us-east-2.amazonaws.com/index.html

Ou use os QR codes disponíveis em `QRCODE-ACESSO.md`

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: AWS Lambda, Node.js 18.x
- **Database**: DynamoDB
- **Storage**: AWS S3
- **Deploy**: AWS SAM

## 📋 Como usar

1. Acesse a aplicação via URL ou QR code
2. Selecione se você é **Cliente** ou **Transportadora**
3. Preencha os dados conforme sua seleção:
   - **Cliente**: Nome completo + CPF
   - **Transportadora**: Empresa de logística
4. Insira o número da nota fiscal
5. Faça upload do comprovante de entrega
6. Valide e envie

## 🎯 Arquivos principais

- `index.html` - Interface principal
- `script-fixed.js` - Lógica da aplicação
- `styles.css` - Estilos e responsividade
- `QRCODE-ACESSO.md` - QR codes de acesso
- `assets/` - Logos e imagens

## 🔧 Status

✅ **Em produção** - Todas as funcionalidades implementadas e testadas
✅ **Responsivo** - Funciona em mobile, tablet e desktop  
✅ **Validado** - Campos condicionais e validação de formulário funcionando
✅ **Deployado** - Hospedado na AWS S3 com backend Lambda

---

*Desenvolvido para Webcontinental - Sistema de Validação de Entregas*