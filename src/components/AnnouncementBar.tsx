'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  'Free Express Shipping Across India & US | 925 Hallmarked Authenticity',
  'Complimentary 6-Month Anti-Tarnish Plating Warranty on all Jewelry',
  'Special Launch: Use Code FIRSTNIHI for Flat 10% Off',
  'Bespoke Laser Engraving & Luxury Velvet Box on Every Order',
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <aside aria-label="Promotional announcements" className="bg-[#1A1818] text-white text-xs font-medium py-2 px-4 select-none relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left link helper */}
        <div className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[11px] tracking-wide uppercase">Certified 925 Fine Jewelry</span>
        </div>

        {/* Center Rotating Message */}
        <div className="flex-1 flex items-center justify-center gap-2 px-2 text-center">
          <button
            onClick={handlePrev}
            aria-label="Previous announcement"
            className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="h-5 flex items-center justify-center overflow-hidden min-w-[280px] sm:min-w-[400px]">
            <p className="transition-all duration-500 transform animate-fadeIn text-[11px] sm:text-xs tracking-wider text-rose-50 font-normal">
              {ANNOUNCEMENTS[currentIndex]}
            </p>
          </div>

          <button
            onClick={handleNext}
            aria-label="Next announcement"
            className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Quick Links */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-white/75">
          <Link href="/about" className="hover:text-white transition-colors">
            Our Craft
          </Link>
          <span className="text-white/30">•</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Customer Care
          </Link>
        </div>
      </div>
    </aside>
  );
}
