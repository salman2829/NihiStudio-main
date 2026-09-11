import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';
import TrustBadges from '@/components/TrustBadges';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative py-20 sm:py-28 bg-[#FAF7F5] border-b border-[#EFE9E6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Our Story & Heritage
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium text-gray-900 leading-tight">
            Fine Jewelry Crafted for Everyday Radiance
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            At Nihi Studio, we believe luxury should not be locked in a bank locker for special occasions. We design fine jewelry in certified 925 silver and 18K gold vermeil meant to be lived in, showered in, and loved daily.
          </p>
        </div>
      </section>

      {/* Brand Craftsmanship Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 sm:h-[480px] rounded-3xl overflow-hidden shadow-lg border border-[#EFE9E6]">
              <Image
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop"
                alt="Jewelry Master Goldsmith Handcrafting"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Master Goldsmiths
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-900 leading-snug">
                Where Artisanal Heritage Meets Modern Metallurgy
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                Every piece begins as an authentic hand-carved wax model before being cast in pure, recycled 925 sterling silver. We then coat every design with a proprietary 3-micron thick layer of rhodium and 18K gold, sealed by microscopic ceramic e-coatings that prevent oxidation and tarnishing.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">100% BIS Hallmarked Purity</h3>
                    <p className="text-xs text-gray-500">Certified by the Bureau of Indian Standards with government stamped laser hallmarks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FCF8ED] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Ethical Lab-Grown Diamonds</h3>
                    <p className="text-xs text-gray-500">Conflict-free, carbon-conscious gemstones with identical physical properties to mined diamonds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Hypoallergenic & Skin Safe</h3>
                    <p className="text-xs text-gray-500">100% nickel-free and lead-free compositions engineered specifically for sensitive skin.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-all shadow-md"
                >
                  Explore Collections <ArrowRight className="w-4 h-4 text-[#E9708A]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />
    </div>
  );
}
