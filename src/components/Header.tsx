'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Globe,
  Sparkles,
  User as UserIcon,
  Package,
  MapPin,
  LogOut,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CATEGORIES } from '@/lib/mock-data';

const NAV_LINKS = [
  { name: 'All Jewelry', href: '/shop' },
  { name: 'Rings', href: '/shop?category=Rings' },
  { name: 'Earrings', href: '/shop?category=Earrings' },
  { name: 'Necklaces', href: '/shop?category=Necklaces' },
  { name: 'Bracelets', href: '/shop?category=Bracelets' },
  { name: "Men's", href: "/shop?category=Men's" },
  { name: 'Silver 925', href: '/shop?metal=925+Sterling+Silver' },
  { name: 'Gifting Studio', href: '/shop?category=Gifts', highlight: true },
];

export default function Header() {
  const {
    currency,
    setCurrency,
    country,
    setCountry,
    setIsCartOpen,
    setIsSearchOpen,
    getCartItemCount,
    wishlist,
    user,
    logout,
    setIsAuthModalOpen,
    fetchCurrentUser,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchCurrentUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchCurrentUser]);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = mounted ? getCartItemCount() : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  const handleCountrySelect = (c: string) => {
    setCountry(c);
    setIsCurrencyDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled ? 'glass-luxury shadow-xs' : 'bg-white border-b border-[#EFE9E6]'
      }`}
    >
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile menu trigger & Search */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Open Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#FAF7F5] text-gray-400 hover:text-gray-600 border border-gray-200/80 transition-all text-xs"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>Search solitaire, 925 silver...</span>
              <kbd className="ml-auto text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-400">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Brand Logo */}
          <div className="text-center flex-1 lg:flex-none">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1818] block group-hover:text-[#E9708A] transition-colors">
                NIHI STUDIO
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] text-[#D4AF37] uppercase block -mt-1">
                Everyday Fine Jewelry
              </span>
            </Link>
          </div>

          {/* Right Action Icons (Currency, User Account, Wishlist, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 lg:flex-none justify-end">
            {/* Country / Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:bg-[#FAF7F5] transition-colors border border-transparent hover:border-gray-200"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">{country === 'United States' ? 'USA' : 'India'}</span>
                <span className="text-[#E9708A] font-bold">({currency})</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Currency Dropdown Menu */}
              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-scaleUp">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Region & Currency
                  </div>
                  <button
                    onClick={() => handleCountrySelect('India')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      currency === 'INR' ? 'bg-[#FDF0F3] text-[#E9708A] font-semibold' : 'text-gray-700 hover:bg-[#FAF7F5]'
                    }`}
                  >
                    <span>🇮🇳 India (INR ₹)</span>
                    {currency === 'INR' && <span className="text-[10px] font-bold">ACTIVE</span>}
                  </button>
                  <button
                    onClick={() => handleCountrySelect('United States')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                      currency === 'USD' ? 'bg-[#FDF0F3] text-[#E9708A] font-semibold' : 'text-gray-700 hover:bg-[#FAF7F5]'
                    }`}
                  >
                    <span>🇺🇸 USA / Global (USD $)</span>
                    {currency === 'USD' && <span className="text-[10px] font-bold">ACTIVE</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Account / Profile */}
            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold text-gray-800 hover:bg-[#FAF7F5] transition-colors border border-gray-200/80"
                  aria-label="User Account Menu"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center font-bold text-[11px]">
                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.firstName || 'Account'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true, 'login')}
                  className="p-2 text-gray-700 hover:text-[#E9708A] transition-colors flex items-center gap-1"
                  aria-label="Sign In"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline text-xs font-medium">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scaleUp">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user.displayName || `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/account?tab=orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF7F5] hover:text-[#E9708A] transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>My Orders & Tracking</span>
                    </Link>
                    <Link
                      href="/account?tab=addresses"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF7F5] hover:text-[#E9708A] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>Saved Addresses</span>
                    </Link>
                    <Link
                      href="/account?tab=profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF7F5] hover:text-[#E9708A] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={async () => {
                        setIsUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/shop?filter=wishlist"
              className="relative p-2 text-gray-700 hover:text-[#E9708A] transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E9708A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-900 hover:text-[#E9708A] transition-colors flex items-center gap-1.5 focus:outline-none"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#1A1818] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mega Navigation Bar - Desktop */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center justify-center space-x-8 py-2.5 border-t border-gray-100 text-xs uppercase tracking-wider font-semibold text-gray-700">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`hover:text-[#E9708A] transition-colors py-1 relative group ${
                link.highlight ? 'text-[#C94D6A] font-bold flex items-center gap-1' : ''
              }`}
            >
              {link.highlight && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E9708A] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-fadeIn">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.name}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-[#FAF7F5] text-xs font-medium text-gray-800 hover:bg-[#FDF0F3] hover:text-[#E9708A] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-xs font-medium text-gray-700 py-1.5"
            >
              About Nihi Studio & Purity Promise
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-xs font-medium text-gray-700 py-1.5"
            >
              Customer Support & Tracking
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
