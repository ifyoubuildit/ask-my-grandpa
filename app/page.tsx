'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageCircleQuestion, Users, CalendarCheck, Coffee, Wrench, GraduationCap, Droplets, Trash2, Utensils, PaintRoller, Quote, User } from 'lucide-react';

export default function Home() {
  const [askInput, setAskInput] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const router = useRouter();

  const askGrandpa = () => {
    const query = askInput.trim();
    
    if (query === "") {
      alert("Speak up, sonny! I can't hear you if you don't type anything.");
      return;
    }

    // Redirect to search page with the query parameter
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      askGrandpa();
    }
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Wisdom <span className="text-[#9A3412]">On Demand</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-vintage-dark/80 font-body">
            From fixing a leaky faucet to patching and painting that wall.
          </p>
          
          <p className="mt-8 text-xl md:text-3xl font-heading font-extrabold text-vintage-dark tracking-tight">
            Just Ask Grandpa.
          </p>

          {/* Search Bar */}
          <div className="mt-12 max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-vintage-green to-vintage-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-lg border-2 border-vintage-dark/10 focus-within:border-vintage-accent transition-colors p-2">
              <div className="pl-4 text-vintage-dark/40">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                id="ask-input"
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="block w-full border-0 py-3 pl-4 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-lg font-body bg-transparent outline-none" 
                placeholder="How can I help"
              />
              <button 
                onClick={askGrandpa}
                className="flex-shrink-0 bg-vintage-green text-white px-6 py-3 rounded-full font-bold hover:bg-vintage-dark transition-colors"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 -ml-24 mt-12 w-64 h-64 bg-vintage-gold/10 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 -mr-24 mb-12 w-80 h-80 bg-vintage-green/10 rounded-full blur-3xl mix-blend-multiply"></div>
      </header>

      {/* How it Works Section */}
      <section className="py-12 border-b border-vintage-gold/20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-vintage-dark">How it Works</h2>
            <div className="w-24 h-1 bg-vintage-accent mx-auto mt-3 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-vintage-gold/30 -z-10 border-t-2 border-dashed border-vintage-gold/30"></div>

            {/* Step 1 */}
            <div className="group">
              <div className="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center border-4 border-vintage-gold/20 mx-auto mb-4 shadow-sm group-hover:border-vintage-accent transition-colors duration-300">
                <MessageCircleQuestion className="w-10 h-10 text-vintage-dark group-hover:text-vintage-accent transition-colors" />
              </div>
              <h3 className="text-xl font-heading font-bold text-vintage-dark mb-3">Ask a Question</h3>
              <p className="text-vintage-dark/70 font-body px-4">Type in what you need help with.</p>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center border-4 border-vintage-gold/20 mx-auto mb-4 shadow-sm group-hover:border-vintage-green transition-colors duration-300">
                <Users className="w-10 h-10 text-vintage-dark group-hover:text-vintage-green transition-colors" />
              </div>
              <h3 className="text-xl font-heading font-bold text-vintage-dark mb-3">Match a Grandpa</h3>
              <p className="text-vintage-dark/70 font-body px-4">Match with a Grandpa in your area that has that skill-set.</p>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center border-4 border-vintage-gold/20 mx-auto mb-4 shadow-sm group-hover:border-[#9A3412] transition-colors duration-300">
                <CalendarCheck className="w-10 h-10 text-vintage-dark group-hover:text-[#9A3412] transition-colors" />
              </div>
              <h3 className="text-xl font-heading font-bold text-vintage-dark mb-3">Set up a Time</h3>
              <p className="text-vintage-dark/70 font-body px-4">Set up a day and time that works for both your schedules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The House Rules Section */}
      <section className="py-16 bg-vintage-cream border-b border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-vintage-dark">The House Rules</h2>
            <div className="w-24 h-1 bg-vintage-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Rule 1 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all border border-vintage-gold/20 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coffee className="w-24 h-24 text-vintage-dark" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">Completely Free</h3>
                <p className="text-vintage-dark/80 font-body leading-relaxed">
                  No cash changes hands here. The only payment required is a hot cup of tea or coffee for your mentor once the job is done.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all border border-vintage-gold/20 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wrench className="w-24 h-24 text-vintage-dark" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">You Do The Work</h3>
                <p className="text-vintage-dark/80 font-body leading-relaxed">
                  Grandpa is here to guide, instruct, and supervise. But you hold the tools. That's the only way the knowledge sticks.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] hover:shadow-[6px_6px_0px_rgba(74,64,54,0.15)] hover:-translate-y-0.5 transition-all border border-vintage-gold/20 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <GraduationCap className="w-24 h-24 text-vintage-dark" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-heading font-bold text-vintage-dark mb-4">Learn for Life</h3>
                <p className="text-vintage-dark/80 font-body leading-relaxed">
                  Our goal isn't just a quick fix. It's to pass down skills that you'll carry forever (and maybe pass down yourself one day).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white border-y border-vintage-gold/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-vintage-dark">Common Topics</h2>
            <div className="w-24 h-1 bg-vintage-accent mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Category 1 */}
            <div 
              className="group cursor-pointer" 
              onClick={() => router.push('/search?q=Fix%20my%20leaky%20sink')}
            >
              <div className="aspect-square bg-vintage-cream rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-vintage-gold transition-colors duration-300 relative overflow-hidden">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Droplets className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-heading font-bold text-lg text-vintage-dark text-center px-2">Fix my leaky sink</h3>
                <p className="text-sm text-center px-4 text-vintage-dark/60 mt-1">Drip, drip, no more</p>
              </div>
            </div>

            {/* Category 2 */}
            <div 
              className="group cursor-pointer" 
              onClick={() => router.push('/search?q=Fix%20My%20Garburator')}
            >
              <div className="aspect-square bg-vintage-cream rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-vintage-gold transition-colors duration-300 relative overflow-hidden">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trash2 className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="font-heading font-bold text-lg text-vintage-dark text-center px-2">Fix My Garburator</h3>
                <p className="text-sm text-center px-4 text-vintage-dark/60 mt-1">Unjam it safely</p>
              </div>
            </div>

            {/* Category 3 */}
            <div 
              className="group cursor-pointer" 
              onClick={() => router.push('/search?q=Help%20me%20sharpen%20my%20knives')}
            >
              <div className="aspect-square bg-vintage-cream rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-vintage-gold transition-colors duration-300 relative overflow-hidden">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-8 h-8 text-vintage-accent" />
                </div>
                <h3 className="font-heading font-bold text-lg text-vintage-dark text-center px-2">Help me sharpen my knives</h3>
                <p className="text-sm text-center px-4 text-vintage-dark/60 mt-1">Razor sharp edges</p>
              </div>
            </div>

            {/* Category 4 */}
            <div 
              className="group cursor-pointer" 
              onClick={() => router.push('/search?q=Patch%20and%20paint%20my%20wall')}
            >
              <div className="aspect-square bg-vintage-cream rounded-2xl flex flex-col items-center justify-center border-2 border-transparent group-hover:border-vintage-gold transition-colors duration-300 relative overflow-hidden">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PaintRoller className="w-8 h-8 text-vintage-green" />
                </div>
                <h3 className="font-heading font-bold text-lg text-vintage-dark text-center px-2">Patch and paint my wall</h3>
                <p className="text-sm text-center px-4 text-vintage-dark/60 mt-1">Seamless finish</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-10 bg-vintage-cream border-t border-vintage-gold/20 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 p-8 opacity-5">
          <Quote className="w-32 h-32 text-vintage-dark" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-vintage-dark">Word on the Street</h2>
            <div className="w-24 h-1 bg-vintage-accent mx-auto mt-2 rounded-full"></div>
            <p className="mt-2 text-lg text-vintage-dark/70 font-body uppercase tracking-widest font-bold">Testimonials</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 relative">
              <div className="text-vintage-gold/30 text-6xl font-heading absolute top-2 left-4">"</div>
              <p className="text-vintage-dark/80 font-body italic mb-6 relative z-10 pt-4">
                I was about to call a plumber for $200. Grandpa Mack walked me through it in 10 minutes. Cost me a cup of Earl Grey.
              </p>
              <div className="flex items-center gap-4 border-t border-vintage-dark/5 pt-4">
                <div className="w-10 h-10 bg-[#7c2d12] rounded-full flex items-center justify-center font-bold text-white shadow-sm">S</div>
                <div>
                  <h4 className="font-bold text-vintage-dark text-sm">Sarah Jenkins</h4>
                  <p className="text-xs text-vintage-dark/60">Portland, OR</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 relative">
              <div className="text-vintage-gold/30 text-6xl font-heading absolute top-2 left-4">"</div>
              <p className="text-vintage-dark/80 font-body italic mb-6 relative z-10 pt-4">
                My dad passed away when I was young, so I never learned how to install a ceiling fan. Grandpa Bill guided me through the wiring. I'll never forget that.
              </p>
              <div className="flex items-center gap-4 border-t border-vintage-dark/5 pt-4">
                <div className="w-10 h-10 bg-vintage-green rounded-full flex items-center justify-center font-bold text-white shadow-sm">M</div>
                <div>
                  <h4 className="font-bold text-vintage-dark text-sm">Mike Ross</h4>
                  <p className="text-xs text-vintage-dark/60">Austin, TX</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 relative">
              <div className="text-vintage-gold/30 text-6xl font-heading absolute top-2 left-4">"</div>
              <p className="text-vintage-dark/80 font-body italic mb-6 relative z-10 pt-4">
                It's not just about the repairs. It's the stories. I matched with Grandpa Joe to fix a fence, and I made a lifelong friend.
              </p>
              <div className="flex items-center gap-4 border-t border-vintage-dark/5 pt-4">
                <div className="w-10 h-10 bg-[#9A3412] rounded-full flex items-center justify-center font-bold text-white shadow-sm">J</div>
                <div>
                  <h4 className="font-bold text-vintage-dark text-sm">Jessica Wu</h4>
                  <p className="text-xs text-vintage-dark/60">Chicago, IL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}