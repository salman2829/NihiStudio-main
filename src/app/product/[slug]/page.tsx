'use client';

import React, { useState, use, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  Heart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Gift,
  Ruler,
  Check,
  ShoppingBag,
  Zap,
  ChevronDown,
  Info,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/mock-data';
import { useStore } from '@/store/useStore';

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || '';
  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  if (!product) {
    notFound();
  }

  const {
    currency,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsSizeModalOpen,
    setSizeModalType,
  } = useStore();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.hasSizes && product.availableSizes ? product.availableSizes[0] : ''
  );
  const [customEngraving, setCustomEngraving] = useState('');
  const [enableEngraving, setEnableEngraving] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [isPriceAccordionOpen, setIsPriceAccordionOpen] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // Zoom Effect State
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const images = selectedVariant.images.length > 0 ? selectedVariant.images : [product.featuredImage];
  const currentImage = images[selectedImageIndex] || images[0];

  const isWishlisted = isInWishlist(product.id);

  // Prices
  const price = currency === 'INR' ? selectedVariant.priceINR : selectedVariant.priceUSD;
  const originalPrice = currency === 'INR' ? selectedVariant.originalPriceINR : selectedVariant.originalPriceUSD;
  const giftWrapCost = giftWrap ? (currency === 'INR' ? 199 : 3) : 0;
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  // Image Magnifier Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${currentImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length >= 5) {
      setPincodeStatus(`✨ Express Delivery by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (Free Shipping)`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit PIN code / ZIP code.');
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      image: currentImage,
      size: product.hasSizes ? selectedSize : undefined,
      engravingText: enableEngraving && customEngraving.trim() ? customEngraving.trim() : undefined,
      giftWrap,
      priceINR: selectedVariant.priceINR,
      priceUSD: selectedVariant.priceUSD,
      quantity: 1,
    });

    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2500);
  };

  const openSizeGuide = () => {
    setSizeModalType(product.sizeType === 'bangle' ? 'bangle' : 'ring');
    setIsSizeModalOpen(true);
  };

  return (
    <div className="bg-white min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-gray-900 transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery with Magnifier Zoom */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails list */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto no-scrollbar shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF7F5] border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#E9708A] shadow-md scale-95'
                      : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Interactive Magnifier View */}
            <div className="flex-1 relative aspect-square rounded-3xl overflow-hidden bg-[#FAF7F5] border border-[#EFE9E6]">
              <div
                ref={imageContainerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-full cursor-crosshair overflow-hidden group"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-center"
                />

                {/* Magnified Hover Layer */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-150 shadow-2xl"
                  style={zoomStyle}
                />

                {/* Hover hint */}
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-white font-medium pointer-events-none group-hover:opacity-0 transition-opacity">
                  🔍 Roll cursor to zoom in
                </div>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist toggle"
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-700 hover:text-[#E9708A] transition-all z-20"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#E9708A] text-[#E9708A]' : ''}`} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
                {product.badge && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#1A1818] text-white rounded-md shadow-sm">
                    {product.badge}
                  </span>
                )}
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#FAF7F5] text-[#D4AF37] border border-amber-200 rounded-md">
                  {product.hallmark}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Customizer */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Ratings */}
            <div className="space-y-2 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#E9708A]">
                  {product.metal}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-mono">SKU: {selectedVariant.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-gray-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-gray-500">{product.subtitle}</p>

              {/* Rating pill */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 bg-[#FAF7F5] px-2 py-1 rounded-md text-xs font-bold text-gray-800 border border-gray-200">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500 underline font-medium">
                  {product.reviewCount} Verified Customer Reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#EFE9E6] space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                  {currency === 'INR' ? `₹${price.toLocaleString('en-IN')}` : `$${price}`}
                </span>
                {originalPrice > price && (
                  <span className="text-base text-gray-400 line-through">
                    {currency === 'INR' ? `₹${originalPrice.toLocaleString('en-IN')}` : `$${originalPrice}`}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#FDF0F3] text-[#C94D6A] rounded-md border border-rose-200">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Inclusive of all taxes & BIS Hallmarking charges. Free doorstep insured delivery.
              </p>
            </div>

            {/* Metal Swatch Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-gray-700">
                  Color / Finish: <strong className="text-gray-900">{selectedVariant.name}</strong>
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Stock & Ready to Ship
                </span>
              </div>

              <div className="flex items-center gap-3">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariantIndex(idx);
                      setSelectedImageIndex(0);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      selectedVariantIndex === idx
                        ? 'border-[#E9708A] bg-[#FDF0F3] text-[#C94D6A] shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector & Ring Size Modal Trigger */}
            {product.hasSizes && product.availableSizes && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-gray-700">Select Size</span>
                  <button
                    onClick={openSizeGuide}
                    className="inline-flex items-center gap-1 text-[#E9708A] hover:underline font-semibold"
                  >
                    <Ruler className="w-3.5 h-3.5" /> Find My Size Guide
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {product.availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                        selectedSize === s
                          ? 'border-[#1A1818] bg-[#1A1818] text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Engraving Add-On with Live Visual Mockup Preview */}
            {product.allowsEngraving && (
              <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EFE9E6] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-900 uppercase tracking-wide">
                    <input
                      type="checkbox"
                      checked={enableEngraving}
                      onChange={(e) => setEnableEngraving(e.target.checked)}
                      className="accent-[#E9708A] w-4 h-4 rounded"
                    />
                    <span>Add Free Personalized Engraving</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#E9708A] bg-rose-50 px-2 py-0.5 rounded uppercase">
                    Complimentary
                  </span>
                </div>

                {enableEngraving && (
                  <div className="space-y-2 pt-1 animate-fadeIn">
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={product.engravingMaxChars || 12}
                        value={customEngraving}
                        onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                        placeholder="ENTER INITIALS OR DATE (e.g. A & S)"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono tracking-widest uppercase focus:outline-none focus:border-[#E9708A]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-mono">
                        {customEngraving.length}/{product.engravingMaxChars || 12}
                      </span>
                    </div>

                    {/* Live Visual Preview on Ring/Plate */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 border border-gray-300 text-center shadow-inner">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">
                        Laser Engraving Live Preview
                      </p>
                      <div className="h-7 flex items-center justify-center bg-gradient-to-r from-neutral-300 via-stone-200 to-neutral-300 rounded px-4">
                        <span className="font-serif italic text-gray-800 text-sm tracking-[0.2em] select-none font-bold drop-shadow-xs">
                          {customEngraving ? `✦ ${customEngraving} ✦` : '✦ YOUR TEXT HERE ✦'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gift Wrap Add-On */}
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9E6] flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="accent-[#E9708A] w-4 h-4 rounded"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Gift className="w-3.5 h-3.5 text-[#E9708A]" />
                    <span>Luxury Velvet Gift Box & Wax Sealed Letter</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Hand-calligraphed card sealed with authentic metallic wax stamp
                  </p>
                </div>
              </label>
              <span className="text-xs font-bold text-gray-800 shrink-0">
                +{currency === 'INR' ? '₹199' : '$3'}
              </span>
            </div>

            {/* Action Buttons (Add to Cart & Buy Now) */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isAddedToCart
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-[#1A1818] hover:bg-black text-white hover:shadow-xl'
                }`}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Shopping Box!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#E9708A]" /> Add to Shopping Box
                  </>
                )}
              </button>

              <Link
                href="/checkout"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#E9708A] hover:bg-[#C94D6A] text-white shadow-md transition-all"
              >
                <Zap className="w-4 h-4" /> 1-Click Fast Checkout
              </Link>
            </div>

            {/* Pincode / Zip Code Estimator */}
            <div className="pt-3 border-t border-gray-100">
              <form onSubmit={handlePincodeCheck} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Check Delivery Time & Pincode Availability
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Truck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter 6-digit PIN code (e.g. 560001 or 10001)"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold uppercase rounded-xl hover:bg-black transition-colors shrink-0"
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus && (
                  <p className="text-xs font-medium text-emerald-700 pt-1 animate-fadeIn">
                    {pincodeStatus}
                  </p>
                )}
              </form>
            </div>

            {/* Price Transparency Accordion */}
            <div className="border border-[#EFE9E6] rounded-2xl overflow-hidden">
              <button
                onClick={() => setIsPriceAccordionOpen(!isPriceAccordionOpen)}
                className="w-full p-4 bg-[#FAF7F5] flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-gray-900"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#D4AF37]" />
                  <span>Transparent Price Breakup</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isPriceAccordionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isPriceAccordionOpen && (
                <div className="p-4 bg-white text-xs text-gray-600 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span>Metal Value ({product.priceBreakdown.metalType})</span>
                    <span className="font-semibold text-gray-900">
                      ₹{product.priceBreakdown.metalCostINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span>Gemstone / Stones ({product.priceBreakdown.gemstoneDescription})</span>
                    <span className="font-semibold text-gray-900">
                      ₹{product.priceBreakdown.gemstoneCostINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span>Artisan Handcrafting & Making Charges</span>
                    <span className="font-semibold text-gray-900">
                      ₹{product.priceBreakdown.makingChargesINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                    <span>GST (3% Government Tax)</span>
                    <span className="font-semibold text-gray-900">
                      ₹{product.priceBreakdown.gstINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-bold text-gray-900">
                    <span>Total Net Price</span>
                    <span className="text-sm text-[#E9708A]">
                      ₹{product.priceBreakdown.totalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quality & Service Assurances */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-700">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F5] border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#E9708A] shrink-0" />
                <span>6-Month Plating Warranty</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF7F5] border border-gray-100">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Easy Doorstep Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Customer Reviews Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Description & Specifications */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl font-serif font-semibold text-gray-900">
                Product Story & Craftsmanship
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-light">
                {product.description}
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Key Specifications:
                </h3>
                <ul className="space-y-2">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Customer Reviews List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-semibold text-gray-900">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-900 bg-[#FAF7F5] px-2 py-1 rounded">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  <span>{product.rating} / 5</span>
                </div>
              </div>

              <div className="space-y-3">
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EFE9E6] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{rev.author}</span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">{rev.date}</span>
                    </div>

                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>

                    <h4 className="text-xs font-semibold text-gray-900">{rev.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
