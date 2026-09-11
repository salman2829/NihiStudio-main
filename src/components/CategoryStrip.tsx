'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';

export default function CategoryStrip() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-white via-[#FAF7F5]/50 to-white border-b border-[#EFE9E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-[10px] font-bold uppercase tracking-[0.25em]">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Curated Categories
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
            Discover Everyday Luxury
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Pure 925 sterling silver and 18K gold vermeil crafted for every occasion.
          </p>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center justify-start sm:justify-center gap-5 sm:gap-10 overflow-x-auto pb-4 pt-2 no-scrollbar px-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="flex flex-col items-center group shrink-0 w-20 sm:w-28 text-center focus:outline-none"
            >
              {/* Circular Avatar with Gold/Rose Ring */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[#E9708A]/40 via-amber-200 to-[#D4AF37]/60 group-hover:from-[#E9708A] group-hover:to-[#D4AF37] transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-115 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Title & Count */}
              <span className="mt-3 text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#E9708A] transition-colors">
                {category.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {category.itemCount}+ Designs
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
