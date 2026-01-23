'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { logOut } from '@/lib/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Search, MessageCircle, Calendar, Clock, Check, X } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'previous' | 'upcoming'>('upcoming');
  const [requests, setRequests] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success message
  useEffect(() => {
    if (searchParams.get('message') === 'request-sent') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Load requests and mentorships
  useEffect(() => {
    const loadData = async () => {
      if (!user || !profile) return;
      
      try {
        if (profile?.role === 'grandpa') {
          // Load requests sent to this grandpa
          const requestsQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRequests(requestsData);
          
          // Load accepted mentorships
          const mentorshipsQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid),
            where("status", "==", "accepted")
          );
          const mentorshipsSnapshot = await getDocs(mentorshipsQuery);
          const mentorshipsData = mentorshipsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMentorships(mentorshipsData);
        } else {
          // Load requests sent by this apprentice
          const requestsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRequests(requestsData);
          
          // Load accepted mentorships
          const mentorshipsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid),
            where("status", "==", "accepted")
          );
          const mentorshipsSnapshot = await getDocs(mentorshipsQuery);
          const mentorshipsData = mentorshipsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMentorships(mentorshipsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user, profile]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      });
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: 'declined',
        declinedAt: new Date().toISOString()
      });
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  // Client-side only authentication checks
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      if (!user) {
        console.log('🔒 Dashboard auth check failed:', { user: !!user, profile: !!profile, loading });
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state during authentication check
  if (loading || !user || !profile) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    );
  }

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark">
              Welcome, {profile?.displayName || 'User'}!
            </h1>
            <button
              onClick={handleLogout}
              className="text-vintage-dark font-bold hover:text-vintage-accent transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            {/* Profile Management */}
            <Link 
              href={profile?.role === 'grandpa' ? "/register?update=true" : "/apprentice-register?update=true"} 
              className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-accent/20 rounded-full flex items-center justify-center group-hover:bg-vintage-accent/30 transition-colors">
                  <User className="w-6 h-6 text-vintage-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    Update Profile
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    {profile?.role === 'grandpa' ? 'Update your skills and info' : 'Update your info and preferences'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Messages */}
            <div className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-dark/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-vintage-dark" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    Messages
                    {requests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="ml-2 bg-vintage-accent text-white text-xs px-2 py-1 rounded-full">
                        {requests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    {profile?.role === 'grandpa' ? 'Help requests from apprentices' : 'Your sent requests'}
                  </p>
                </div>
              </div>
              
              {/* Messages List */}
              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                {loadingData ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-sm text-vintage-dark/60 text-center py-4">
                    {profile?.role === 'grandpa' ? 'No help requests yet' : 'No requests sent yet'}
                  </p>
                ) : (
                  requests.slice(0, 3).map((request) => (
                    <div key={request.id} className="border border-vintage-gold/20 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-vintage-dark">
                            {request.subject}
                          </h4>
                          <p className="text-xs text-vintage-dark/60">
                            {profile?.role === 'grandpa' 
                              ? `From: ${request.apprenticeName}` 
                              : `To: ${request.grandpaName}`
                            }
                          </p>
                          <p className="text-xs text-vintage-dark/80 mt-1 line-clamp-2">
                            {request.message}
                          </p>
                        </div>
                        <div className="ml-2 flex flex-col gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                          {profile?.role === 'grandpa' && request.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request.id)}
                                className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mentorship Section */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden">
            
            {/* Tab Navigation - Both Always Visible, Only Text Color Changes */}
            <div className="border-b border-vintage-gold/20">
              <div className="grid grid-cols-2">
                <button
                  onClick={() => setActiveTab('previous')}
                  className="px-6 py-4 font-heading font-bold text-lg transition-colors border-r border-vintage-gold/20 hover:bg-vintage-cream"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className={`w-5 h-5 ${activeTab === 'previous' ? 'text-vintage-accent' : 'text-vintage-dark'}`} />
                    <span className={activeTab === 'previous' ? 'text-vintage-accent' : 'text-vintage-dark'}>
                      {profile?.role === 'grandpa' ? 'Previous Mentorship' : 'Previous Apprentice'}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className="px-6 py-4 font-heading font-bold text-lg transition-colors hover:bg-vintage-cream"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className={`w-5 h-5 ${activeTab === 'upcoming' ? 'text-vintage-accent' : 'text-vintage-dark'}`} />
                    <span className={activeTab === 'upcoming' ? 'text-vintage-accent' : 'text-vintage-dark'}>
                      {profile?.role === 'grandpa' ? 'Upcoming Mentorship' : 'Upcoming Apprentice'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content - Changes Based on Active Tab */}
            <div className="p-8">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✅ Your request has been sent successfully! The grandpa will be notified by email.
                </div>
              )}
              
              {activeTab === 'previous' ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold text-vintage-dark mb-2">
                    {profile?.role === 'grandpa' ? 'No Previous Mentorships' : 'No Previous Apprenticeships'}
                  </h3>
                  <p className="text-vintage-dark/70 max-w-md mx-auto">
                    {profile?.role === 'grandpa' 
                      ? "Your completed mentorship sessions will be listed here for your reference."
                      : "Your completed learning sessions with Grandpas will appear here."
                    }
                  </p>
                </div>
              ) : (
                <div>
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                    </div>
                  ) : mentorships.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                      <h3 className="text-2xl font-heading font-bold text-vintage-dark mb-2">
                        {profile?.role === 'grandpa' ? 'No Upcoming Mentorships' : 'No Upcoming Apprenticeships'}
                      </h3>
                      <p className="text-vintage-dark/70 mb-6 max-w-md mx-auto">
                        {profile?.role === 'grandpa' 
                          ? "When someone reaches out for your help, their sessions will appear here."
                          : "Your scheduled mentorship sessions will appear here once you connect with a Grandpa."
                        }
                      </p>
                      {profile?.role === 'seeker' && (
                        <Link 
                          href="/search"
                          className="inline-flex items-center gap-2 bg-vintage-green text-white px-6 py-3 rounded-full font-bold hover:bg-vintage-dark transition-colors"
                        >
                          <Search className="w-4 h-4" />
                          Find a Grandpa
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {mentorships.map((mentorship) => (
                        <div key={mentorship.id} className="bg-vintage-cream/50 rounded-xl p-6 border border-vintage-gold/20">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-vintage-accent/20 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-vintage-accent" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-heading font-bold text-vintage-dark text-lg">
                                {profile?.role === 'grandpa' ? mentorship.apprenticeName : mentorship.grandpaName}
                              </h4>
                              <p className="text-vintage-accent font-bold text-sm mb-2">
                                {mentorship.subject}
                              </p>
                              <p className="text-sm text-vintage-dark/70 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {mentorship.availability}
                              </p>
                              <p className="text-sm text-vintage-dark/80 line-clamp-2">
                                {mentorship.message}
                              </p>
                              <div className="mt-3 pt-3 border-t border-vintage-gold/20">
                                <p className="text-xs text-vintage-dark/60">
                                  Accepted: {new Date(mentorship.acceptedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Role-specific Tips */}
          <div className="mt-12 bg-vintage-cream p-8 rounded-2xl border border-vintage-gold/30">
            <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">
              {profile?.role === 'grandpa' ? 'Grandpa Resources' : 'How to Get Help'}
            </h2>
            
            {profile?.role === 'grandpa' ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-vintage-dark mb-2">Getting Started</h3>
                  <ul className="space-y-2 text-vintage-dark/80">
                    <li>• Complete your profile with skills and photo</li>
                    <li>• Write an engaging personal note</li>
                    <li>• Keep your contact preferences updated</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-vintage-dark mb-2">Best Practices</h3>
                  <ul className="space-y-2 text-vintage-dark/80">
                    <li>• Be patient and encouraging</li>
                    <li>• Focus on teaching, not doing</li>
                    <li>• Share stories and experiences</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-vintage-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="font-bold text-vintage-dark mb-2">Search</h3>
                  <p className="text-sm text-vintage-dark/70">Find a Grandpa with the skills you need</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-vintage-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="font-bold text-vintage-dark mb-2">Connect</h3>
                  <p className="text-sm text-vintage-dark/70">Reach out and schedule a time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-vintage-green rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="font-bold text-vintage-dark mb-2">Learn</h3>
                  <p className="text-sm text-vintage-dark/70">Work together and gain new skills</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  );
}