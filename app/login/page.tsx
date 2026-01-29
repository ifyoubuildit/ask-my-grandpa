'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, resetPassword } from '@/lib/auth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';
import { useSmartSecurity } from '@/hooks/useSmartSecurity';
import InvisibleTurnstile from '@/components/InvisibleTurnstile';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rateLimitError, setRateLimitError] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Smart security hook - invisible protection that doesn't block users
  const { securityToken, canSubmit, getSecurityProps } = useSmartSecurity({
    required: false, // Don't block users
    fallbackAllowed: true, // Always allow submission
    onSecurityCheck: (passed, token) => {
      console.log('🛡️ Login security check:', { passed, hasToken: !!token });
    }
  });
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

    // Turnstile validation (optional - removed for better UX)
    // Security verification is now optional to improve user experience

    try {
      console.log('🔐 Attempting login with:', { email: formData.email, hasPassword: !!formData.password });
      await signIn(formData.email, formData.password);
      console.log('✅ Login successful, redirecting to dashboard');
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        email: formData.email
      });
      
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (error?.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error?.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please register first.';
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(formData.email);
      setResetEmailSent(true);
      setError('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error?.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Ask My Grandpa Logo" 
              className="w-28 h-20"
            />
          </div>
          <h2 className="text-3xl font-heading font-bold text-vintage-dark">
            Welcome Back
          </h2>
          <p className="mt-2 text-vintage-dark/70 font-body">
            Sign in to your AskMyGrandpa account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          {/* Invisible Security - Runs in background, never blocks users */}
          <InvisibleTurnstile {...getSecurityProps} />
          
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-vintage-green text-white py-3 px-4 rounded-lg font-bold hover:bg-vintage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          {/* Security Status Indicator - Optional, for transparency */}
          <p className="text-xs text-vintage-dark/50 text-center">
            🛡️ Protected by invisible security verification
          </p>

          {/* Debug Information - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>Email: {formData.email}</p>
              <p>Password length: {formData.password.length}</p>
              <p>If you're getting "invalid-credential" errors:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Check if the account exists</li>
                <li>Verify email/password are correct</li>
                <li>Try password reset if needed</li>
              </ul>
            </div>
          )}

          {/* Success Message for Password Reset */}
          {resetEmailSent && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Password reset email sent! Check your inbox and follow the instructions to reset your password.
            </div>
          )}

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-vintage-dark/70">
              Don't have an account?{' '}
              <Link href="/signup" className="text-vintage-accent font-bold hover:underline">
                Sign up here
              </Link>
            </p>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-vintage-accent hover:underline"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}