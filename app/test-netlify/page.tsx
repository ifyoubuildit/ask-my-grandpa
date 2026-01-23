'use client';

import { useState } from 'react';

export default function TestNetlifyPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testNetlifyForms = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      // Test the exact method used in registration forms
      const netlifyData = new URLSearchParams();
      netlifyData.append('form-name', 'test-form');
      netlifyData.append('test-field', 'Hello from test');
      
      console.log('🧪 Testing Netlify Forms with URLSearchParams...');
      console.log('🧪 Data:', netlifyData.toString());
      
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: netlifyData.toString()
      });
      
      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response ok:', response.ok);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('🧪 Response body length:', responseText.length);
      
      // Check if response contains form success indicators
      const hasFormSuccess = responseText.includes('Thank you') || 
                           responseText.includes('success') || 
                           responseText.includes('submitted') ||
                           response.status === 200;
      
      setResult(`
Status: ${response.status} ${response.ok ? '✅' : '❌'}
Content-Type: ${response.headers.get('content-type')}
Response Length: ${responseText.length} chars
Form Success Indicators: ${hasFormSuccess ? '✅ Found' : '❌ Not found'}

Response Headers:
${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}

Response Body Preview (first 1000 chars):
${responseText.substring(0, 1000)}...

Analysis:
- Status 200 = Form submission accepted by Netlify
- Large HTML response = Normal (Netlify returns the page after submission)
- Check Netlify dashboard for actual form submissions
      `);
      
    } catch (error) {
      console.error('🧪 Test failed:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGrandpaForm = async () => {
    setLoading(true);
    setResult('Testing Grandpa Registration Form...');

    try {
      // Use EXACT same field names and structure as the actual registration form
      const netlifyData = new URLSearchParams();
      netlifyData.append('form-name', 'grandpa-registration');
      netlifyData.append('name', 'Test Grandpa Direct');
      netlifyData.append('address', '123 Test St, Test City, TC 12345');
      netlifyData.append('city', 'Test City');
      netlifyData.append('province', 'TC');
      netlifyData.append('postal-code', '12345');
      netlifyData.append('phone', '555-123-4567');
      netlifyData.append('email', 'testgrandpa@example.com');
      netlifyData.append('contact-preference', 'email');
      netlifyData.append('skills', 'Testing, Debugging, Form Validation');
      netlifyData.append('note', 'This is a direct test of the grandpa registration form using exact field names');
      netlifyData.append('timestamp', new Date().toLocaleString());
      
      console.log('🧪 Testing Grandpa Registration Form with exact field structure...');
      console.log('🧪 Data being sent:', netlifyData.toString());
      
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: netlifyData.toString()
      });
      
      const responseText = await response.text();
      
      setResult(`
Grandpa Form Test Results:
Status: ${response.status} ${response.ok ? '✅' : '❌'}
Response Length: ${responseText.length} chars

Data sent: ${netlifyData.toString()}

✅ If status is 200, check Netlify dashboard > Forms > grandpa-registration
📧 Should see "Test Grandpa Direct" submission
📧 Should get email notification at info@askmygrandpa.com

Next: Compare this with actual registration form submission
      `);
      
    } catch (error) {
      setResult(`Grandpa Form Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGrandpaRequestForm = async () => {
    setLoading(true);
    setResult('Testing Grandpa Request Form...');

    try {
      // Test the grandpa request form with sample data
      const netlifyData = new URLSearchParams();
      netlifyData.append('form-name', 'grandpa-request');
      netlifyData.append('grandpa-name', 'Test Grandpa');
      netlifyData.append('grandpa-email', 'testgrandpa@example.com'); // This should receive the email
      netlifyData.append('apprentice-name', 'Test Apprentice');
      netlifyData.append('apprentice-email', 'testapprentice@example.com');
      netlifyData.append('subject', 'Plumbing Help');
      netlifyData.append('availability', 'Weekends');
      netlifyData.append('message', 'Hi! I need help with a leaky faucet.');
      netlifyData.append('timestamp', new Date().toLocaleString());
      
      console.log('🧪 Testing Grandpa Request Form...');
      
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: netlifyData.toString()
      });
      
      setResult(`
Grandpa Request Test Results:
Status: ${response.status} ${response.ok ? '✅' : '❌'}

This tests the email notification system.
If successful, testgrandpa@example.com should receive an email.
Check Netlify dashboard > Forms > grandpa-request for submission.
      `);
      
    } catch (error) {
      setResult(`Grandpa Request Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Netlify Forms Test</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testNetlifyForms}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 mr-4"
          >
            {loading ? 'Testing...' : 'Test Basic Form'}
          </button>
          
          <button 
            onClick={testGrandpaForm}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 mr-4"
          >
            {loading ? 'Testing...' : 'Test Grandpa Registration'}
          </button>
          
          <button 
            onClick={testGrandpaRequestForm}
            disabled={loading}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Grandpa Request Email'}
          </button>
        </div>
        
        {result && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-bold mb-2">Test Results:</h2>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">Understanding Netlify Forms:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Status 200:</strong> Form submission was accepted by Netlify</li>
            <li><strong>Large HTML response:</strong> Normal - Netlify returns the full page after submission</li>
            <li><strong>Check Netlify Dashboard:</strong> Go to Forms section to see actual submissions</li>
            <li><strong>Email notifications:</strong> Should arrive at info@askmygrandpa.com if configured</li>
          </ul>
        </div>
      </div>
    </main>
  );
}