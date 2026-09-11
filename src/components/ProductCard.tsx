'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag, Check, Award } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore } from '@/store/useStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { currency, isInWishlist, toggleWishlist, addToCart } = useStore();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const isWishlisted = isInWishlist(product.id);

  // Price calculations
  const price = currency === 'INR' ? selectedVariant.priceINR : selectedVariant.priceUSD;
  const originalPrice = currency === 'INR' ? selectedVariant.originalPriceINR : selectedVariant.originalPriceUSD;
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  // Hover image switch if multiple images exist
  const currentImage = isHovered && selectedVariant.images.length > 1
    ? selectedVariant.images[1]
    : selectedVariant.images[0] || product.featuredImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      image: selectedVariant.images[0] || product.featuredImage,
      size: product.hasSizes && product.availableSizes ? product.availableSizes[0] : undefined,
      giftWrap: false,
      priceINR: selectedVariant.priceINR,
      priceUSD: selectedVariant.priceUSD,
      quantity: 1,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="group relative bg-white rounded-3xl p-3 sm:p-4 border border-[#EFE9E6] hover:border-[#E9708A]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Image & Badges Container */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF7F5] mb-3">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-108"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.badge && (
              <span className={`px-2.5 py-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-md text-white shadow-xs ${
                product.badge === 'Bestseller' ? 'bg-[#1A1818]' :
                product.badge === 'New Arrival' ? 'bg-[#E9708A]' :
                product.badge === 'Sale' ? 'bg-rose-600' : 'bg-[#D4AF37]'
              }`}>
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-white/95 backdrop-blur-xs text-[#C94D6A] border border-rose-200 rounded-md shadow-2xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label="Wishlist toggle"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 shadow-sm hover:scale-110 transition-all z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#E9708A] text-[#E9708A]' : 'hover:text-[#E9708A]'
              }`}
            />
          </button>

          {/* Hallmark Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold">
            <Award className="w-3 h-3 text-[#D4AF37]" />
            <span>925 BIS</span>
          </div>

          {/* Quick Add Overlay on Hover */}
          <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1A1818] hover:bg-black text-white active:scale-95'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added to Box
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" /> Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metal Swatches */}
        {product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            {product.variants.map((v, index) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariantIndex(index);
                }}
                className={`w-4 h-4 rounded-full transition-all border ${
                  selectedVariantIndex === index
                    ? 'ring-2 ring-[#E9708A] ring-offset-1 scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: v.colorHex }}
                title={v.name}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1 font-medium truncate">
              {selectedVariant.name}
            </span>
          </div>
        )}

        {/* Product Title & Metal Details */}
        <Link href={`/product/${product.slug}`} className="block px-1">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold truncate">
            {product.metal || '925 Pure Silver'}
          </p>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#E9708A] transition-colors mt-0.5">
            {product.name}
          </h3>
        </Link>
      </div>

      {/* Ratings & Price Footer */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 px-1 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              {currency === 'INR' ? `₹${price.toLocaleString('en-IN')}` : `$${price}`}
            </span>
            {originalPrice > price && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                {currency === 'INR' ? `₹${originalPrice.toLocaleString('en-IN')}` : `$${originalPrice}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#FAF7F5] px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-gray-700">
          <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
          <span>{product.rating}</span>
          <span className="text-gray-400 text-[9px]">({product.reviewCount})</span>
        </div>
      </div>
    </div>
  );
}
