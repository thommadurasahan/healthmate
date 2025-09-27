const fetch = require('node-fetch');

async function testSearch() {
  try {
    // Test the search API endpoint
    const searchTerms = ['Paracetamol', 'Ibuprofen', 'aspirin', 'pain'];
    
    for (const term of searchTerms) {
      console.log(`\n=== Testing search for: "${term}" ===`);
      
      const response = await fetch(`http://localhost:3001/api/search/medicines?q=${encodeURIComponent(term)}`, {
        headers: {
          'Cookie': 'next-auth.session-token=test-token' // This won't work without proper auth
        }
      });
      
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error testing search:', error);
  }
}

testSearch();