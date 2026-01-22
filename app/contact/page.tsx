import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Contact Us
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </header>

      {/* Contact Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
            <h2 className="text-3xl font-heading font-bold text-vintage-dark mb-8 text-center">Send us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-vintage-dark font-heading font-bold mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-vintage-dark focus:border-vintage-accent focus:outline-none" 
                    placeholder="Your name" 
                  />
                </div>
                <div>
                  <label className="block text-vintage-dark font-heading font-bold mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-vintage-dark focus:border-vintage-accent focus:outline-none" 
                    placeholder="your@email.com" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-vintage-dark font-heading font-bold mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-vintage-dark focus:border-vintage-accent focus:outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-vintage-dark font-heading font-bold mb-2">Message</label>
                <textarea 
                  rows={6} 
                  className="w-full bg-vintage-cream border-2 border-vintage-gold/30 rounded-lg p-4 text-vintage-dark focus:border-vintage-accent focus:outline-none" 
                  placeholder="How can we help..."
                />
              </div>
              
              <div className="text-center">
                <button 
                  type="submit" 
                  className="bg-vintage-green text-white px-8 py-4 rounded-full font-bold hover:bg-vintage-dark transition-colors shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}