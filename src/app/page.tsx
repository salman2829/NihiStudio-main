import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Gift, ShieldCheck } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import CategoryStrip from '@/components/CategoryStrip';
import ProductGrid from '@/components/ProductGrid';
import ShopByMetal from '@/components/ShopByMetal';
import TrustBadges from '@/components/TrustBadges';
import Testimonials from '@/components/Testimonials';
import InstagramReel from '@/components/InstagramReel';
import { getProducts } from '@/lib/woocommerce';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-0">
      {/* Hero Autoplay Slider */}
      <HeroSlider />

      {/* Circular Category Strip */}
      <CategoryStrip />

      {/* Bestsellers & New Arrivals Grid */}
      <ProductGrid products={products} />

      {/* Shop By Metal / Gemstone */}
      <ShopByMetal />

      {/* Luxury Gifting Feature Banner */}
      <section className="py-12 sm:py-16 bg-[#FDF0F3] border-y border-[#F5D5DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-[#EFE9E6] overflow-hidden relative">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F5] text-[#E9708A] text-xs font-semibold uppercase tracking-widest border border-rose-200">
                <Gift className="w-3.5 h-3.5 text-[#D4AF37]" /> The Art of Gifting
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-900 leading-tight">
                Complimentary Wax-Sealed Letter & Luxury Velvet Box
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Turn your gift into an unforgettable heirloom. Every personalized piece arrives in a plush emerald or blush velvet box, accompanied by a custom laser engraving and your personalized message sealed in royal metallic wax.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Free Laser Engraving
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-[#E9708A]" /> Authenticity Certificate Included
                </div>
              </div>
              <div className="pt-3">
                <Link
                  href="/shop?category=Gifts"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-full transition-all shadow-md group"
                >
                  Explore Gift Studio
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#E9708A]" />
                </Link>
              </div>
            </div>

            {/* Visual Gifting Showcase */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-inner">
              <Image
                src="https://images.unsplash.com/photo-1513094735237-8f2714d57c13?q=80&w=1000&auto=format&fit=crop"
                alt="Nihi Studio Luxury Gift Packaging"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <TrustBadges />

      {/* Testimonials */}
      <Testimonials />

      {/* Instagram UGC Reel */}
      <InstagramReel />
    </div>
  );
}
