'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X, Sparkles, ChevronDown } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/mock-data';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/store/useStore';

const METALS = ['925 Sterling Silver', '18K Gold Plated', '14K Rose Gold', 'Lab-grown Diamonds'];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialMetal = searchParams.get('metal') || 'all';
  const filterParam = searchParams.get('filter');

  const { currency, wishlist } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedMetal, setSelectedMetal] = useState<string>(initialMetal);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState<boolean>(filterParam === 'wishlist');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync when searchParams change
  React.useEffect(() => {
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category')!);
    if (searchParams.get('metal')) setSelectedMetal(searchParams.get('metal')!);
    if (searchParams.get('filter') === 'wishlist') setShowOnlyWishlist(true);
  }, [searchParams]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (showOnlyWishlist && !wishlist.includes(p.id)) return false;
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedMetal !== 'all' && p.metal !== selectedMetal) return false;
      return true;
    }).sort((a, b) => {
      const priceA = currency === 'INR' ? a.variants[0].priceINR : a.variants[0].priceUSD;
      const priceB = currency === 'INR' ? b.variants[0].priceINR : b.variants[0].priceUSD;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return 0; // featured
    });
  }, [selectedCategory, selectedMetal, sortBy, showOnlyWishlist, wishlist, currency]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedMetal('all');
    setShowOnlyWishlist(false);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedMetal !== 'all' || showOnlyWishlist;

  return (
    <div className="bg-[#FAF7F5]/40 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> The Fine Jewelry Vault
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900">
            {showOnlyWishlist ? 'Your Wishlist Favorites' : selectedCategory !== 'all' ? selectedCategory : 'All Jewelry Collections'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            925 Hallmarked silver and 18K gold vermeil engineered with 6-month anti-tarnish protection.
          </p>
        </div>

        {/* Filter / Sort Control Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#EFE9E6] shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7F5] rounded-xl text-xs font-semibold text-gray-800 border border-gray-200"
          >
            <Filter className="w-4 h-4 text-[#E9708A]" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          {/* Desktop Categories Pills */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1A1818] text-white'
                  : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-[#1A1818] text-white'
                    : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Sort Dropdown */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              {filteredProducts.length} Items
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#FAF7F5] text-xs font-semibold text-gray-800 py-2 pl-3.5 pr-8 rounded-xl border border-gray-200 focus:outline-none focus:border-[#E9708A] cursor-pointer"
              >
                <option value="featured">Featured & Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Row */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-400 font-medium">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                </button>
              </span>
            )}
            {selectedMetal !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700">
                Metal: {selectedMetal}
                <button onClick={() => setSelectedMetal('all')}>
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                </button>
              </span>
            )}
            {showOnlyWishlist && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs text-[#C94D6A] font-semibold">
                Wishlist Only
                <button onClick={() => setShowOnlyWishlist(false)}>
                  <X className="w-3 h-3 text-[#E9708A]" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#E9708A] hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-[#EFE9E6] shadow-xs h-fit sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E9708A]" /> Filter Jewelry
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-[#E9708A] hover:underline font-medium">
                  Reset
                </button>
              )}
            </div>

            {/* Metal Filter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Precious Metal & Finish
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black">
                  <input
                    type="radio"
                    name="metal"
                    checked={selectedMetal === 'all'}
                    onChange={() => setSelectedMetal('all')}
                    className="accent-[#E9708A]"
                  />
                  <span>All Metals</span>
                </label>
                {METALS.map((metal) => (
                  <label key={metal} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black">
                    <input
                      type="radio"
                      name="metal"
                      checked={selectedMetal === metal}
                      onChange={() => setSelectedMetal(metal)}
                      className="accent-[#E9708A]"
                    />
                    <span>{metal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hallmark Assurance Note */}
            <div className="pt-4 border-t border-gray-100 bg-[#FAF7F5] p-3.5 rounded-xl text-[11px] text-gray-600 leading-relaxed">
              <strong className="text-gray-900 block mb-1">Authenticity Guaranteed</strong>
              All Nihi Studio silver jewelry carries the official BIS 925 Hallmark and includes a certificate of authenticity.
            </div>
          </aside>

          {/* Product Grid (3 cols on desktop) */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#EFE9E6] shadow-xs space-y-4">
                <p className="text-base font-serif text-gray-800">No jewelry matching your filter selection</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try clearing some filters or searching for our most popular solitaire rings and everyday huggies.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#1A1818] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between z-10 animate-slideLeft">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block text-xs ${selectedCategory === 'all' ? 'font-bold text-[#E9708A]' : 'text-gray-700'}`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`block text-xs ${selectedCategory === cat.name ? 'font-bold text-[#E9708A]' : 'text-gray-700'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metal Type</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMetal('all')}
                    className={`block text-xs ${selectedMetal === 'all' ? 'font-bold text-[#E9708A]' : 'text-gray-700'}`}
                  >
                    All Metals
                  </button>
                  {METALS.map((metal) => (
                    <button
                      key={metal}
                      onClick={() => setSelectedMetal(metal)}
                      className={`block text-xs ${selectedMetal === metal ? 'font-bold text-[#E9708A]' : 'text-gray-700'}`}
                    >
                      {metal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#1A1818] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading fine jewelry catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
