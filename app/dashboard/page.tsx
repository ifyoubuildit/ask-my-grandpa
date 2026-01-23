'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logOut } from '@/lib/auth';
import { User, Settings, Search, MessageCircle, LogOut, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'previous' | 'upcoming'>('upcoming');

  // Show loading state
  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
      </main>
    );
  }

  // Redirect if not authenticated
  if (!user || !profile) {
    router.push('/login');
    return null;
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
              Welcome, {profile.displayName}!
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-vintage-dark">
                {profile.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="text-vintage-dark font-bold hover:text-vintage-accent transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            {/* Profile Management */}
            <Link href={profile.role === 'grandpa' ? '/register' : '/profile'} className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-accent/20 rounded-full flex items-center justify-center group-hover:bg-vintage-accent/30 transition-colors">
                  <User className="w-6 h-6 text-vintage-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    Update Profile
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    Update your skills and info
                  </p>
                </div>
              </div>
            </Link>

            {/* Messages (Future Feature) */}
            <div className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-dark/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-vintage-dark" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">Messages</h3>
                  <p className="text-sm text-vintage-dark/70">Coming soon!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mentorship Section */}
          <div className="bg-white rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30 overflow-hidden">
            
            {/* Tab Navigation - Both Always Visible */}
            <div className="border-b border-vintage-gold/20">
              <div className="grid grid-cols-2">
                <button
                  onClick={() => setActiveTab('previous')}
                  className={`px-6 py-4 font-heading font-bold text-lg transition-colors border-r border-vintage-gold/20 ${
                    activeTab === 'previous'
                      ? 'bg-vintage-accent text-white'
                      : 'text-vintage-dark hover:bg-vintage-cream'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Previous Mentorship
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-4 font-heading font-bold text-lg transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-vintage-accent text-white'
                      : 'text-vintage-dark hover:bg-vintage-cream'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Mentorship
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content - Changes Based on Active Tab */}
            <div className="p-8">
              {activeTab === 'previous' ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold text-vintage-dark mb-2">
                    No Previous Mentorships
                  </h3>
                  <p className="text-vintage-dark/70 max-w-md mx-auto">
                    {profile.role === 'grandpa' 
                      ? "Your completed mentorship sessions will be listed here for your reference."
                      : "Your completed learning sessions with Grandpas will appear here."
                    }
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-vintage-dark/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-heading font-bold text-vintage-dark mb-2">
                    No Upcoming Mentorships
                  </h3>
                  <p className="text-vintage-dark/70 mb-6 max-w-md mx-auto">
                    {profile.role === 'grandpa' 
                      ? "When someone reaches out for your help, their sessions will appear here."
                      : "Your scheduled mentorship sessions will appear here once you connect with a Grandpa."
                    }
                  </p>
                  {profile.role === 'seeker' && (
                    <Link 
                      href="/search"
                      className="inline-flex items-center gap-2 bg-vintage-green text-white px-6 py-3 rounded-full font-bold hover:bg-vintage-dark transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Find a Grandpa
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Role-specific Tips */}
          <div className="mt-12 bg-vintage-cream p-8 rounded-2xl border border-vintage-gold/30">
            <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">
              {profile.role === 'grandpa' ? 'Grandpa Resources' : 'How to Get Help'}
            </h2>
            
            {profile.role === 'grandpa' ? (
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
                  <div className="w-16 h-16 bg-vintage-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="font-bold text-vintage-dark mb-2">Connect</h3>
                  <p className="text-sm text-vintage-dark/70">Reach out and schedule a time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-vintage-dark rounded-full flex items-center justify-center mx-auto mb-3">
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