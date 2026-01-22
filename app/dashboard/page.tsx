'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logOut } from '@/lib/auth';
import { User, Settings, Search, MessageCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

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
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-2">
                Welcome back, {profile.displayName}!
              </h1>
              <p className="text-xl text-vintage-dark/80 font-body capitalize">
                {profile.role} Dashboard
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-vintage-dark text-white px-4 py-2 rounded-lg hover:bg-vintage-accent transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            
            {/* Search for Help */}
            <Link href="/search" className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-green/20 rounded-full flex items-center justify-center group-hover:bg-vintage-green/30 transition-colors">
                  <Search className="w-6 h-6 text-vintage-green" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">Find a Grandpa</h3>
                  <p className="text-sm text-vintage-dark/70">Search for help with your project</p>
                </div>
              </div>
            </Link>

            {/* Profile Management */}
            <Link href={profile.role === 'grandpa' ? '/register' : '/profile'} className="bg-white p-6 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-vintage-accent/20 rounded-full flex items-center justify-center group-hover:bg-vintage-accent/30 transition-colors">
                  <User className="w-6 h-6 text-vintage-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-vintage-dark">
                    {profile.role === 'grandpa' ? 'Update Profile' : 'My Profile'}
                  </h3>
                  <p className="text-sm text-vintage-dark/70">
                    {profile.role === 'grandpa' ? 'Update your skills and info' : 'Manage your account'}
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

          {/* Role-specific content */}
          {profile.role === 'grandpa' ? (
            <div className="bg-vintage-cream p-8 rounded-2xl border border-vintage-gold/30">
              <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">
                Grandpa Resources
              </h2>
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
            </div>
          ) : (
            <div className="bg-vintage-cream p-8 rounded-2xl border border-vintage-gold/30">
              <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">
                How to Get Help
              </h2>
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
            </div>
          )}
        </div>
      </section>
    </main>
  );
}