'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PRODUCTS } from '@/lib/mock-data';
import Link from 'next/link';
import Image from 'next/image';

const POPULAR_SEARCHES = ['Solitaire Ring', 'Heart Pendant', 'Tennis Bracelet', 'Gold Huggies', 'Silver 925', 'Men\'s Signet'];

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen, currency } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim() === ''
    ? []
    : PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.metal.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EFE9E6] z-10 animate-scaleUp">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rings, necklaces, 925 silver, diamond bracelets..."
            className="w-full text-base sm:text-lg text-gray-900 placeholder-gray-400 bg-transparent outline-none font-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs uppercase tracking-wider font-semibold text-gray-500 hover:text-gray-800 px-2 py-1 bg-gray-100 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results / Popular suggestions */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {query.trim() === '' ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-[#FAF7F5] text-gray-700 hover:bg-[#FDF0F3] hover:text-[#E9708A] transition-colors border border-gray-200/60"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Products ({filteredProducts.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map((product) => {
                  const firstVar = product.variants[0];
                  const price = currency === 'INR' ? `₹${firstVar.priceINR.toLocaleString('en-IN')}` : `$${firstVar.priceUSD}`;
                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF7F5] transition-colors border border-transparent hover:border-[#EFE9E6] group"
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#E9708A] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">{product.metal}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{price}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">No jewelry found matching &quot;{query}&quot;</p>
              <Link
                href="/shop"
                onClick={() => setIsSearchOpen(false)}
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#E9708A] hover:underline"
              >
                Browse All Collections <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
