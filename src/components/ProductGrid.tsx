'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Flame, Sparkle, Gift } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'new' | 'gifts'>('bestsellers');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'bestsellers') return p.badge === 'Bestseller' || p.rating >= 4.8;
    if (activeTab === 'new') return p.badge === 'New Arrival' || p.category === "Men's";
    if (activeTab === 'gifts') return p.category === 'Gifts' || p.allowsEngraving;
    return true;
  });

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FAF7F5]/80 via-white to-[#FAF7F5]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FDF0F3] text-[#E9708A] text-[10px] font-bold uppercase tracking-[0.25em] border border-[#F6D0D9]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Signature Collections
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 tracking-tight">
            Handcrafted for Everyday Radiance
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            100% BIS hallmarked 925 sterling silver with protective anti-tarnish e-coating.
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-white border border-[#EFE9E6] shadow-sm mt-6 gap-1">
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-[#1A1818] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#E9708A]" />
              Bestsellers
            </button>

            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'new'
                  ? 'bg-[#1A1818] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <Sparkle className="w-3.5 h-3.5 text-[#D4AF37]" />
              New Drops
            </button>

            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === 'gifts'
                  ? 'bg-[#1A1818] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              Gift Sets
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {(filteredProducts.length > 0 ? filteredProducts : products).slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 px-9 py-4 bg-[#1A1818] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all group hover:scale-[1.02]"
          >
            Explore Complete Boutique ({products.length}+ Pieces)
            <ArrowRight className="w-4 h-4 text-[#E9708A] group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
