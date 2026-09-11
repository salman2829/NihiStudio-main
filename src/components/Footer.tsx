'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { setIsSizeModalOpen } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#141212] text-white pt-16 pb-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Banner */}
        <div className="bg-gradient-to-r from-[#221C1D] via-[#2D1F23] to-[#221C1D] rounded-3xl p-6 sm:p-10 border border-neutral-800 mb-14">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Exclusive Privileges
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white">
              Unlock 10% Off Your First Nihi Studio Piece
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
              Subscribe to receive early access to new limited drops, secret festive sales, and personal styling tips.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E9708A]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#E9708A] hover:bg-[#C94D6A] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" /> Subscribed
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-neutral-800 text-xs text-gray-400">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                NIHI STUDIO
              </span>
              <span className="text-[9px] font-semibold tracking-[0.25em] text-[#D4AF37] uppercase block -mt-1">
                Everyday Fine Jewelry
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Nihi Studio crafts timeless, accessible fine jewelry in pure 925 sterling silver and thick 18K gold vermeil, engineered with anti-tarnish e-coatings for everyday radiance.
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>BIS Certified • Hallmarked Purity Guarantee</span>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=Rings" className="hover:text-white transition-colors">Solitaire & Bands</Link></li>
              <li><Link href="/shop?category=Earrings" className="hover:text-white transition-colors">Huggies & Drops</Link></li>
              <li><Link href="/shop?category=Necklaces" className="hover:text-white transition-colors">Pendants & Chokers</Link></li>
              <li><Link href="/shop?category=Bracelets" className="hover:text-white transition-colors">Tennis Bracelets</Link></li>
              <li><Link href="/shop?category=Men's" className="hover:text-white transition-colors">Men&apos;s Silver Bands</Link></li>
              <li><Link href="/shop?category=Gifts" className="hover:text-white transition-colors">Velvet Gift Sets</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Easy 30-Day Returns</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">6-Month Warranty Claim</Link></li>
              <li>
                <button
                  onClick={() => setIsSizeModalOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Find My Ring Size
                </button>
              </li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Jewelry Care Guide</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Privacy</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy (DPDP)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy#grievance" className="hover:text-white transition-colors">Grievance Redressal</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">BIS 925 Certification</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <p>© 2026 Nihi Studio Fine Jewelry Pvt. Ltd. All rights reserved.</p>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <Link href="/privacy" className="hover:text-gray-400">DPDP Act 2023 Compliant</Link>
            <span className="hidden sm:inline text-neutral-700">•</span>
            <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px]">
            <span>Razorpay • UPI • Visa • Mastercard • NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
