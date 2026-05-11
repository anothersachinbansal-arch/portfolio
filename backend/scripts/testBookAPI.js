import fetch from 'node-fetch';

async function testBookAPI() {
  try {
    console.log('🧪 Testing Book API endpoints...');
    
    // Test available books endpoint
    const availableResponse = await fetch('http://localhost:5000/api/books/available');
    const availableData = await availableResponse.json();
    
    console.log('✅ Available Books API Response:');
    console.log(JSON.stringify(availableData, null, 2));
    
    // Test admin books endpoint
    const adminResponse = await fetch('http://localhost:5000/api/books/admin/all');
    const adminData = await adminResponse.json();
    
    console.log('\n✅ Admin Books API Response:');
    console.log(JSON.stringify(adminData, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

testBookAPI();
