'use client';

import { useState, useEffect } from 'react';
import { Camera, Lock, X, Check, Eye, EyeOff } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { signUp } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
    skills: '',
    note: '',
    terms_agreed: false
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [existingGrandpaId, setExistingGrandpaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Query for existing grandpa profile
      const q = query(collection(db, "grandpas"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const grandpaDoc = querySnapshot.docs[0];
        const grandpaData = grandpaDoc.data();
        setExistingGrandpaId(grandpaDoc.id);
        
        // Parse address back into components
        const fullAddress = grandpaData.address || '';
        const addressParts = fullAddress.split(', ');
        
        setFormData({
          fullname: grandpaData.name || user.displayName || '',
          email: grandpaData.email || user.email || '',
          password: '', // Don't pre-fill password
          confirmPassword: '',
          address: addressParts[0] || '',
          city: addressParts[1] || '',
          province: addressParts[2]?.split(' ')[0] || '',
          postalCode: addressParts[2]?.split(' ').slice(1).join(' ') || '',
          phone: grandpaData.phone || '',
          contact_pref: grandpaData.contactPreference || 'both',
          skills: grandpaData.skills || '',
          note: grandpaData.note || '',
          terms_agreed: true // Already agreed when they first registered
        });
      } else {
        // No existing profile, pre-fill with user data
        setFormData(prev => ({
          ...prev,
          fullname: user.displayName || '',
          email: user.email || ''
        }));
      }
    } catch (error) {
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
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    console.log('Is update:', isUpdate);
    
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.fullname || !formData.email) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Password validation only for new registrations
    if (!isUpdate) {
      if (!formData.password) {
        setError('Password is required');
        setIsSubmitting(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
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

      // Create Firebase Auth account only for new registrations
      if (!isUpdate && !user) {
        console.log('=== CREATING FIREBASE AUTH ACCOUNT ===');
        const result = await signUp(formData.email, formData.password, formData.fullname, 'grandpa');
        console.log('Firebase Auth result:', result);
        userId = result.user.uid;
      }

      // Prepare data for Firestore
      const firestoreData = {
        name: formData.fullname,
        address: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}`,
        phone: formData.phone,
        email: formData.email,
        contactPreference: formData.contact_pref,
        skills: formData.skills,
        note: formData.note,
        timestamp: new Date().toISOString(),
        userId: userId,
        source: 'website'
      };

      if (isUpdate && existingGrandpaId) {
        console.log('=== UPDATING EXISTING FIRESTORE DOCUMENT ===');
        const docRef = doc(db, "grandpas", existingGrandpaId);
        await updateDoc(docRef, firestoreData);
        console.log("✅ Profile updated in Firebase:", existingGrandpaId);
      } else {
        console.log('=== SAVING NEW FIRESTORE DOCUMENT ===');
        const docRef = await addDoc(collection(db, "grandpas"), firestoreData);
        console.log("✅ Registration saved to Firebase:", docRef.id);
      }

      console.log('=== SENDING TO NETLIFY FORMS ===');
      // Send to Netlify Forms
      const netlifyFormData = new FormData();
      netlifyFormData.append('form-name', 'grandpa-registration');
      netlifyFormData.append('name', formData.fullname);
      netlifyFormData.append('address', formData.address);
      netlifyFormData.append('city', formData.city);
      netlifyFormData.append('province', formData.province);
      netlifyFormData.append('postal-code', formData.postalCode);
      netlifyFormData.append('phone', formData.phone);
      netlifyFormData.append('email', formData.email);
      netlifyFormData.append('contact-preference', formData.contact_pref);
      netlifyFormData.append('skills', formData.skills);
      netlifyFormData.append('note', formData.note);
      netlifyFormData.append('timestamp', new Date().toLocaleString());
      netlifyFormData.append('action', isUpdate ? 'update' : 'create');
      
      if (photo) {
        netlifyFormData.append('photo', photo);
      }

      try {
        console.log('Trying primary Netlify method...');
        const netlifyResponse = await fetch('/forms/grandpa-registration', {
          method: 'POST',
          body: netlifyFormData
        });

        console.log('Netlify response status:', netlifyResponse.status);
        if (netlifyResponse.ok) {
          console.log("✅ Registration sent to Netlify Forms");
        } else {
          console.log("Trying alternative Netlify method...");
          const altResponse = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              'form-name': 'grandpa-registration',
              'name': formData.fullname,
              'address': formData.address,
              'city': formData.city,
              'province': formData.province,
              'postal-code': formData.postalCode,
              'phone': formData.phone,
              'email': formData.email,
              'contact-preference': formData.contact_pref,
              'skills': formData.skills,
              'note': formData.note,
              'timestamp': new Date().toLocaleString(),
              'action': isUpdate ? 'update' : 'create'
            }).toString()
          });
          console.log('Alternative Netlify response status:', altResponse.status);
          console.log("✅ Registration sent to Netlify Forms (alternative method)");
        }
      } catch (netlifyError) {
        console.error("Netlify Forms error:", netlifyError);
        // Don't fail the whole process for Netlify Forms
      }

      console.log('=== SHOWING SUCCESS MODAL ===');
      // Show success modal
      setShowModal(true);
      
      // Reset form only for new registrations
      if (!isUpdate) {
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
          skills: '',
          note: '',
          terms_agreed: false
        });
        setPhoto(null);
        setPhotoPreview('');
      }

      console.log('=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===');

    } catch (error: any) {
      console.error('=== FORM SUBMISSION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      setError(error.message || `Failed to ${isUpdate ? 'update' : 'create'} account. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    router.push('/dashboard'); // Always redirect to dashboard
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
            {isUpdate ? 'Update Profile' : 'Grandpa Registration'}
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            {isUpdate ? 'Update your skills and information.' : 'Share your skills and connect with your community.'}
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          
          <form onSubmit={handleSubmit} name="grandpa-registration" method="POST" data-netlify="true" encType="multipart/form-data">
            <input type="hidden" name="form-name" value="grandpa-registration" />
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Hidden fields for Netlify Forms detection */}
            <div style={{ display: 'none' }}>
              <input name="name" value={formData.fullname} readOnly />
              <input name="address" value={formData.address} readOnly />
              <input name="city" value={formData.city} readOnly />
              <input name="province" value={formData.province} readOnly />
              <input name="postal-code" value={formData.postalCode} readOnly />
              <input name="phone" value={formData.phone} readOnly />
              <input name="email" value={formData.email} readOnly />
              <input name="contact-preference" value={formData.contact_pref} readOnly />
              <textarea name="skills" value={formData.skills} readOnly />
              <textarea name="note" value={formData.note} readOnly />
              <input name="timestamp" value={new Date().toLocaleString()} readOnly />
            </div>
            
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
                placeholder="e.g. Frank Miller" 
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
                placeholder="frank@example.com" 
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

            {/* Skills */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                Your Skills
              </label>
              <textarea 
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={4} 
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark placeholder:text-vintage-dark/30 focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. Woodworking, basic plumbing..." 
                required 
              />
            </div>

            {/* Note */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-3">
                One Interesting Note
              </label>
              <textarea 
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3} 
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark placeholder:text-vintage-dark/30 focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. I climbed Mount Kilimanjaro..." 
                required 
              />
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
                onClick={(e) => {
                  console.log('Button clicked!');
                  console.log('Form data at click:', formData);
                }}
              >
                                {isUpdate ? "Update Profile" : (isSubmitting ? "Creating Account..." : "Create Account")}
              </button>
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
                : 'Your grandpa account has been created successfully.'
              }
            </p>
            <button 
              onClick={closeModal}
              className="bg-vintage-dark text-white px-8 py-3 rounded-full font-bold hover:bg-vintage-accent transition-colors w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}