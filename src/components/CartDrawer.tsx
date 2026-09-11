'use client';

import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Gift } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    currency,
  } = useStore();

  const totals = getCartTotal();
  const thresholdINR = 999;
  const thresholdUSD = 15;

  const currentTotal = currency === 'INR' ? totals.inr : totals.usd;
  const threshold = currency === 'INR' ? thresholdINR : thresholdUSD;
  const progressPercent = Math.min(100, Math.round((currentTotal / threshold) * 100));
  const remaining = Math.max(0, threshold - currentTotal);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <aside aria-label="Shopping Cart Drawer" className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F5]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E9708A]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-gray-900">
              Shopping Cart ({cart.reduce((t, i) => t + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
            className="p-2 rounded-full hover:bg-gray-200/60 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#FDF0F3] p-3.5 border-b border-[#F5D5DD]">
          <div className="flex items-center justify-between text-xs font-medium text-gray-800 mb-1.5">
            <span>
              {remaining === 0 ? (
                <span className="text-[#C94D6A] font-semibold flex items-center gap-1">
                  🎉 Congratulations! Free Express Shipping unlocked
                </span>
              ) : (
                <span>
                  Add{' '}
                  <strong className="text-[#C94D6A]">
                    {currency === 'INR' ? `₹${remaining.toLocaleString('en-IN')}` : `$${remaining}`}
                  </strong>{' '}
                  more for Free Express Shipping
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-[#E9708A]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-rose-200/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#E9708A] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F5] flex items-center justify-center mx-auto text-gray-400">
                <ShoppingBag className="w-8 h-8 stroke-1 text-gray-300" />
              </div>
              <p className="text-base font-serif text-gray-800 font-medium">Your jewelry box is empty</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Explore our everyday 925 hallmarked fine jewelry collections crafted for timeless sparkle.
              </p>
              <div className="pt-2 flex flex-col gap-2 items-center">
                <button
                  type="button"
                  onClick={() => {
                    const { addToCart } = useStore.getState();
                    addToCart({
                      productId: 'nihi-test-1',
                      productName: '₹1 Live Payment Verification Item',
                      variantId: 'var-test-1',
                      variantName: 'Test Sample',
                      priceINR: 1,
                      priceUSD: 1,
                      quantity: 1,
                      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
                    });
                  }}
                  className="w-full max-w-xs py-2.5 px-4 bg-[#E9708A] hover:bg-[#d45d77] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  ⚡ Add ₹1 Test Item & Checkout
                </button>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#1A1818] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-black transition-colors"
                >
                  Browse Shop <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = currency === 'INR' ? item.priceINR : item.priceUSD;
              const giftWrapCost = item.giftWrap ? (currency === 'INR' ? 199 : 3) : 0;
              const totalPrice = (itemPrice + giftWrapCost) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl border border-gray-100 bg-[#FAF7F5]/50 hover:bg-[#FAF7F5] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200/50">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-[#E9708A] transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.productName} from cart`}
                          className="text-gray-400 hover:text-red-500 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant & Customizations tags */}
                      <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-gray-500">
                        <span className="px-1.5 py-0.5 bg-white rounded border border-gray-200/80">
                          {item.variantName}
                        </span>
                        {item.size && (
                          <span className="px-1.5 py-0.5 bg-white rounded border border-gray-200/80">
                            {item.size}
                          </span>
                        )}
                        {item.engravingText && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-[#C94D6A] font-mono rounded border border-rose-200">
                            Engraving: &ldquo;{item.engravingText}&rdquo;
                          </span>
                        )}
                      </div>

                      {item.giftWrap && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-medium">
                          <Gift className="w-3 h-3" /> Velvet Gift Box (+{currency === 'INR' ? '₹199' : '$3'})
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity buttons */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        {currency === 'INR' ? `₹${totalPrice.toLocaleString('en-IN')}` : `$${totalPrice}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#FAF7F5] space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-sm font-bold text-gray-900">
                  {currency === 'INR'
                    ? `₹${totals.inr.toLocaleString('en-IN')}`
                    : `$${totals.usd}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-700">
                <span>Shipping</span>
                <span>{remaining === 0 ? 'FREE' : currency === 'INR' ? '₹99' : '$5'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Inclusive of all GST & taxes</span>
                <span>Hallmarked 925 Guaranteed</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1A1818] hover:bg-black text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl group"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Checkout (Razorpay / Stripe)</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
