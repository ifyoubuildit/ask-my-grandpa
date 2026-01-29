'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { logOut } from '@/lib/auth';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Search, MessageCircle, Calendar, Clock, Check, X, Mail, MailOpen, ChevronRight, Shield, ShieldCheck, Video } from 'lucide-react';
import Link from 'next/link';
import MessageDetailModal from '@/components/MessageDetailModal';

interface RequestData {
  id: string;
  status: string;
  subject: string;
  apprenticeName: string;
  grandpaName: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

// Verification Banner Component
function VerificationBanner() {
  const { user } = useAuth();
  const [grandpaData, setGrandpaData] = useState<any>(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [availability, setAvailability] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrandpaData = async () => {
      if (!user) return;
      
      try {
        const q = query(collection(db, "grandpas"), where("userId", "==", user.uid));
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
  }, [user]);

  const handleRequestVerification = async () => {
    console.log('🔍 Starting verification request...');
    console.log('📝 Availability text:', availability);
    console.log('👤 Grandpa data:', grandpaData);
    
    if (!availability.trim() || !grandpaData) {
      console.log('❌ Missing availability or grandpa data');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('📤 Updating grandpa record...');
      // Update grandpa record with verification request
      await updateDoc(doc(db, "grandpas", grandpaData.id), {
        verificationStatus: 'requested',
        verificationRequestedAt: new Date().toISOString(),
        verificationAvailability: availability
      });
      console.log('✅ Grandpa record updated');

      console.log('📤 Creating verification request...');
      // Create verification request for admin
      await addDoc(collection(db, "verificationRequests"), {
        grandpaId: grandpaData.id,
        grandpaName: grandpaData.name,
        grandpaEmail: grandpaData.email,
        grandpaPhone: grandpaData.phone,
        availability: availability,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        userId: user?.uid
      });
      console.log('✅ Verification request created');

      console.log('🔄 Updating local state...');
      // Update local state
      setGrandpaData((prev: any) => ({
        ...prev,
        verificationStatus: 'requested',
        verificationRequestedAt: new Date().toISOString()
      }));
      
      setShowVerificationForm(false);
      setAvailability('');
      console.log('✅ Verification request completed successfully!');
    } catch (error) {
      console.error('❌ Error requesting verification:', error);
      alert('Error submitting verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;
  
  // Don't show banner if already verified
  if (grandpaData?.isVerified) {
    return (
      <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-green-800">
              ✅ Verified Grandpa
            </h3>
            <p className="text-green-700">
              Your account is verified and active. You'll now appear in apprentice searches!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show different messages based on verification status
  const getStatusMessage = (): { title: string; message: string; color: 'orange' | 'blue' | 'yellow' } => {
    switch (grandpaData?.verificationStatus) {
      case 'requested':
        return {
          title: "Verification Call Requested",
          message: "Thanks for submitting your availability! We'll contact you soon to schedule your 10-minute verification call.",
          color: "blue"
        };
      case 'scheduled':
        return {
          title: "Verification Call Scheduled",
          message: "Your verification call has been scheduled. We'll send you the details soon!",
          color: "blue"
        };
      case 'completed':
        return {
          title: "Verification Call Complete",
          message: "Your verification call is complete. We're reviewing your application and will notify you soon!",
          color: "yellow"
        };
      default:
        return {
          title: "Complete Your Verification",
          message: "To start helping apprentices, we need a quick 10-minute chat to verify your account and ensure everyone's safety.",
          color: "orange"
        };
    }
  };

  const statusInfo = getStatusMessage();
  const colorClasses: Record<'orange' | 'blue' | 'yellow', string> = {
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800", 
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800"
  };

  return (
    <div className={`mb-8 border rounded-xl p-6 ${colorClasses[statusInfo.color]}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-heading font-bold mb-2">
            {statusInfo.title}
          </h3>
          <p className="mb-4">
            {statusInfo.message}
          </p>
          
          {grandpaData?.verificationStatus === 'pending' && (
            <>
              {!showVerificationForm ? (
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="bg-vintage-accent text-orange-800 px-6 py-3 rounded-lg font-heading font-bold hover:bg-vintage-dark hover:text-white transition-colors flex items-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Schedule My Verification Call
                </button>
              ) : (
                <div className="bg-white/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-3">When are you available for a 10-minute call?</h4>
                  <textarea
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="Please share your availability (days/times that work best for you)&#10;&#10;Example:&#10;- Weekdays after 2 PM&#10;- Saturday mornings&#10;- Tuesday/Thursday evenings"
                    className="w-full p-3 border border-vintage-gold/30 rounded-lg resize-none h-32 text-vintage-dark"
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleRequestVerification}
                      disabled={!availability.trim() || isSubmitting}
                      className="bg-vintage-green text-white px-6 py-2 rounded-lg font-bold hover:bg-vintage-dark transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Availability'}
                    </button>
                    <button
                      onClick={() => setShowVerificationForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-400 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'previous' | 'upcoming'>('upcoming');
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [confirmedMeetings, setConfirmedMeetings] = useState<RequestData[]>([]);
  const [completedMeetings, setCompletedMeetings] = useState<RequestData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Check for success message
  useEffect(() => {
    if (searchParams.get('message') === 'request-sent') {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Load requests and confirmed meetings
  useEffect(() => {
    const loadData = async () => {
      if (!user || !profile) return;
      
      try {
        if (profile?.role === 'grandpa') {
          // Load all requests sent to this grandpa (for messages section only)
          const requestsQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const allRequestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RequestData[];
          
          allRequestsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Enrich requests with photo URLs
          const enrichedRequests = await Promise.all(
            allRequestsData.map(async (request) => {
              // Get apprentice photo
              let apprenticePhotoURL = '';
              try {
                console.log('🔍 Looking for apprentice photo:', { 
                  requestId: request.id, 
                  apprenticeId: request.apprenticeId 
                });
                const apprenticeQuery = query(
                  collection(db, "apprentices"), 
                  where("userId", "==", request.apprenticeId)
                );
                const apprenticeSnapshot = await getDocs(apprenticeQuery);
                console.log('📸 Apprentice query result:', { 
                  found: !apprenticeSnapshot.empty,
                  apprenticeId: request.apprenticeId
                });
                if (!apprenticeSnapshot.empty) {
                  const apprenticeData = apprenticeSnapshot.docs[0].data();
                  apprenticePhotoURL = apprenticeData.photoURL || '';
                  console.log('📸 Apprentice photo found:', { 
                    hasPhoto: !!apprenticePhotoURL,
                    photoURL: apprenticePhotoURL 
                  });
                }
              } catch (error) {
                console.warn('Could not fetch apprentice photo:', error);
              }
              
              return {
                ...request,
                apprenticePhotoURL
              };
            })
          );
          
          // Filter for messages section (all messages for ongoing communication)
          const messagesData = enrichedRequests;
          setRequests(messagesData);
          
          // Load upcoming confirmed meetings (only confirmed status)
          const upcomingMeetings = enrichedRequests.filter(r => r.status === 'confirmed');
          setConfirmedMeetings(upcomingMeetings);
          
          // Load completed meetings (for Previous section)
          const completedMeetings = enrichedRequests.filter(r => r.status === 'completed');
          setCompletedMeetings(completedMeetings);
        } else {
          // Load all requests sent by this apprentice
          const requestsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const allRequestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RequestData[];
          
          allRequestsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Enrich requests with photo URLs
          const enrichedRequests = await Promise.all(
            allRequestsData.map(async (request) => {
              // Get grandpa photo
              let grandpaPhotoURL = '';
              try {
                const grandpaQuery = query(
                  collection(db, "grandpas"), 
                  where("userId", "==", request.grandpaId)
                );
                const grandpaSnapshot = await getDocs(grandpaQuery);
                if (!grandpaSnapshot.empty) {
                  const grandpaData = grandpaSnapshot.docs[0].data();
                  grandpaPhotoURL = grandpaData.photoURL || '';
                }
              } catch (error) {
                console.warn('Could not fetch grandpa photo:', error);
              }
              
              return {
                ...request,
                grandpaPhotoURL
              };
            })
          );
          
          // Filter for messages section (all messages for ongoing communication)
          const messagesData = enrichedRequests;
          setRequests(messagesData);
          
          // Load upcoming confirmed meetings (only confirmed status)
          const upcomingMeetings = enrichedRequests.filter(r => r.status === 'confirmed');
          setConfirmedMeetings(upcomingMeetings);
          
          // Load completed meetings (for Previous section)
          const completedMeetings = enrichedRequests.filter(r => r.status === 'completed');
          setCompletedMeetings(completedMeetings);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user, profile]);

  const handleMessageClick = (request: any) => {
    setSelectedMessage(request);
    setShowMessageModal(true);
  };

  const handleModalClose = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const handleMessageUpdate = () => {
    // Reload data after message update
    setLoadingData(true);
    const loadData = async () => {
      if (!user || !profile) return;
      
      try {
        if (profile?.role === 'grandpa') {
          const requestsQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const allRequestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RequestData[];
          
          allRequestsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Enrich requests with photo URLs
          const enrichedRequests = await Promise.all(
            allRequestsData.map(async (request) => {
              // Get apprentice photo
              let apprenticePhotoURL = '';
              try {
                const apprenticeQuery = query(
                  collection(db, "apprentices"), 
                  where("userId", "==", request.apprenticeId)
                );
                const apprenticeSnapshot = await getDocs(apprenticeQuery);
                if (!apprenticeSnapshot.empty) {
                  const apprenticeData = apprenticeSnapshot.docs[0].data();
                  apprenticePhotoURL = apprenticeData.photoURL || '';
                }
              } catch (error) {
                console.warn('Could not fetch apprentice photo:', error);
              }
              
              return {
                ...request,
                apprenticePhotoURL
              };
            })
          );
          
          const messagesData = enrichedRequests;
          setRequests(messagesData);
          
          const upcomingMeetings = enrichedRequests.filter(r => r.status === 'confirmed');
          setConfirmedMeetings(upcomingMeetings);
          
          const completedMeetings = enrichedRequests.filter(r => r.status === 'completed');
          setCompletedMeetings(completedMeetings);
        } else {
          const requestsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const allRequestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RequestData[];
          
          allRequestsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Enrich requests with photo URLs
          const enrichedRequests = await Promise.all(
            allRequestsData.map(async (request) => {
              // Get grandpa photo
              let grandpaPhotoURL = '';
              try {
                const grandpaQuery = query(
                  collection(db, "grandpas"), 
                  where("userId", "==", request.grandpaId)
                );
                const grandpaSnapshot = await getDocs(grandpaQuery);
                if (!grandpaSnapshot.empty) {
                  const grandpaData = grandpaSnapshot.docs[0].data();
                  grandpaPhotoURL = grandpaData.photoURL || '';
                }
              } catch (error) {
                console.warn('Could not fetch grandpa photo:', error);
              }
              
              return {
                ...request,
                grandpaPhotoURL
              };
            })
          );
          
          const messagesData = enrichedRequests;
          setRequests(messagesData);
          
          const upcomingMeetings = enrichedRequests.filter(r => r.status === 'confirmed');
          setConfirmedMeetings(upcomingMeetings);
          
          const completedMeetings = enrichedRequests.filter(r => r.status === 'completed');
          setCompletedMeetings(completedMeetings);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'accepted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'declined': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Check className="w-4 h-4" />;
      case 'confirmed': return <Calendar className="w-4 h-4" />;
      case 'declined': return <X className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const needsResponse = (request: any) => {
    if (profile?.role === 'grandpa' && request.status === 'pending') return true;
    if (profile?.role === 'seeker' && request.status === 'accepted') return true;
    return false;
  };

  // Helper function to get meeting date/time
  const getMeetingDateTime = (meeting: any): Date | null => {
    if (meeting.confirmedDateTime) {
      return new Date(meeting.confirmedDateTime);
    }
    
    if (meeting.finalSelectedTime && meeting.finalSelectedTime.length > 0) {
      const selectedSlot = meeting.finalSelectedTime[0];
      const date = new Date(selectedSlot.date);
      const hour = selectedSlot.timeSlots[0];
      date.setHours(hour, 0, 0, 0);
      return date;
    }
    
    return null;
  };

  // Helper function to handle "Request Additional Mentorship"
  const handleRequestAdditionalMentorship = (meeting: any) => {
    const grandpaName = profile?.role === 'grandpa' ? meeting.apprenticeName : meeting.grandpaName;
    const grandpaId = profile?.role === 'grandpa' ? meeting.apprenticeId : meeting.grandpaId;
    const skill = meeting.skill || meeting.subject;
    
    router.push(`/request-help?grandpa=${encodeURIComponent(grandpaName)}&grandpaId=${grandpaId}&skill=${encodeURIComponent(skill)}`);
  };

  // Client-side only authentication checks
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      console.log('🏠 Dashboard auth check:', { 
        user: !!user, 
        profile: !!profile, 
        role: profile?.role,
        loading 
      });
      
      if (!user) {
        console.log('🔒 Dashboard auth check failed: no user, redirecting to login');
        router.push('/login');
      } else if (profile) {
        console.log('✅ Dashboard loaded for user:', { 
          role: profile.role, 
          name: profile.displayName 
        });
      }
    }
  }, [user, profile, loading, router]);

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
    <div className="min-h-screen bg-vintage-cream relative">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 opacity-20 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: "url('/assets/granpda-dashboard-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Main Dashboard Content */}
      <div className="relative z-10">
        <main className="flex-1">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Request sent successfully!
        </div>
      )}

      {/* Hero Section */}
      <header 
        className="pt-16 pb-12 border-b border-vintage-gold/20"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 64, 54, 0.7), rgba(74, 64, 54, 0.7)), url('/assets/granpda-dashboard-hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Ask My Grandpa Logo" 
                className="w-16 h-16"
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">
                  Welcome, {profile?.displayName || 'User'}!
                </h1>
                <p className="text-white/90 mt-2">
                  {profile?.role === 'grandpa' ? 'Help apprentices learn new skills' : 'Connect with experienced mentors'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white font-bold hover:text-vintage-accent transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Verification Banner - Only show for unverified grandpas */}
          {profile?.role === 'grandpa' && (
            <VerificationBanner />
          )}
          
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
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

            {/* Find Help/Mentors */}
            <Link 
              href="/search" 
              className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-green/20 rounded-full flex items-center justify-center group-hover:bg-vintage-green/30 transition-colors">
                  <Search className="w-6 h-6 text-vintage-green" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    {profile?.role === 'grandpa' ? 'Find Apprentices' : 'Find Mentors'}
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    {profile?.role === 'grandpa' ? 'Browse apprentices needing help' : 'Search for skilled mentors'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Stats */}
            <div className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-dark/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-vintage-dark" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    Activity
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    {requests.length} total messages
                  </p>
                  <p className="text-xs text-vintage-dark/60">
                    {confirmedMeetings.length} confirmed meetings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden mb-8">
            
            {/* Messages Header */}
            <div className="border-b border-vintage-gold/20 bg-vintage-cream">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-6 h-6 text-vintage-accent" />
                  <h2 className="text-2xl font-heading font-bold text-vintage-dark">Messages</h2>
                  {requests.filter(r => needsResponse(r)).length > 0 && (
                    <span className="bg-vintage-accent text-white text-xs px-2 py-1 rounded-full">
                      {requests.filter(r => needsResponse(r)).length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Content */}
            <div className="p-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">
                  {profile?.role === 'grandpa' ? 'Help Requests' : 'Your Messages'}
                </h3>
                
                {loadingData ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                    <p className="text-vintage-dark/60 mt-4">Loading messages...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-vintage-dark mb-2">No messages yet</h4>
                    <p className="text-vintage-dark/60 mb-6">
                      {profile?.role === 'grandpa' 
                        ? 'When apprentices request your help, their messages will appear here.'
                        : 'Your sent help requests will appear here.'
                      }
                    </p>
                    {profile?.role === 'seeker' && (
                      <Link 
                        href="/search"
                        className="bg-vintage-accent text-white px-6 py-3 rounded-lg font-bold hover:bg-vintage-dark transition-colors"
                      >
                        Find a Mentor
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div 
                        key={request.id}
                        onClick={() => handleMessageClick(request)}
                        className="border border-vintage-gold/20 rounded-lg p-4 hover:bg-vintage-cream/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-shrink-0">
                              {needsResponse(request) ? (
                                <MailOpen className="w-6 h-6 text-vintage-accent" />
                              ) : (
                                <Mail className="w-6 h-6 text-vintage-dark/40" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-vintage-dark group-hover:text-vintage-accent transition-colors">
                                  {request.subject}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </div>
                                </span>
                              </div>
                              
                              <p className="text-sm text-vintage-dark/70 mb-2">
                                {profile?.role === 'grandpa' 
                                  ? `From: ${request.apprenticeName}` 
                                  : `To: ${request.grandpaName}`
                                }
                              </p>
                              
                              <p className="text-sm text-vintage-dark/80 line-clamp-2">
                                {request.message}
                              </p>
                              
                              {needsResponse(request) && (
                                <p className="text-sm text-vintage-accent font-medium mt-2">
                                  {profile?.role === 'grandpa' ? 'Needs your response' : 'Waiting for your confirmation'}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-vintage-dark/60">
                              {new Date(request.timestamp).toLocaleDateString()}
                            </span>
                            <ChevronRight className="w-4 h-4 text-vintage-dark/40 group-hover:text-vintage-accent transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previous and Upcoming Section */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden mb-8">
            
            {/* Tab Navigation */}
            <div className="border-b border-vintage-gold/20">
              <div className="grid grid-cols-2">
                <button
                  onClick={() => setActiveTab('previous')}
                  className={`px-6 py-4 font-heading font-bold text-lg transition-colors border-r border-vintage-gold/20 ${
                    activeTab === 'previous' 
                      ? 'bg-vintage-cream text-vintage-accent' 
                      : 'text-vintage-dark hover:bg-vintage-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Previous {profile?.role === 'grandpa' ? 'Mentorship' : 'Mentorship'}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-4 font-heading font-bold text-lg transition-colors ${
                    activeTab === 'upcoming' 
                      ? 'bg-vintage-cream text-vintage-accent' 
                      : 'text-vintage-dark hover:bg-vintage-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Upcoming {profile?.role === 'grandpa' ? 'Mentorship' : 'Mentorship'}</span>
                    {confirmedMeetings.length > 0 && (
                      <span className="bg-vintage-green text-white text-xs px-2 py-1 rounded-full">
                        {confirmedMeetings.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'previous' && (
                <div>
                  <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">
                    Previous Mentorship
                  </h3>
                  
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                      <p className="text-vintage-dark/60 mt-4">Loading previous...</p>
                    </div>
                  ) : completedMeetings.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-vintage-dark mb-2">No previous mentorship yet</h4>
                      <p className="text-vintage-dark/60">
                        Completed mentorship sessions will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedMeetings.map((meeting) => (
                        <div 
                          key={meeting.id}
                          className="border border-vintage-gold/20 rounded-lg p-4 bg-green-50/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex-shrink-0">
                                <Check className="w-6 h-6 text-green-600" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-bold text-vintage-dark">
                                    {meeting.subject}
                                  </h4>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-600 border-green-200">
                                    Completed
                                  </span>
                                </div>
                                <p className="text-sm text-vintage-dark/70 mb-2">
                                  {profile?.role === 'grandpa' 
                                    ? `With ${meeting.apprenticeName}`
                                    : `With ${meeting.grandpaName}`
                                  }
                                </p>
                                <p className="text-xs text-vintage-dark/60 mb-3">
                                  {new Date(meeting.timestamp).toLocaleDateString()}
                                </p>
                                
                                {/* Request Additional Mentorship Button - Only show for apprentices */}
                                {profile?.role === 'seeker' && (
                                  <button
                                    onClick={() => handleRequestAdditionalMentorship(meeting)}
                                    className="bg-vintage-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-vintage-dark transition-colors flex items-center gap-2"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Request Additional Mentorship
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'upcoming' && (
                <div>
                  <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">
                    Upcoming Mentorship
                  </h3>
                  
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                      <p className="text-vintage-dark/60 mt-4">Loading meetings...</p>
                    </div>
                  ) : confirmedMeetings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-vintage-dark mb-2">No upcoming meetings</h4>
                      <p className="text-vintage-dark/60">
                        Confirmed meetings will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {confirmedMeetings.map((meeting) => {
                        // Format the confirmed date/time
                        const getFormattedDateTime = () => {
                          if (meeting.confirmedDateTime) {
                            const date = new Date(meeting.confirmedDateTime);
                            return {
                              date: date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              }),
                              time: date.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })
                            };
                          }
                          
                          // Fallback to finalSelectedTime if available
                          if (meeting.finalSelectedTime && meeting.finalSelectedTime.length > 0) {
                            const selectedSlot = meeting.finalSelectedTime[0];
                            const date = new Date(selectedSlot.date);
                            const hour = selectedSlot.timeSlots[0];
                            date.setHours(hour, 0, 0, 0);
                            
                            return {
                              date: date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              }),
                              time: date.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })
                            };
                          }
                          
                          // Fallback to proposedTime
                          return {
                            date: 'Date TBD',
                            time: meeting.proposedTime || 'Time TBD'
                          };
                        };

                        const dateTime = getFormattedDateTime();

                        return (
                          <div key={meeting.id} className="bg-white border border-vintage-gold/30 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] overflow-hidden">
                            {/* Thumbnail Header */}
                            <div className="bg-green-50 border-b border-green-200 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Profile Picture */}
                                  <div className="w-12 h-12 bg-vintage-accent rounded-full flex items-center justify-center overflow-hidden">
                                    {(() => {
                                      const photoURL = profile?.role === 'grandpa' ? meeting.apprenticePhotoURL : meeting.grandpaPhotoURL;
                                      const name = profile?.role === 'grandpa' ? meeting.apprenticeName : meeting.grandpaName;
                                      console.log('🖼️ Photo debug:', { 
                                        role: profile?.role, 
                                        photoURL, 
                                        name,
                                        meeting: meeting 
                                      });
                                      
                                      return photoURL ? (
                                        <img 
                                          src={photoURL} 
                                          alt={name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => console.log('❌ Image failed to load:', photoURL)}
                                          onLoad={() => console.log('✅ Image loaded successfully:', photoURL)}
                                        />
                                      ) : (
                                        <User className="w-6 h-6 text-white" />
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-heading font-bold text-vintage-dark">
                                      {meeting.subject}
                                    </h4>
                                    <p className="text-sm text-vintage-dark/70">
                                      with {profile?.role === 'grandpa' ? meeting.apprenticeName : meeting.grandpaName}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Confirmed
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Meeting Details */}
                            <div className="p-6">
                              <div className="grid md:grid-cols-2 gap-6 mb-4">
                                {/* Date & Time */}
                                <div className="bg-vintage-cream p-4 rounded-lg">
                                  <h5 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-vintage-accent" />
                                    Scheduled Time
                                  </h5>
                                  <p className="text-vintage-dark font-medium">{dateTime.date}</p>
                                  <p className="text-vintage-dark text-lg font-bold">{dateTime.time}</p>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-vintage-cream p-4 rounded-lg">
                                  <h5 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-vintage-accent" />
                                    {profile?.role === 'grandpa' ? 'Apprentice' : 'Mentor'}
                                  </h5>
                                  <p className="text-vintage-dark font-medium">
                                    {profile?.role === 'grandpa' ? meeting.apprenticeName : meeting.grandpaName}
                                  </p>
                                </div>
                              </div>

                              {/* Project Description */}
                              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-vintage-accent">
                                <h5 className="font-bold text-vintage-dark mb-2">Project Details</h5>
                                <p className="text-vintage-dark">{meeting.message}</p>
                              </div>

                              {/* Address (only shown after confirmation) */}
                              {meeting.apprenticeAddress && (
                                <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                  <h5 className="font-bold text-vintage-dark mb-2 flex items-center gap-2">
                                    📍 Meeting Location
                                  </h5>
                                  <p className="text-vintage-dark">{meeting.apprenticeAddress}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden">
            <div className="border-b border-vintage-gold/20 bg-vintage-cream">
              <div className="px-6 py-4">
                <h2 className="text-2xl font-heading font-bold text-vintage-dark text-center">
                  How Ask My Grandpa Works
                </h2>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {profile?.role === 'seeker' ? (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        1
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Find a Grandpa</h4>
                      <p className="text-vintage-dark/70">
                        Browse skilled mentors in your area who can guide you through your project.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        2
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Send a Request</h4>
                      <p className="text-vintage-dark/70">
                        Describe your project and when you're available. Your Grandpa will respond with a time to meet.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        3
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Learn & Build</h4>
                      <p className="text-vintage-dark/70">
                        Meet up, learn the skill, and complete your project. Payment is just a cup of coffee!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        1
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Receive Requests</h4>
                      <p className="text-vintage-dark/70">
                        Apprentices in your area will send requests for help with projects that match your skills.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        2
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Accept & Schedule</h4>
                      <p className="text-vintage-dark/70">
                        Review the request and propose a time that works for both of you to meet up.
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-vintage-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
                        3
                      </div>
                      <h4 className="font-heading font-bold text-vintage-dark mb-3 text-lg">Guide & Teach</h4>
                      <p className="text-vintage-dark/70">
                        Share your knowledge, ensure safety, and watch them gain confidence. Enjoy some coffee together!
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Helpful Hints Section for Grandpas */}
              {profile?.role === 'grandpa' && (
                <div className="border-t border-vintage-gold/30 pt-8 mt-8">
                  <h4 className="text-xl font-heading font-bold text-vintage-dark mb-6 text-center">
                    Helpful Hints for Grandpas
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-vintage-cream p-4 rounded-lg border border-vintage-gold/20">
                      <h5 className="font-bold text-vintage-dark mb-2">🛠️ Remember the Golden Rule</h5>
                      <p className="text-vintage-dark/70 text-sm">
                        The apprentice holds the tools. Your job is to guide, teach, and ensure safety—not to do the work for them.
                      </p>
                    </div>
                    
                    <div className="bg-vintage-cream p-4 rounded-lg border border-vintage-gold/20">
                      <h5 className="font-bold text-vintage-dark mb-2">☕ Keep It Simple</h5>
                      <p className="text-vintage-dark/70 text-sm">
                        No money changes hands. A cup of coffee or tea is the perfect way to say thanks.
                      </p>
                    </div>
                    
                    <div className="bg-vintage-cream p-4 rounded-lg border border-vintage-gold/20">
                      <h5 className="font-bold text-vintage-dark mb-2">🎯 Focus on Learning</h5>
                      <p className="text-vintage-dark/70 text-sm">
                        The goal isn't just to fix the problem—it's to teach a skill they can use forever.
                      </p>
                    </div>
                    
                    <div className="bg-vintage-cream p-4 rounded-lg border border-vintage-gold/20">
                      <h5 className="font-bold text-vintage-dark mb-2">🤝 Build Community</h5>
                      <p className="text-vintage-dark/70 text-sm">
                        You're not just helping with a project—you're connecting with neighbors and passing down wisdom.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Message Detail Modal */}
      <MessageDetailModal
        isOpen={showMessageModal}
        onClose={handleModalClose}
        request={selectedMessage}
        userRole={(profile?.role === 'grandpa' ? 'grandpa' : 'seeker') as 'grandpa' | 'seeker'}
        onUpdate={handleMessageUpdate}
      />
        </main>
      </div>
    </div>
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