'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestFirebase() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestore = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        timestamp: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "test"), testData);
      setResult(`✅ Success! Document created with ID: ${docRef.id}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
      console.error('Firebase test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Test</h1>
      <button 
        onClick={testFirestore}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre>{result}</pre>
      </div>
    </div>
  );
}