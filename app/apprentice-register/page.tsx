'use client';

import { useState, useEffect, Suspense } from 'react';
import { Camera, X, Check, Eye, EyeOff } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { signUp } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter';
import { trackRegistration, trackFormSubmission } from '@/lib/gtag';
import { useSmartSecurity } from '@/hooks/useSmartSecurity';
import InvisibleTurnstile from '@/components/InvisibleTurnstile';
import Link from 'next/link';

function ApprenticeRegisterForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const grandpaName = searchParams.get('grandpa') || '';
  const grandpaId = searchParams.get('grandpaId') || '';
  const skill = searchParams.get('skill') || '';
  const isUpdate = searchParams.get('update') === 'true';
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    contact_pref: 'both',
    terms_agreed: false
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [existingApprenticeId, setExistingApprenticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string>('');

  // Smart security hook - invisible protection that doesn't block users
  const { securityToken, canSubmit, getSecurityProps } = useSmartSecurity({
    required: false, // Don't block users
    fallbackAllowed: true, // Always allow submission
    onSecurityCheck: (passed, token) => {
      console.log('🛡️ Apprentice registration security check:', { passed, hasToken: !!token });
    }
  });

  // Load existing data if this is an update
  useEffect(() => {
    if (isUpdate && user) {
      loadExistingData();
    }
  }, [isUpdate, user]);

  const loadExistingData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Query for existing apprentice profile
      const q = query(collection(db, "apprentices"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const apprenticeDoc = querySnapshot.docs[0];
        const apprenticeData = apprenticeDoc.data();
        setExistingApprenticeId(apprenticeDoc.id);
        
        // Parse address back into components
        const fullAddress = apprenticeData.address || '';
        const addressParts = fullAddress.split(', ');
        
        let streetAddress = '';
        let city = '';
        let province = '';
        let postalCode = '';
        
        if (addressParts.length >= 3) {
          streetAddress = addressParts[0] || '';
          city = addressParts[1] || '';
          const lastPart = addressParts[2] || '';
          const lastPartSplit = lastPart.split(' ');
          province = lastPartSplit[0] || '';
          postalCode = lastPartSplit.slice(1).join(' ') || '';
        }
        
        setFormData({
          fullname: apprenticeData.name || user.displayName || '',
          email: apprenticeData.email || user.email || '',
          password: '', // Don't pre-fill password
          confirmPassword: '',
          address: streetAddress,
          city: city,
          province: province,
          postalCode: postalCode,
          phone: apprenticeData.phone || '',
          contact_pref: apprenticeData.contactPreference || 'both',
          terms_agreed: true // Already agreed when they first registered
        });
        
        // Set existing photo if available
        if (apprenticeData.photoURL) {
          setPhotoPreview(apprenticeData.photoURL);
        }
      } else {
        // No existing profile, pre-fill with user data
        setFormData(prev => ({
          ...prev,
          fullname: user.displayName || '',
          email: user.email || ''
        }));
      }
    } catch (error: unknown) {
      console.error('Error loading existing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(''); // Clear error when user types
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setRateLimitError('');

    // Track form submission attempt
    trackFormSubmission('apprentice_registration');

    // Client-side rate limiting check
    const rateLimitCheck = rateLimiter.checkRateLimit(
      'apprentice_registration', 
      RATE_LIMITS.REGISTRATION.maxRequests, 
      RATE_LIMITS.REGISTRATION.windowMs
    );

    if (!rateLimitCheck.allowed) {
      setRateLimitError(`Too many registration attempts. Please wait ${rateLimitCheck.remainingTime} seconds before trying again.`);
      setIsSubmitting(false);
      return;
    }

    // Turnstile validation for new registrations (optional - removed for better UX)
    // Security verification is now optional to improve user experience

    // Basic validation
    if (!formData.fullname || !formData.email || !formData.address || !formData.city || !formData.province || !formData.postalCode || !formData.phone) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Password validation only for new registrations
    if (!isUpdate) {
      if (!formData.password || formData.password !== formData.confirmPassword) {
        setError('Please enter matching passwords');
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }

      if (!formData.terms_agreed) {
        setError('Please agree to the Terms of Service and Privacy Policy');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let userId = user?.uid;

      // Step 1: Create Firebase Auth account (only for new registrations)
      if (!isUpdate && !user) {
        const result = await signUp(formData.email, formData.password, formData.fullname, 'seeker');
        userId = result.user.uid;
      }

      // Step 2: Upload photo if provided
      let photoURL = '';
      if (photo && userId) {
        try {
          const photoRef = ref(storage, `apprentice-photos/${userId}/${Date.now()}-${photo.name}`);
          const snapshot = await uploadBytes(photoRef, photo);
          photoURL = await getDownloadURL(snapshot.ref);
        } catch (photoError) {
          console.warn('Photo upload failed:', photoError);
          // Continue without photo
        }
      }

      // Step 3: Save to Firestore
      const apprenticeData: any = {
        name: formData.fullname,
        address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        city: formData.city,
        province: formData.province,
        phone: formData.phone,
        email: formData.email,
        contactPreference: formData.contact_pref,
        timestamp: new Date().toISOString(),
        userId: userId,
        source: 'website',
        interestedGrandpa: grandpaName,
        interestedGrandpaId: grandpaId
      };

      if (photoURL) {
        apprenticeData.photoURL = photoURL;
      }

      if (isUpdate && existingApprenticeId) {
        await updateDoc(doc(db, "apprentices", existingApprenticeId), apprenticeData);
        console.log('✅ Apprentice profile updated successfully');
      } else {
        await addDoc(collection(db, "apprentices"), apprenticeData);
        console.log('✅ New apprentice registered successfully');
        
        // Track registration event
        trackRegistration('apprentice');
      }

      // Success! Firebase Functions will automatically send email notifications
      console.log('✅ Registration successful, redirecting to dashboard...');
      
      // For new registrations, redirect immediately to dashboard
      if (!isUpdate) {
        // Reset form
        setFormData({
          fullname: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          phone: '',
          contact_pref: 'both',
          terms_agreed: false
        });
        setPhoto(null);
        setPhotoPreview('');
        
        // Redirect immediately to request help form with grandpa info
        router.push(`/request-help?grandpa=${encodeURIComponent(grandpaName)}&grandpaId=${grandpaId}&skill=${encodeURIComponent(skill)}`);
        return;
      }
      
      // For updates, show the modal
      setShowModal(true);

    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (errorMessage.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please use a different email or sign in.';
        } else if (errorMessage.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak. Please use a stronger password.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('permission-denied')) {
          errorMessage = 'Permission denied. Please check your Firebase configuration.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // For updates, stay on the same page so they can make more changes
    // For new registrations, go to dashboard
    if (!isUpdate) {
      router.push('/dashboard');
    }
  };

  // Show loading state while fetching existing data
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
            {isUpdate ? 'Update Profile' : 'Welcome Apprentices'}
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            {isUpdate 
              ? 'Update your information and preferences.' 
              : grandpaName 
                ? `Connect with ${grandpaName} and start your learning journey.`
                : 'Join our community and start learning from experienced mentors.'
            }
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          
          <form onSubmit={handleSubmit}>
            
            {/* Invisible Security - Runs in background, never blocks users */}
            {!isUpdate && <InvisibleTurnstile {...getSecurityProps} />}
            
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
            
            {/* Full Name */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Full Name
              </label>
              <input 
                type="text" 
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. Sarah Johnson" 
                required 
              />
            </div>

            {/* Email */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="sarah@example.com" 
                required 
              />
            </div>

            {/* Password Fields - Only show for new registrations */}
            {!isUpdate && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 pr-12 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                      placeholder="Create a password" 
                      required 
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
                <div>
                  <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 pr-12 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                      placeholder="Confirm your password" 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-vintage-dark/40" />
                      ) : (
                        <Eye className="h-5 h-5 text-vintage-dark/40" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Address Fields */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Address
              </label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0 mb-4" 
                placeholder="e.g. 123 Maple Street" 
                required 
              />
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-vintage-dark font-heading font-bold text-lg mb-2">
                    City
                  </label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                    placeholder="e.g. Calgary" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-vintage-dark font-heading font-bold text-lg mb-2">
                    Province/State
                  </label>
                  <input 
                    type="text" 
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                    placeholder="e.g. AB or TX" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-vintage-dark font-heading font-bold text-lg mb-2">
                    Postal Code/ZIP
                  </label>
                  <input 
                    type="text" 
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                    placeholder="e.g. T2P 1J9" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="(555) 123-4567" 
                required 
              />
            </div>

            {/* Contact Preference */}
            <div className="mb-10 bg-vintage-cream/50 p-6 rounded-xl border border-vintage-gold/20">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-4">
                How should we contact you?
              </label>
              <div className="flex flex-col md:flex-row gap-6">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 transition-colors">
                  <input 
                    type="radio" 
                    name="contact_pref" 
                    value="email"
                    checked={formData.contact_pref === 'email'}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-blue-600 border-2 border-vintage-dark focus:ring-blue-500" 
                  />
                  <span className="text-lg text-vintage-dark">Email me</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 transition-colors">
                  <input 
                    type="radio" 
                    name="contact_pref" 
                    value="phone"
                    checked={formData.contact_pref === 'phone'}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-blue-600 border-2 border-vintage-dark focus:ring-blue-500" 
                  />
                  <span className="text-lg text-vintage-dark">Call me</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-black/5 transition-colors">
                  <input 
                    type="radio" 
                    name="contact_pref" 
                    value="both"
                    checked={formData.contact_pref === 'both'}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-blue-600 border-2 border-vintage-dark focus:ring-blue-500" 
                  />
                  <span className="text-lg text-vintage-dark">Either is fine</span>
                </label>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-10">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Upload a Photo <span className="text-base font-body font-normal text-vintage-dark/60 ml-2">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-vintage-gold/50 rounded-lg text-center bg-vintage-cream cursor-pointer hover:bg-vintage-gold/10 transition-colors relative overflow-hidden h-48 flex items-center justify-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                    alt="Photo Preview" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Camera className="w-10 h-10 text-vintage-dark/40 mb-2" />
                    <p className="text-vintage-dark/60 font-body">Click here to upload a picture of yourself</p>
                  </div>
                )}
              </div>
            </div>

            {/* Terms - Only show for new registrations */}
            {!isUpdate && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    name="terms_agreed"
                    checked={formData.terms_agreed}
                    onChange={handleInputChange}
                    className="mt-1.5 w-5 h-5 accent-vintage-accent cursor-pointer" 
                    required 
                  />
                  <span className="text-sm text-vintage-dark/80 leading-relaxed">
                    I certify that I am at least 18 years of age and I have read and agree to the{' '}
                    <a href="/terms" target="_blank" className="text-vintage-accent font-bold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" target="_blank" className="text-vintage-accent font-bold hover:underline">
                      Privacy Policy
                    </a>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center mb-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-vintage-green text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-vintage-dark transition-colors shadow-lg w-full md:w-auto disabled:opacity-50"
              >
                {isUpdate 
                  ? (isSubmitting ? "Updating Profile..." : "Update Profile")
                  : (isSubmitting ? "Creating Account..." : "Create Account")
                }
              </button>
              
              {/* Security Status Indicator - Optional, for transparency */}
              {!isUpdate && (
                <p className="text-xs text-vintage-dark/50 mt-2">
                  🛡️ Protected by invisible security verification
                </p>
              )}
            </div>

            {/* Already have an account - Only show for new registrations */}
            {!isUpdate && (
              <div className="text-center">
                <p className="text-sm text-vintage-dark/70">
                  Already have an account?{' '}
                  <Link href="/login" className="text-vintage-accent font-bold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Success Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative transform transition-all scale-100 opacity-100">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-vintage-dark/40 hover:text-vintage-dark"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-20 h-20 bg-vintage-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-vintage-green" />
            </div>
            <h3 className="text-3xl font-heading font-bold text-vintage-dark mb-4">
              {isUpdate ? 'Profile Updated!' : 'Welcome to the Club!'}
            </h3>
            <p className="text-lg text-vintage-dark/80 mb-8 font-body">
              {isUpdate 
                ? 'Your profile has been updated successfully.' 
                : 'Your account has been created successfully! Please check your email and click the verification link to activate your account.'
              }
            </p>
            <button 
              onClick={closeModal}
              className="bg-vintage-dark text-white px-8 py-3 rounded-full font-bold hover:bg-vintage-accent transition-colors"
            >
              {isUpdate ? 'Continue Editing' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ApprenticeRegisterPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    }>
      <ApprenticeRegisterForm />
    </Suspense>
  );
}