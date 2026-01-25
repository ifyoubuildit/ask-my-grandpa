'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';
import { getTurnstileSiteKey } from '@/lib/turnstile-config';
import Turnstile from '@/components/Turnstile';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [rateLimitError, setRateLimitError] = useState<string>('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRateLimitError('');

    // Client-side rate limiting check
    const rateLimitCheck = rateLimiter.checkRateLimit(
      'login', 
      RATE_LIMITS.LOGIN.maxRequests, 
      RATE_LIMITS.LOGIN.windowMs
    );

    if (!rateLimitCheck.allowed) {
      setRateLimitError(`Too many login attempts. Please wait ${rateLimitCheck.remainingTime} seconds before trying again.`);
      setIsLoading(false);
      return;
    }

    // Turnstile validation
    if (!turnstileToken) {
      setError('Please complete the security verification');
      setIsLoading(false);
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-vintage-dark">
            Welcome Back
          </h2>
          <p className="mt-2 text-vintage-dark/70 font-body">
            Sign in to your AskMyGrandpa account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {rateLimitError && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg">
              {rateLimitError}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-vintage-dark mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-vintage-dark/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-vintage-gold/30 rounded-lg focus:border-vintage-accent focus:outline-none bg-vintage-cream text-vintage-dark"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-vintage-dark mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-vintage-dark/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border-2 border-vintage-gold/30 rounded-lg focus:border-vintage-accent focus:outline-none bg-vintage-cream text-vintage-dark"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-vintage-dark/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-vintage-dark/40" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Verification */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-vintage-accent" />
              <label className="block text-sm font-bold text-vintage-dark">
                Security Verification
              </label>
            </div>
            <div className="bg-vintage-cream/50 p-4 rounded-lg border border-vintage-gold/20">
              <Turnstile
                siteKey={getTurnstileSiteKey()}
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-vintage-green text-white py-3 px-4 rounded-lg font-bold hover:bg-vintage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-vintage-dark/70">
              Don't have an account?{' '}
              <Link href="/signup" className="text-vintage-accent font-bold hover:underline">
                Sign up here
              </Link>
            </p>
            <Link href="/forgot-password" className="text-sm text-vintage-accent hover:underline">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}