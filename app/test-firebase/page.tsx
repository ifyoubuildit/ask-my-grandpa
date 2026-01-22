'use client';

import { useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestFirebase() {
  const [status, setStatus] = useState('');
  const [data, setData] = useState<any[]>([]);

  const testWrite = async () => {
    setStatus('Testing write...');
    try {
      const docRef = await addDoc(collection(db, "test"), {
        message: "Hello Firebase!",
        timestamp: new Date().toISOString()
      });
      setStatus(`✅ Write Success! Doc ID: ${docRef.id}`);
    } catch (error) {
      setStatus(`❌ Write Error: ${error}`);
      console.error("Write error:", error);
    }
  };

  const testRead = async () => {
    setStatus('Testing read...');
    try {
      const querySnapshot = await getDocs(collection(db, "test"));
      const docs: any[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setData(docs);
      setStatus(`✅ Read Success! Found ${docs.length} documents`);
    } catch (error) {
      setStatus(`❌ Read Error: ${error}`);
      console.error("Read error:", error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testWrite}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test Write
        </button>
        
        <button 
          onClick={testRead}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Read
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Status:</h3>
        <p>{status}</p>
      </div>

      {data.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-bold">Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold">Environment Check:</h3>
        <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
        <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
      </div>
    </div>
  );
}