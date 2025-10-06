const AWS = require('aws-sdk');

// Configure AWS SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Sample data for testing - Database de Produtos para Teste
const sampleDeliveryOrders = [
    {
        invoiceNumber: 'NF001234567',
        customerCPF: '123.456.789-01',
        deliveryCEP: '01310-100',
        productDescription: 'Smartphone Samsung Galaxy S23 128GB Preto - Tela 6.1" Dynamic AMOLED 2X',
        productValue: 2499.99,
        customerName: 'João Silva Santos',
        deliveryAddress: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
        status: 'Saiu para entrega',
        createdAt: '2025-09-15T10:30:00Z',
        weight: '0.174kg',
        dimensions: '14.6 x 7.06 x 0.76 cm'
    },
    {
        invoiceNumber: 'NF002345678',
        customerCPF: '987.654.321-09',
        deliveryCEP: '04567-890',
        productDescription: 'Notebook Dell Inspiron 15 3000 Intel Core i5 8GB RAM 256GB SSD',
        productValue: 3299.00,
        customerName: 'Maria Oliveira Costa',
        deliveryAddress: 'Rua Augusta, 2690 - Jardim Paulista, São Paulo - SP',
        status: 'Saiu para entrega',
        createdAt: '2025-09-14T14:22:00Z',
        weight: '1.83kg',
        dimensions: '35.8 x 23.6 x 1.99 cm'
    },
    {
        invoiceNumber: 'NF003456789',
        customerCPF: '456.789.123-45',
        deliveryCEP: '22071-900',
        productDescription: 'Smart TV LG 55" 4K UHD ThinQ AI 55UP7750PSB HDR Ativo',
        productValue: 2899.90,
        customerName: 'Carlos Roberto Lima',
        deliveryAddress: 'Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ',
        status: 'Cancelado',
        createdAt: '2025-09-13T09:15:00Z',
        weight: '15.9kg',
        dimensions: '124.3 x 77.8 x 8.6 cm'
    },
    {
        invoiceNumber: 'NF004567890',
        customerCPF: '321.654.987-65',
        deliveryCEP: '30112-000',
        productDescription: 'Fone de Ouvido Sony WH-1000XM4 Bluetooth Noise Cancelling',
        productValue: 1299.99,
        customerName: 'Ana Paula Ferreira',
        deliveryAddress: 'Av. Afonso Pena, 1270 - Centro, Belo Horizonte - MG',
        status: 'Saiu para entrega',
        createdAt: '2025-09-12T16:45:00Z',
        weight: '0.254kg',
        dimensions: '25.4 x 22.0 x 8.9 cm'
    },
    {
        invoiceNumber: 'NF005678901',
        customerCPF: '789.123.456-78',
        deliveryCEP: '70040-010',
        productDescription: 'Câmera Canon EOS Rebel T7i Kit 18-55mm DSLR 24.2MP Full HD',
        productValue: 3799.00,
        customerName: 'Pedro Henrique Souza',
        deliveryAddress: 'SCS Quadra 02, Bloco C - Asa Sul, Brasília - DF',
        status: 'Saiu para entrega',
        createdAt: '2025-09-11T11:30:00Z',
        weight: '0.532kg',
        dimensions: '13.1 x 10.2 x 7.6 cm'
    },
    {
        invoiceNumber: 'NF006789012',
        customerCPF: '654.321.789-32',
        deliveryCEP: '90010-150',
        productDescription: 'Tablet Apple iPad Air 64GB Wi-Fi Space Gray 10.9" Chip A14',
        productValue: 4199.00,
        customerName: 'Fernanda Castro Alves',
        deliveryAddress: 'Rua dos Andradas, 1001 - Centro Histórico, Porto Alegre - RS',
        status: 'Saiu para entrega',
        createdAt: '2025-09-10T13:20:00Z',
        weight: '0.458kg',
        dimensions: '24.76 x 17.85 x 0.61 cm'
    },
    {
        invoiceNumber: 'NF007890123',
        customerCPF: '147.258.369-14',
        deliveryCEP: '80020-360',
        productDescription: 'Console PlayStation 5 Digital Edition 825GB SSD Ultra HD Blu-ray',
        productValue: 4299.99,
        customerName: 'Lucas Matheus Rocha',
        deliveryAddress: 'Av. Cândido de Abreu, 817 - Centro Cívico, Curitiba - PR',
        status: 'Saiu para entrega',
        createdAt: '2025-09-09T08:55:00Z',
        weight: '3.9kg',
        dimensions: '39.0 x 26.0 x 10.4 cm'
    },
    {
        invoiceNumber: 'NF008901234',
        customerCPF: '258.369.147-25',
        deliveryCEP: '40070-110',
        productDescription: 'Máquina de Café Nespresso Vertuo Plus Preta com Aeroccino',
        productValue: 899.90,
        customerName: 'Juliana Santos Barbosa',
        deliveryAddress: 'Av. Tancredo Neves, 2915 - Caminho das Árvores, Salvador - BA',
        status: 'Saiu para entrega',
        createdAt: '2025-09-08T15:10:00Z',
        weight: '4.1kg',
        dimensions: '34.2 x 17.2 x 31.6 cm'
    },
    {
        invoiceNumber: 'NF009012345',
        customerCPF: '369.147.258-36',
        deliveryCEP: '88010-000',
        productDescription: 'Monitor Gamer ASUS TUF Gaming 24" Full HD 144Hz 1ms IPS',
        productValue: 1499.99,
        customerName: 'Rafael Augusto Dias',
        deliveryAddress: 'Rua Felipe Schmidt, 390 - Centro, Florianópolis - SC',
        status: 'Saiu para entrega',
        createdAt: '2025-09-07T12:40:00Z',
        weight: '3.4kg',
        dimensions: '54.0 x 40.0 x 21.8 cm'
    },
    {
        invoiceNumber: 'NF010123456',
        customerCPF: '741.852.963-74',
        deliveryCEP: '60175-047',
        productDescription: 'Ar Condicionado Split Inverter Electrolux 12000 BTUs Frio',
        productValue: 1899.00,
        customerName: 'Camila Rodrigues Melo',
        deliveryAddress: 'Av. Dom Luís, 1200 - Aldeota, Fortaleza - CE',
        status: 'Saiu para entrega',
        createdAt: '2025-09-06T10:25:00Z',
        weight: '8.5kg',
        dimensions: '79.8 x 54.5 x 32.0 cm'
    }
];

// CloudFormation custom resource handler
exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { RequestType, ResourceProperties } = event;
    const tableName = ResourceProperties.TableName;
    
    try {
        if (RequestType === 'Create' || RequestType === 'Update') {
            console.log(`Initializing DynamoDB table: ${tableName}`);
            
            // Check if data already exists
            const scanParams = {
                TableName: tableName,
                Limit: 1
            };
            
            const existingData = await dynamodb.scan(scanParams).promise();
            
            if (existingData.Items && existingData.Items.length > 0) {
                console.log('Data already exists in table, skipping initialization');
                await sendResponse(event, context, 'SUCCESS', {
                    Message: 'Table already contains data'
                });
                return;
            }
            
            // Insert sample data
            console.log('Inserting sample delivery orders...');
            
            const putPromises = sampleDeliveryOrders.map(item => {
                const params = {
                    TableName: tableName,
                    Item: item,
                    ConditionExpression: 'attribute_not_exists(invoiceNumber)'
                };
                return dynamodb.put(params).promise();
            });
            
            await Promise.all(putPromises);
            
            console.log(`Successfully inserted ${sampleDeliveryOrders.length} delivery orders`);
            
            await sendResponse(event, context, 'SUCCESS', {
                Message: `Successfully initialized table with ${sampleDeliveryOrders.length} records`,
                RecordsInserted: sampleDeliveryOrders.length
            });
            
        } else if (RequestType === 'Delete') {
            console.log('Delete operation - no action needed');
            await sendResponse(event, context, 'SUCCESS', {
                Message: 'Delete completed'
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
        await sendResponse(event, context, 'FAILED', {
            Message: error.message
        });
    }
};

// Send response to CloudFormation
async function sendResponse(event, context, status, data) {
    const responseBody = {
        Status: status,
        Reason: `See CloudWatch Log Stream: ${context.logStreamName}`,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: data
    };
    
    console.log('Response body:', JSON.stringify(responseBody, null, 2));
    
    const https = require('https');
    const url = require('url');
    
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(event.ResponseURL);
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: 'PUT',
            headers: {
                'Content-Type': '',
                'Content-Length': JSON.stringify(responseBody).length
            }
        };
        
        const request = https.request(options, (response) => {
            console.log('Response status code:', response.statusCode);
            resolve();
        });
        
        request.on('error', (error) => {
            console.error('Error sending response:', error);
            reject(error);
        });
        
        request.write(JSON.stringify(responseBody));
        request.end();
    });
}