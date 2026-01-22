'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Glasses } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#fdfbf7]/95 backdrop-blur-sm border-b border-vintage-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-24">
          {/* Logo Area */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer mr-12">
            <div className="relative w-12 h-12 flex items-center justify-center bg-vintage-green rounded-full text-white shadow-md">
              <Glasses className="w-8 h-8" />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-vintage-dark hover:text-vintage-accent font-bold text-sm uppercase tracking-widest transition-colors">
              Home
            </Link>
            <Link href="/mission" className="text-vintage-dark hover:text-vintage-accent font-bold text-sm uppercase tracking-widest transition-colors">
              Our Mission
            </Link>
            <Link href="/register" className="text-vintage-dark hover:text-vintage-accent font-bold text-sm uppercase tracking-widest transition-colors">
              Grandpa Registration
            </Link>
          </div>

          {/* Action Button (Desktop) */}
          <div className="hidden md:block ml-auto">
            <Link href="/#ask-input" className="bg-vintage-dark text-[#fdfbf7] px-6 py-3 rounded-full font-bold hover:bg-vintage-accent transition-colors shadow-md text-sm tracking-wide">
              Ask a Question
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center ml-auto">
            <button onClick={toggleMobileMenu} className="text-vintage-dark p-2">
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#f3f0e6] border-b border-vintage-gold/30">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/" className="block px-3 py-2 text-vintage-dark font-bold text-lg">
              Home
            </Link>
            <Link href="/mission" className="block px-3 py-2 text-vintage-dark font-bold text-lg">
              Our Mission
            </Link>
            <Link href="/register" className="block px-3 py-2 text-vintage-dark font-bold text-lg">
              Grandpa Registration
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}