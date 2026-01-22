'use client';

import { useState } from 'react';
import { Camera, Lock, X, Check } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    address: '',
    phone: '',
    email: '',
    contact_pref: 'both',
    skills: '',
    note: '',
    terms_agreed: false
  });
  
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusLog, setStatusLog] = useState<Array<{message: string, type: string}>>([]);
  const [showLog, setShowLog] = useState(false);

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatusLog(prev => [...prev, { message, type }]);
    setShowLog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    setStatusLog([]);
    
    try {
      // 1. Send to Netlify (simulate)
      log("Sending to Netlify...");
      // In a real app, you'd send the form data to Netlify here
      log("Netlify: Sent successfully.", 'success');

      // 2. Send to Firebase
      log("Sending to Google Database...");
      
      const firestoreData = {
        name: formData.fullname,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        contactPreference: formData.contact_pref,
        skills: formData.skills,
        note: formData.note,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, "grandpas"), firestoreData);
      log("Google Database: Saved successfully!", 'success');

      // 3. Show success modal
      setTimeout(() => {
        setShowModal(true);
        setFormData({
          fullname: '',
          address: '',
          phone: '',
          email: '',
          contact_pref: 'both',
          skills: '',
          note: '',
          terms_agreed: false
        });
        setPhoto(null);
        setPhotoPreview('');
        setIsSubmitting(false);
      }, 1500);

    } catch (error) {
      log(`Error: ${error}`, 'error');
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    window.location.href = "/";
  };

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Grandpa Registration
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            Share your skills and connect with your community.
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          
          <form onSubmit={handleSubmit}>
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
            
            {/* Address */}
            <div className="mb-8">
              <label className="block text-vintage-dark font-heading font-bold text-xl mb-1">
                Address
              </label>
              <p className="text-sm text-vintage-dark/60 mb-3 italic flex items-center gap-1">
                <Lock className="w-3 h-3" /> Don't worry, only your name will show up on the site.
              </p>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-lg text-vintage-dark focus:border-vintage-accent focus:outline-none focus:ring-0" 
                placeholder="e.g. 123 Maple Street, Calgary" 
                required 
              />
            </div>

            {/* Phone and Email */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
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
              <div>
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

            {/* Terms */}
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
            
            {/* Status Log */}
            {showLog && (
              <div className="mb-6 p-4 bg-gray-100 rounded border border-gray-300">
                <p className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-2">Transaction Log</p>
                <div className="text-xs font-mono space-y-1">
                  {statusLog.map((entry, index) => (
                    <div 
                      key={index} 
                      className={
                        entry.type === 'error' ? 'text-red-600' : 
                        entry.type === 'success' ? 'text-green-600' : 
                        'text-gray-700'
                      }
                    >
                      {entry.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-vintage-green text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-vintage-dark transition-colors shadow-lg w-full md:w-auto disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Complete Registration"}
              </button>
            </div>
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
            <h3 className="text-3xl font-heading font-bold text-vintage-dark mb-4">Welcome to the Club!</h3>
            <p className="text-lg text-vintage-dark/80 mb-8 font-body">We've successfully received your registration.</p>
            <button 
              onClick={closeModal}
              className="bg-vintage-dark text-white px-8 py-3 rounded-full font-bold hover:bg-vintage-accent transition-colors w-full"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </main>
  );
}