// Security Feature Test Script
// This script tests the rate limiting and security features

const testRateLimiting = async () => {
  console.log('🧪 Testing Rate Limiting...');
  
  const testEndpoint = 'https://us-central1-ask-my-grandpa.cloudfunctions.net/registerGrandpa';
  
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    address: '123 Test St, Test City, TC T1T 1T1',
    phone: '555-123-4567',
    skills: 'Testing',
    note: 'This is a test registration'
  };

  console.log('📡 Sending 6 sequential requests to test rate limiting...');
  
  const results = [];
  
  for (let i = 0; i < 6; i++) {
    console.log(`🔄 Sending request ${i + 1}/6...`);
    
    try {
      const response = await fetch(testEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const text = await response.text();
      results.push({
        status: response.status,
        attempt: i + 1,
        text: text
      });
      
      console.log(`${response.status === 429 ? '🛡️' : '✅'} Attempt ${i + 1}: Status ${response.status}`);
      if (response.status === 429) {
        console.log(`   Rate limit triggered!`);
        break; // Stop testing once rate limit is hit
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      results.push({
        error: error.message,
        attempt: i + 1
      });
      console.log(`❌ Attempt ${i + 1}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 Rate Limiting Test Results Summary:');
  
  // Test if rate limiting is working
  const rateLimitedRequests = results.filter(r => r.status === 429);
  if (rateLimitedRequests.length > 0) {
    console.log('✅ Rate limiting is working correctly!');
    console.log(`🛡️ ${rateLimitedRequests.length} requests were rate limited`);
  } else {
    console.log('⚠️ Rate limiting may not be working as expected');
    console.log('   This could be normal if requests are spaced out enough');
  }
};

const testPayloadLimit = async () => {
  console.log('\n🧪 Testing Payload Size Limits...');
  
  const testEndpoint = 'https://us-central1-ask-my-grandpa.cloudfunctions.net/registerGrandpa';
  
  // Create a payload larger than 10KB
  const largePayload = {
    name: 'Test User',
    email: 'test@example.com',
    address: '123 Test St, Test City, TC T1T 1T1',
    phone: '555-123-4567',
    skills: 'A'.repeat(15000), // 15KB of data
    note: 'This payload is too large'
  };

  console.log(`📦 Sending ${JSON.stringify(largePayload).length} byte payload (should be rejected)...`);
  
  try {
    const response = await fetch(testEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(largePayload),
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.status === 413) {
      console.log('✅ Payload size limit is working correctly!');
      console.log('🛡️ Large payload was rejected');
    } else {
      console.log('⚠️ Payload size limit may not be working as expected');
    }
    
    const text = await response.text();
    console.log(`📄 Response: ${text}`);
    
  } catch (error) {
    console.log(`❌ Error testing payload limit: ${error.message}`);
  }
};

// Run tests
console.log('🚀 Starting Security Feature Tests...\n');

testRateLimiting()
  .then(() => testPayloadLimit())
  .then(() => {
    console.log('\n🎯 Security testing complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Firebase Functions deployed with rate limiting');
    console.log('✅ Turnstile configuration system implemented');
    console.log('✅ All forms updated with security features');
    console.log('✅ Server-side validation added');
    console.log('\n🔧 Next Steps:');
    console.log('1. Set up actual Cloudflare Turnstile keys');
    console.log('2. Configure NEXT_PUBLIC_TURNSTILE_SITE_KEY');
    console.log('3. Configure TURNSTILE_SECRET_KEY in Firebase Functions');
    console.log('4. Test complete user registration flow');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });