'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker' as 'grandpa' | 'seeker'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.role);
      
      // Redirect based on role
      if (formData.role === 'grandpa') {
        router.push('/register'); // Complete grandpa profile
      } else {
        router.push('/dashboard'); // Go to seeker dashboard
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
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
              className="w-20 h-20"
            />
          </div>
          <h2 className="text-3xl font-heading font-bold text-vintage-dark">
            Join AskMyGrandpa
          </h2>
          <p className="mt-2 text-vintage-dark/70 font-body">
            Create your account to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-vintage-dark mb-3">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                  formData.role === 'seeker' 
                    ? 'border-vintage-accent bg-vintage-accent/10' 
                    : 'border-vintage-gold/30 hover:border-vintage-gold'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="seeker"
                    checked={formData.role === 'seeker'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <User className="w-8 h-8 mx-auto mb-2 text-vintage-dark" />
                    <div className="font-bold text-vintage-dark">Get Help</div>
                    <div className="text-sm text-vintage-dark/70">Find a Grandpa</div>
                  </div>
                </label>
                
                <label className={`cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                  formData.role === 'grandpa' 
                    ? 'border-vintage-accent bg-vintage-accent/10' 
                    : 'border-vintage-gold/30 hover:border-vintage-gold'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="grandpa"
                    checked={formData.role === 'grandpa'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-vintage-dark" />
                    <div className="font-bold text-vintage-dark">Share Skills</div>
                    <div className="text-sm text-vintage-dark/70">Be a Grandpa</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-bold text-vintage-dark mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-vintage-dark/40" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-vintage-gold/30 rounded-lg focus:border-vintage-accent focus:outline-none bg-vintage-cream text-vintage-dark"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-vintage-dark mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-vintage-dark/40" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-vintage-gold/30 rounded-lg focus:border-vintage-accent focus:outline-none bg-vintage-cream text-vintage-dark"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-vintage-green text-white py-3 px-4 rounded-lg font-bold hover:bg-vintage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Links */}
          <div className="text-center">
            <p className="text-sm text-vintage-dark/70">
              Already have an account?{' '}
              <Link href="/login" className="text-vintage-accent font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}