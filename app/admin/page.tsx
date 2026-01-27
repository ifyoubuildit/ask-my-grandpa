'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, ShieldCheck, Clock, Phone, Mail, User, Calendar } from 'lucide-react';

interface VerificationRequest {
  id: string;
  grandpaId: string;
  grandpaName: string;
  grandpaEmail: string;
  grandpaPhone: string;
  availability: string;
  status: string;
  requestedAt: string;
  userId: string;
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Simple admin check - you can make this more sophisticated
  const isAdmin = user?.email === 'cwallace7755@gmail.com' || user?.email === 'info@askmygrandpa.com';

  console.log('👤 Current user email:', user?.email);
  console.log('🔐 Is admin:', isAdmin);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }

    if (user && isAdmin) {
      loadVerificationRequests();
    }
  }, [user, loading, isAdmin, router]);

  const loadVerificationRequests = async () => {
    try {
      console.log('🔍 Loading verification requests...');
      const q = query(collection(db, "verificationRequests"), orderBy("requestedAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      console.log('📊 Query snapshot size:', querySnapshot.size);
      
      const requests = querySnapshot.docs.map(doc => {
        console.log('📄 Document data:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      }) as VerificationRequest[];
      
      console.log('✅ Loaded verification requests:', requests);
      setVerificationRequests(requests);
    } catch (error) {
      console.error('❌ Error loading verification requests:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerifyGrandpa = async (request: VerificationRequest) => {
    try {
      // Update the grandpa record to verified
      await updateDoc(doc(db, "grandpas", request.grandpaId), {
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: user?.email
      });

      // Update the verification request status
      await updateDoc(doc(db, "verificationRequests", request.id), {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completedBy: user?.email
      });

      // Reload the requests
      loadVerificationRequests();
      
      alert(`${request.grandpaName} has been verified successfully!`);
    } catch (error) {
      console.error('Error verifying grandpa:', error);
      alert('Error verifying grandpa. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-vintage-dark">Access Denied</h1>
          <p className="text-vintage-dark/70">You don't have permission to access this page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <header className="pt-16 pb-12 bg-vintage-cream border-b border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-heading font-bold text-vintage-dark">
            Admin Dashboard
          </h1>
          <p className="text-vintage-dark/70 mt-2">
            Manage grandpa verifications and platform oversight
          </p>
        </div>
      </header>

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Verification Requests */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden">
            <div className="border-b border-vintage-gold/20 bg-vintage-cream">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6 text-vintage-accent" />
                  <h2 className="text-2xl font-heading font-bold text-vintage-dark">Verification Requests</h2>
                  {verificationRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="bg-vintage-accent text-white text-xs px-2 py-1 rounded-full">
                      {verificationRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingData ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                  <p className="text-vintage-dark/60 mt-4">Loading verification requests...</p>
                </div>
              ) : verificationRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-vintage-dark mb-2">No verification requests</h4>
                  <p className="text-vintage-dark/60">
                    Verification requests from grandpas will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.map((request) => (
                    <div 
                      key={request.id}
                      className={`border rounded-lg p-6 ${
                        request.status === 'completed' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-vintage-gold/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-vintage-accent/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-vintage-accent" />
                            </div>
                            <div>
                              <h3 className="text-lg font-heading font-bold text-vintage-dark">
                                {request.grandpaName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-vintage-dark/70">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {request.grandpaEmail}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {request.grandpaPhone}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-vintage-cream p-4 rounded-lg mb-4">
                            <h4 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Availability
                            </h4>
                            <p className="text-vintage-dark whitespace-pre-wrap">
                              {request.availability}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-vintage-dark/60">
                            <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status === 'completed' ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="ml-6">
                            <button
                              onClick={() => handleVerifyGrandpa(request)}
                              className="bg-vintage-green text-white px-6 py-3 rounded-lg font-bold hover:bg-vintage-dark transition-colors flex items-center gap-2"
                            >
                              <ShieldCheck className="w-5 h-5" />
                              Mark as Verified
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}