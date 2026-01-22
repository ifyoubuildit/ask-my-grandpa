import Link from 'next/link';
import { MonitorOff, HeartHandshake } from 'lucide-react';

export default function MissionPage() {
  return (
    <main className="flex-1">
      {/* Header Section */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Restoring the <span className="text-[#9A3412]">Village</span>
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            We are building a bridge between generations one project at a time.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <section className="pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Mission Statement */}
          <div className="text-center bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/20 relative overflow-hidden max-w-3xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vintage-green to-vintage-accent"></div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#9A3412] mb-6">Mission Statement</h2>
            <p className="text-lg md:text-xl text-vintage-dark/90 font-body leading-relaxed">
              Replacing algorithms with in-person mentorship. We exist to build an intergenerational community that empowers our elders to share their legacy and equips the next generation with tangible skills. We believe the best way to learn is not by watching, but by doing it together!
            </p>
          </div>

          {/* Two Column Grid for Key Points */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: The Disconnect */}
            <div className="bg-white p-8 rounded-xl border border-vintage-gold/20 shadow-[4px_4px_0px_rgba(74,64,54,0.1)] flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-vintage-cream rounded-full flex items-center justify-center border-2 border-vintage-gold/30 mb-6">
                <MonitorOff className="w-10 h-10 text-vintage-dark/50" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">More Than Just Videos</h2>
              <p className="text-base text-vintage-dark/80 leading-relaxed font-body">
                We live in an era of instant answers. If a pipe leaks, you watch a video. But a video can't watch you back. It can't tell you that you're holding the wrench wrong, and it certainly can't tell you a joke about the blizzard of '78 while you work. We believe the best way to learn is hands-on, guided by patience, not a pause button.
              </p>
            </div>

            {/* Card 2: Purpose & Connection */}
            <div className="bg-white p-8 rounded-xl border border-vintage-gold/20 shadow-[4px_4px_0px_rgba(74,64,54,0.1)] flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-vintage-cream rounded-full flex items-center justify-center border-2 border-vintage-gold/30 mb-6">
                <HeartHandshake className="w-10 h-10 text-[#9A3412]" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-vintage-dark mb-4">Purpose & Connection</h2>
              <p className="text-base text-vintage-dark/80 leading-relaxed font-body">
                Retirement is a new chapter for meaningful engagement. We provide a platform for the older generation to stay connected to the community by sharing their invaluable expertise. It proves a simple truth: <strong>Your wisdom is always in demand.</strong> Every project is an opportunity to teach, to connect, and to ensure that a lifetime of skill is passed forward.
              </p>
            </div>
          </div>

          {/* Section 3: The Community */}
          <div className="text-center bg-vintage-cream p-10 rounded-2xl border border-vintage-gold/30 shadow-sm max-w-3xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-vintage-dark mb-4">The Intergenerational Community</h2>
            <p className="text-lg text-vintage-dark/80 leading-relaxed mb-8">
              We are creating a space where knowledge is passed down, stories are swapped, and the gap between generations is bridged by a shared project. It takes a village to raise a child, but it takes a community to sustain the village.
            </p>
            <Link href="/register" className="inline-block bg-vintage-green text-white px-8 py-4 rounded-full font-bold hover:bg-vintage-dark transition-colors shadow-lg">
              Join Our Community
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}