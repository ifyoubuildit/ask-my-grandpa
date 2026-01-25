'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { logOut } from '@/lib/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Search, MessageCircle, Calendar, Clock, Check, X, Mail, MailOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import MessageDetailModal from '@/components/MessageDetailModal';

function DashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'messages' | 'upcoming'>('messages');
  const [requests, setRequests] = useState<any[]>([]);
  const [confirmedMeetings, setConfirmedMeetings] = useState<any[]>([]);
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
          // Load all requests sent to this grandpa
          const requestsQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRequests(requestsData);
          
          // Load confirmed meetings
          const confirmedQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid),
            where("status", "==", "confirmed")
          );
          const confirmedSnapshot = await getDocs(confirmedQuery);
          const confirmedData = confirmedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfirmedMeetings(confirmedData);
        } else {
          // Load all requests sent by this apprentice
          const requestsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRequests(requestsData);
          
          // Load confirmed meetings
          const confirmedQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid),
            where("status", "==", "confirmed")
          );
          const confirmedSnapshot = await getDocs(confirmedQuery);
          const confirmedData = confirmedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfirmedMeetings(confirmedData);
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
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRequests(requestsData);
          
          const confirmedQuery = query(
            collection(db, "requests"), 
            where("grandpaId", "==", user.uid),
            where("status", "==", "confirmed")
          );
          const confirmedSnapshot = await getDocs(confirmedQuery);
          const confirmedData = confirmedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfirmedMeetings(confirmedData);
        } else {
          const requestsQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          const requestsData = requestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRequests(requestsData);
          
          const confirmedQuery = query(
            collection(db, "requests"), 
            where("apprenticeId", "==", user.uid),
            where("status", "==", "confirmed")
          );
          const confirmedSnapshot = await getDocs(confirmedQuery);
          const confirmedData = confirmedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setConfirmedMeetings(confirmedData);
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
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Request sent successfully!
        </div>
      )}

      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark">
                Welcome, {profile?.displayName || 'User'}!
              </h1>
              <p className="text-vintage-dark/70 mt-2">
                {profile?.role === 'grandpa' ? 'Help apprentices learn new skills' : 'Connect with experienced mentors'}
              </p>
            </div>
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
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
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
                  onClick={() => setActiveTab('messages')}
                  className={`px-6 py-4 font-heading font-bold text-lg transition-colors border-r border-vintage-gold/20 ${
                    activeTab === 'messages' 
                      ? 'bg-vintage-cream text-vintage-accent' 
                      : 'text-vintage-dark hover:bg-vintage-cream/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Previous {profile?.role === 'grandpa' ? 'Mentorship' : 'Apprentice'}</span>
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
                    <span>Upcoming {profile?.role === 'grandpa' ? 'Mentorship' : 'Apprentice'}</span>
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
              {activeTab === 'messages' && (
                <div>
                  <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">
                    Previous {profile?.role === 'grandpa' ? 'Mentorship' : 'Apprentice'}
                  </h3>
                  
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent mx-auto"></div>
                      <p className="text-vintage-dark/60 mt-4">Loading previous...</p>
                    </div>
                  ) : requests.filter(r => r.status !== 'confirmed').length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-vintage-dark mb-2">No previous {profile?.role === 'grandpa' ? 'mentorship' : 'apprentice'} yet</h4>
                      <p className="text-vintage-dark/60">
                        {profile?.role === 'grandpa' 
                          ? 'Previous mentorship interactions will appear here.'
                          : 'Your previous apprentice interactions will appear here.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.filter(r => r.status !== 'confirmed').map((request) => (
                        <div 
                          key={request.id}
                          onClick={() => handleMessageClick(request)}
                          className="border border-vintage-gold/20 rounded-lg p-4 hover:bg-vintage-cream/30 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex-shrink-0">
                                <MessageCircle className="w-6 h-6 text-vintage-dark/40" />
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
              )}

              {activeTab === 'upcoming' && (
                <div>
                  <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">
                    Upcoming {profile?.role === 'grandpa' ? 'Mentorship' : 'Apprentice'}
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
                      {confirmedMeetings.map((meeting) => (
                        <div key={meeting.id} className="bg-green-50 border border-green-200 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-vintage-dark mb-2">
                                {meeting.subject}
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm font-medium text-vintage-dark">
                                    {profile?.role === 'grandpa' ? 'Apprentice' : 'Mentor'}:
                                  </p>
                                  <p className="text-vintage-dark">
                                    {profile?.role === 'grandpa' ? meeting.apprenticeName : meeting.grandpaName}
                                  </p>
                                  <p className="text-sm text-vintage-dark/60">
                                    {profile?.role === 'grandpa' ? meeting.apprenticeEmail : meeting.grandpaEmail}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-vintage-dark">Scheduled Time:</p>
                                  <p className="text-vintage-dark">{meeting.proposedTime}</p>
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded border">
                                <p className="text-sm text-vintage-dark">
                                  <strong>Project:</strong> {meeting.message}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4">
                              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Confirmed
                              </span>
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