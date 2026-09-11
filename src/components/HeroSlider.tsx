'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, Truck, Gift, Award } from 'lucide-react';
import { HERO_SLIDES } from '@/lib/mock-data';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div>
      {/* Main Hero Slider */}
      <section className="relative w-full h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-[#1A1818]">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Cinematic Gradient */}
            <div className="relative w-full h-full">
              <Image
                src={slide.bgImage}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center scale-100 transition-transform duration-[7000ms] ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
                <div className="max-w-xl lg:max-w-2xl space-y-5 text-white animate-fadeIn">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#FCF8ED] border border-white/25 text-[11px] font-bold uppercase tracking-[0.2em]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {slide.tag}
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-[1.15] drop-shadow-md">
                    {slide.title}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-gray-200 font-light leading-relaxed max-w-lg">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#E9708A] hover:bg-[#C94D6A] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full transition-all shadow-xl hover:shadow-rose-900/40 group hover:scale-[1.02]"
                    >
                      {slide.ctaText}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/shop"
                      className="inline-flex items-center px-7 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-full transition-all border border-white/30"
                    >
                      Explore All Collections
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center border border-white/20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md transition-all hidden sm:flex items-center justify-center border border-white/20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? 'w-8 h-2 bg-[#E9708A]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Luxury Trust & Hallmark Features Bar */}
      <div className="bg-[#FAF7F5] border-b border-[#EFE9E6] py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">BIS 925 Hallmarked</p>
                <p className="text-[11px] text-gray-500">100% Certified Pure Silver</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">6-Month Warranty</p>
                <p className="text-[11px] text-gray-500">Anti-Tarnish & Plating Coverage</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Express Delivery</p>
                <p className="text-[11px] text-gray-500">India & US Fast Shipping</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 p-2">
              <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-[#D4AF37] flex items-center justify-center shrink-0 shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Velvet Gift Box</p>
                <p className="text-[11px] text-gray-500">Complimentary Gift Packaging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
