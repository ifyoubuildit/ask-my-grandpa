'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, X, Loader } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !uid) {
        setStatus('invalid');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const verifyEmailToken = httpsCallable(functions, 'verifyEmailToken');
        await verifyEmailToken({ token, uid });
        
        setStatus('success');
        setMessage('Your email has been verified successfully! Welcome to Ask My Grandpa.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        
      } catch (error: any) {
        console.error('Email verification failed:', error);
        setStatus('error');
        
        if (error.code === 'functions/already-exists') {
          setMessage('Your email is already verified. You can proceed to your dashboard.');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else if (error.code === 'functions/invalid-argument') {
          setMessage('Invalid or expired verification link. Please request a new verification email.');
        } else {
          setMessage('Verification failed. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [token, uid, router]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-vintage-accent animate-spin" />;
      case 'success':
        return <Check className="w-16 h-16 text-vintage-green" />;
      case 'error':
      case 'invalid':
        return <X className="w-16 h-16 text-red-500" />;
      default:
        return <Loader className="w-16 h-16 text-vintage-accent animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified!';
      case 'error':
      case 'invalid':
        return 'Verification Failed';
      default:
        return 'Verifying Your Email...';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-vintage-green/20';
      case 'error':
      case 'invalid':
        return 'bg-red-50';
      default:
        return 'bg-vintage-accent/20';
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-vintage-cream px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 text-center shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          <div className={`w-20 h-20 ${getBackgroundColor()} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {getIcon()}
          </div>
          
          <h1 className="text-3xl font-heading font-bold text-vintage-dark mb-4">
            {getTitle()}
          </h1>
          
          <p className="text-lg text-vintage-dark/80 mb-8 font-body">
            {message}
          </p>
          
          {status === 'success' && (
            <div className="text-sm text-vintage-dark/60">
              Redirecting to dashboard in 3 seconds...
            </div>
          )}
          
          {(status === 'error' || status === 'invalid') && (
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/login')}
                className="bg-vintage-dark text-white px-6 py-3 rounded-full font-bold hover:bg-vintage-accent transition-colors w-full"
              >
                Go to Login
              </button>
              <button 
                onClick={() => router.push('/')}
                className="text-vintage-accent hover:text-vintage-dark transition-colors text-sm"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}