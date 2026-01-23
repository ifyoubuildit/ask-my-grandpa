'use client';

import { useState, useEffect, Suspense } from 'react';
import { Send, Clock, Calendar, User } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function RequestHelpForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const grandpaName = searchParams.get('grandpa') || '';
  const grandpaId = searchParams.get('grandpaId') || '';
  const skill = searchParams.get('skill') || '';
  
  const [formData, setFormData] = useState({
    subject: skill ? `${skill} Help` : '',
    availability: '',
    message: skill ? `Hi! My name is ${user?.displayName || '[Your Name]'} and I am looking for help with ${skill.toLowerCase()}.` : ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [grandpaData, setGrandpaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load grandpa data
  useEffect(() => {
    const loadGrandpaData = async () => {
      if (!grandpaName) return;
      
      try {
        const q = query(collection(db, "grandpas"), where("name", "==", grandpaName));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const grandpaDoc = querySnapshot.docs[0];
          setGrandpaData({ id: grandpaDoc.id, ...grandpaDoc.data() });
        }
      } catch (error) {
        console.error('Error loading grandpa data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGrandpaData();
  }, [grandpaName]);

  // Update message when user info is available
  useEffect(() => {
    if (user && skill && !formData.message.includes(user.displayName || '')) {
      setFormData(prev => ({
        ...prev,
        message: `Hi! My name is ${user.displayName || 'Joe Smith'} and I am looking for help with ${skill.toLowerCase()}.`
      }));
    }
  }, [user, skill]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.subject || !formData.availability || !formData.message) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setError('You must be logged in to send a request');
      setIsSubmitting(false);
      return;
    }

    try {
      // Save request to Firestore
      const requestData = {
        apprenticeId: user.uid,
        apprenticeName: user.displayName || user.email,
        apprenticeEmail: user.email,
        grandpaId: grandpaData?.id || grandpaId,
        grandpaName: grandpaName,
        grandpaEmail: grandpaData?.email || '',
        subject: formData.subject,
        availability: formData.availability,
        message: formData.message,
        status: 'pending',
        timestamp: new Date().toISOString(),
        skill: skill
      };

      await addDoc(collection(db, "requests"), requestData);

      // Send email notification to grandpa
      try {
        console.log('📧 Attempting to send to Netlify Forms...');
        
        // Create a hidden form and submit it to Netlify
        const form = document.createElement('form');
        form.setAttribute('name', 'grandpa-request');
        form.setAttribute('method', 'POST');
        form.setAttribute('data-netlify', 'true');
        form.style.display = 'none';
        
        // Add all form fields
        const fields = {
          'form-name': 'grandpa-request',
          'grandpa-name': grandpaName,
          'grandpa-email': grandpaData?.email || '',
          'apprentice-name': user.displayName || user.email || '',
          'apprentice-email': user.email || '',
          'subject': formData.subject,
          'availability': formData.availability,
          'message': formData.message,
          'timestamp': new Date().toLocaleString()
        };
        
        Object.entries(fields).forEach(([name, value]) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'hidden');
          input.setAttribute('name', name);
          input.setAttribute('value', value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        
        // Submit the form
        const formData2 = new FormData(form);
        
        const netlifyResponse = await fetch('/', {
          method: 'POST',
          body: formData2
        });
        
        console.log('📧 Netlify response status:', netlifyResponse.status);
        
        if (netlifyResponse.ok) {
          console.log('✅ Successfully sent to Netlify Forms');
        } else {
          const responseText = await netlifyResponse.text();
          console.warn('⚠️ Netlify Forms response:', netlifyResponse.status, netlifyResponse.statusText);
          console.warn('⚠️ Response body:', responseText);
        }
        
        // Clean up
        document.body.removeChild(form);
        
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      // Success - redirect to dashboard
      router.push('/dashboard?message=request-sent');

    } catch (error) {
      console.error('Request failed:', error);
      setError('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Request Help
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            Send a message to {grandpaName} about your project
          </p>
        </div>
      </header>

      {/* Grandpa Info Card */}
      {grandpaData && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-vintage-cream rounded-full flex items-center justify-center">
                  {grandpaData.photoURL ? (
                    <img 
                      src={grandpaData.photoURL} 
                      alt={grandpaData.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-vintage-dark/40" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-vintage-dark">
                    {grandpaData.name}
                  </h3>
                  <p className="text-vintage-dark/60">
                    {grandpaData.address?.split(',').slice(-2).join(',').trim()}
                  </p>
                  <p className="text-sm text-vintage-accent font-bold">
                    Skills: {grandpaData.skills}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Request Form */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          
          <form onSubmit={handleSubmit} name="grandpa-request" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="grandpa-request" />
            <input type="hidden" name="bot-field" />
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Hidden fields for Netlify Forms detection */}
            <div style={{ display: 'none' }}>
              <input name="grandpa-name" value={grandpaName} readOnly />
              <input name="grandpa-email" value={grandpaData?.email || ''} readOnly />
              <input name="apprentice-name" value={user?.displayName || ''} readOnly />
              <input name="apprentice-email" value={user?.email || ''} readOnly />
              <input name="subject" value={formData.subject} readOnly />
              <input name="availability" value={formData.availability} readOnly />
              <textarea name="message" value={formData.message} readOnly />
              <input name="timestamp" value={new Date().toLocaleString()} readOnly />
            </div>
            
            {/* Subject */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Subject
              </label>
              <input 
                type="text" 
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. Plumbing Help" 
                required 
              />
            </div>

            {/* Availability */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Availability
              </label>
              <input 
                type="text" 
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. Weekends, evenings after 6pm, flexible" 
                required 
              />
            </div>

            {/* Message */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Message
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6} 
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark placeholder:text-vintage-dark/40 focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="Hi! My name is Joe Smith and I am looking for help fixing a leaky faucet."
                required 
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-vintage-green text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-vintage-dark transition-colors shadow-lg w-full md:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Request Grandpa
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function RequestHelpPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    }>
      <RequestHelpForm />
    </Suspense>
  );
}