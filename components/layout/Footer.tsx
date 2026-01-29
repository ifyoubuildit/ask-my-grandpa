import Link from 'next/link';
import { Glasses, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#e6e2d6] pt-12 pb-8 border-t border-vintage-dark/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/assets/logo.png" 
                alt="Ask My Grandpa Logo" 
                className="w-12 h-12"
              />
              <span className="font-heading font-bold text-xl text-vintage-dark">AskMyGrandpa</span>
            </div>
            <p className="text-sm text-vintage-dark/60">
              Making the world a little wiser, one question at a time.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-vintage-dark mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-vintage-dark/70">
              <li><Link href="/" className="hover:text-vintage-accent">Home</Link></li>
              <li><Link href="/mission" className="hover:text-vintage-accent">Our Mission</Link></li>
              <li><Link href="/register" className="hover:text-vintage-accent">Grandpa Registration</Link></li>
              <li><Link href="/contact" className="hover:text-vintage-accent">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-vintage-dark mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-vintage-dark/70">
              <li><Link href="/privacy" className="hover:text-vintage-accent">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-vintage-accent">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-vintage-dark mb-4">Stay in touch</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/askmygrandpa" target="_blank" rel="noopener noreferrer" className="bg-vintage-dark/5 p-2 rounded-full hover:bg-vintage-dark hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@askmygrandpa" target="_blank" rel="noopener noreferrer" className="bg-vintage-dark/5 p-2 rounded-full hover:bg-vintage-dark hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="tiktok-icon">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="#" className="bg-vintage-dark/5 p-2 rounded-full hover:bg-vintage-dark hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:info@askmygrandpa.com" className="bg-vintage-dark/5 p-2 rounded-full hover:bg-vintage-dark hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-4">
              <a href="mailto:info@askmygrandpa.com" className="text-vintage-dark hover:text-vintage-accent font-bold transition-colors flex items-center gap-2">
                info@askmygrandpa.com
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-vintage-dark/10 pt-8 flex justify-center text-sm text-vintage-dark/50">
          <p>&copy; 2024 AskMyGrandpa.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}