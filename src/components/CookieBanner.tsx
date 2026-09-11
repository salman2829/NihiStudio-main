'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or acknowledged privacy notice
    const hasAccepted = localStorage.getItem('nihi_dpdp_consent');
    if (!hasAccepted) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nihi_dpdp_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and cookie consent notice"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slideUp"
    >
      <div className="bg-[#1A1818]/95 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Data Privacy & DPDP Act Notice
            </p>
          </div>
          <button
            onClick={handleAccept}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close consent notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-gray-300 leading-relaxed">
          Nihi Studio values your privacy. In accordance with the <strong>DPDP Act 2023</strong>, we process your personal data strictly for jewelry orders, certified BIS hallmarking, and insured courier delivery.
        </p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href="/privacy"
            className="text-[11px] text-[#E9708A] hover:underline font-medium"
          >
            Read Privacy Notice →
          </Link>

          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-[#E9708A] hover:bg-[#C94D6A] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </aside>
  );
}
