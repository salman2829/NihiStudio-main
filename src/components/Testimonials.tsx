'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/mock-data';

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActiveIdx((prev) => (prev + 1) % TESTIMONIALS.length);

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold text-[#E9708A] uppercase tracking-[0.2em] mb-1">
            Loved by 50,000+ Women
          </p>
          <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-900">
            Real Stories, Real Sparkle
          </h2>
        </div>

        {/* Testimonials Desktop Grid / Mobile Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-[#FAF7F5] rounded-3xl p-6 sm:p-10 border border-[#EFE9E6] shadow-sm relative">
            <Quote className="absolute top-6 right-8 w-12 h-12 text-[#E9708A]/15 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Reviewer Photo */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-3 border-white shadow-md">
                <Image
                  src={TESTIMONIALS[activeIdx].image}
                  alt={TESTIMONIALS[activeIdx].author}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                {/* Stars */}
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-gray-800 italic font-serif leading-relaxed">
                  &ldquo;{TESTIMONIALS[activeIdx].quote}&rdquo;
                </p>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 font-semibold text-sm text-gray-900">
                    <span>{TESTIMONIALS[activeIdx].author}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Verified Buyer
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{TESTIMONIALS[activeIdx].role}</p>
                  <p className="text-xs text-[#E9708A] font-medium mt-1">
                    Purchased: {TESTIMONIALS[activeIdx].productPurchased}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-200/60">
              <button
                onClick={prev}
                aria-label="Previous review"
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-700 shadow-xs transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIdx ? 'w-6 bg-[#E9708A]' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next review"
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-700 shadow-xs transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
