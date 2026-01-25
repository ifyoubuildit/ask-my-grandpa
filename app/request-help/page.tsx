'use client';

import { useState, useEffect, Suspense } from 'react';
import { Send, User, Shield } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';
import Turnstile from '@/components/Turnstile';

function RequestHelpForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const grandpaName = searchParams.get('grandpa') || '';
  const grandpaId = searchParams.get('grandpaId') || '';
  const skill = searchParams.get('skill') || '';
  
  const [formData, setFormData] = useState({
    subject: '',
    availability: '',
    message: ''
  });
  
  // Initialize form data when skill is available
  useEffect(() => {
    if (skill) {
      setFormData(prev => ({
        ...prev,
        subject: `${skill} Help`
      }));
    }
  }, [skill]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [grandpaData, setGrandpaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [rateLimitError, setRateLimitError] = useState<string>('');

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
    console.log('🔧 Request Help Debug:', { user: user?.displayName, skill, grandpaName });
    if (user && skill) {
      setFormData(prev => ({
        ...prev,
        subject: `${skill} Help`,
        message: `Hi! My name is ${user.displayName || 'Chris Wallace'} and I am looking for ${skill.toLowerCase()} help. Specifically...`
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
    setRateLimitError('');

    // Client-side rate limiting check
    const rateLimitCheck = rateLimiter.checkRateLimit(
      'request_help', 
      RATE_LIMITS.REQUEST_HELP.maxRequests, 
      RATE_LIMITS.REQUEST_HELP.windowMs
    );

    if (!rateLimitCheck.allowed) {
      setRateLimitError(`Too many requests. Please wait ${rateLimitCheck.remainingTime} seconds before trying again.`);
      setIsSubmitting(false);
      return;
    }

    // Turnstile validation
    if (!turnstileToken) {
      setError('Please complete the security verification');
      setIsSubmitting(false);
      return;
    }

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

    // Debug authentication state
    console.log('🔐 Authentication check before submission:', {
      user: !!user,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });

    try {
      console.log('🚀 Starting request submission...');
      
      // Fetch apprentice's address from their profile
      let apprenticeAddress = '';
      try {
        const apprenticeQuery = query(collection(db, "apprentices"), where("userId", "==", user.uid));
        const apprenticeSnapshot = await getDocs(apprenticeQuery);
        if (!apprenticeSnapshot.empty) {
          const apprenticeData = apprenticeSnapshot.docs[0].data();
          apprenticeAddress = apprenticeData.address || '';
        }
      } catch (addressError) {
        console.warn('Could not fetch apprentice address:', addressError);
      }
      
      // Save request to Firestore (without apprentice address for security)
      const requestData = {
        apprenticeId: user.uid,
        apprenticeName: user.displayName || user.email,
        apprenticeEmail: user.email,
        // apprenticeAddress: removed for security - only added server-side when confirmed
        grandpaId: grandpaData?.userId || grandpaId, // Use userId instead of document id
        grandpaName: grandpaName,
        grandpaEmail: grandpaData?.email || '',
        subject: formData.subject,
        availability: formData.availability,
        message: formData.message,
        status: 'pending',
        timestamp: new Date().toISOString(),
        skill: skill
      };

      console.log('💾 Saving request to Firestore...', requestData);
      await addDoc(collection(db, "requests"), requestData);
      console.log('✅ Request saved to Firestore successfully');

      // Firebase Functions will automatically send email notifications
      console.log('📧 Firebase Functions will send email notifications automatically');

      console.log('🎯 Redirecting to dashboard...');
      
      // Success - redirect with window.location for more reliable redirect
      console.log('🎯 Attempting immediate redirect to dashboard...');
      window.location.href = '/dashboard?message=request-sent';

    } catch (error) {
      console.error('❌ Request submission failed:', error);
      setError('Failed to send request. Please try again.');
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
          
          <form onSubmit={handleSubmit}>
            
            {/* Error Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {rateLimitError && (
              <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
                {rateLimitError}
              </div>
            )}
            
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
                placeholder={`Hi! My name is ${user?.displayName || 'Chris Wallace'} and I am looking for ${skill || 'help'} help. Specifically...`}
                required 
              />
            </div>

            {/* Security Verification */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-vintage-accent" />
                <label className="block text-vintage-dark font-heading font-bold text-lg">
                  Security Verification
                </label>
              </div>
              <div className="bg-vintage-cream/50 p-4 rounded-lg border border-vintage-gold/20">
                <Turnstile
                  siteKey="0x4AAAAAAAkqiE3QKmGNdGQy" // Replace with your actual Cloudflare Turnstile site key
                  onVerify={setTurnstileToken}
                  onError={() => setError('Security verification failed. Please try again.')}
                  onExpire={() => setTurnstileToken('')}
                  theme="light"
                  size="normal"
                  className="flex justify-center"
                />
              </div>
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
                    Request Mentorship
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