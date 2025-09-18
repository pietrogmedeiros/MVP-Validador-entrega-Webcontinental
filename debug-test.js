// Quick test function to force show fields
function forceShowFields() {
    console.log('🧪 Force showing all fields for testing...');
    
    const clientFields = document.getElementById('client-fields');
    const logisticsFields = document.getElementById('logistics-fields');
    
    if (clientFields) {
        clientFields.style.display = 'block';
        clientFields.style.visibility = 'visible';
        clientFields.classList.remove('hidden');
        console.log('✅ Client fields forced visible');
    } else {
        console.error('❌ client-fields not found');
    }
    
    if (logisticsFields) {
        logisticsFields.style.display = 'block';
        logisticsFields.style.visibility = 'visible';
        logisticsFields.classList.remove('hidden');
        console.log('✅ Logistics fields forced visible');
    } else {
        console.error('❌ logistics-fields not found');
    }
}

// Run test after 2 seconds
setTimeout(forceShowFields, 2000);