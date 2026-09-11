'use client';

import React from 'react';
import { ShieldCheck, Sparkles, RotateCcw, Truck } from 'lucide-react';

const BADGES = [
  {
    icon: ShieldCheck,
    title: 'BIS Hallmarked 925 Pure Silver',
    description: 'Every single piece is stamped and laboratory-certified for 92.5% silver purity.',
  },
  {
    icon: Sparkles,
    title: '6-Month Anti-Tarnish Warranty',
    description: 'Free re-plating & lifetime polishing support for timeless sparkle.',
  },
  {
    icon: RotateCcw,
    title: '30-Day Hassle-Free Returns',
    description: 'Complimentary reverse doorstep pickup with 100% money-back guarantee.',
  },
  {
    icon: Truck,
    title: 'Free Insured Express Delivery',
    description: 'Dispatched in discreet, tamper-evident security vault gift packaging.',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-12 bg-[#FAF7F5] border-y border-[#EFE9E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#EFE9E6] shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
