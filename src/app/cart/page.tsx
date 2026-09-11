'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  Gift,
  Truck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    currency,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const totals = getCartTotal();
  const subtotal = currency === 'INR' ? totals.inr : totals.usd;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const threshold = currency === 'INR' ? 999 : 15;
  const progress = Math.min(100, Math.round((finalTotal / threshold) * 100));
  const remaining = Math.max(0, threshold - finalTotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'FIRSTNIHI' || couponCode.toUpperCase() === 'NIHI10') {
      setDiscountPercent(10);
      setCouponMessage('🎉 Coupon FIRSTNIHI applied! You saved 10%.');
    } else {
      setCouponMessage('Invalid coupon code. Try FIRSTNIHI.');
    }
  };

  return (
    <div className="bg-[#FAF7F5]/40 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
          Your Shopping Box ({cart.reduce((t, i) => t + i.quantity, 0)})
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE9E6] shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F5] flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag className="w-8 h-8 stroke-1 text-gray-300" />
            </div>
            <h2 className="text-xl font-serif text-gray-900 font-semibold">Your jewelry box is empty</h2>
            <p className="text-xs text-gray-500">
              Explore our everyday 925 hallmarked fine jewelry collections crafted for timeless sparkle.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Discover Fine Jewelry <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Items list */}
            <div className="lg:col-span-8 space-y-4">
              {/* Shipping progress */}
              <div className="bg-[#FDF0F3] p-4 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-800">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#E9708A]" />
                    {remaining === 0 ? (
                      <span className="text-[#C94D6A] font-bold">
                        🎉 Free Express Delivery Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add{' '}
                        <strong className="text-[#C94D6A]">
                          {currency === 'INR' ? `₹${remaining.toLocaleString('en-IN')}` : `$${remaining}`}
                        </strong>{' '}
                        more to get Free Express Shipping
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#E9708A]">{progress}%</span>
                </div>
                <div className="w-full bg-rose-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E9708A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#EFE9E6] shadow-xs divide-y divide-gray-100">
                {cart.map((item) => {
                  const itemPrice = currency === 'INR' ? item.priceINR : item.priceUSD;
                  const giftWrapCost = item.giftWrap ? (currency === 'INR' ? 199 : 3) : 0;
                  const itemTotal = (itemPrice + giftWrapCost) * item.quantity;

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <Image src={item.image} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#E9708A] transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded">Finish: {item.variantName}</span>
                            {item.size && <span className="bg-gray-100 px-2 py-0.5 rounded">Size: {item.size}</span>}
                            {item.engravingText && (
                              <span className="bg-rose-50 text-[#C94D6A] px-2 py-0.5 rounded font-mono border border-rose-200">
                                Engraved: &ldquo;{item.engravingText}&rdquo;
                              </span>
                            )}
                          </div>
                          {item.giftWrap && (
                            <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                              <Gift className="w-3.5 h-3.5" /> Velvet Gift Box (+{currency === 'INR' ? '₹199' : '$3'})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-[#FAF7F5]">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1.5 text-gray-500 hover:text-gray-900"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1.5 text-gray-500 hover:text-gray-900"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900 block">
                            {currency === 'INR' ? `₹${itemTotal.toLocaleString('en-IN')}` : `$${itemTotal}`}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mt-0.5 ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-[#EFE9E6] shadow-xs space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
                  Order Summary
                </h3>

                {/* Coupon Code Field */}
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon (e.g. FIRSTNIHI)"
                        className="w-full pl-8 pr-2 py-2 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-[#E9708A]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A1818] text-white text-xs font-semibold uppercase rounded-xl hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs font-medium ${discountPercent > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {couponMessage}
                    </p>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {currency === 'INR' ? `₹${subtotal.toLocaleString('en-IN')}` : `$${subtotal}`}
                    </span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-[#C94D6A] font-semibold">
                      <span>Discount (10% Off)</span>
                      <span>-{currency === 'INR' ? `₹${discountAmount.toLocaleString('en-IN')}` : `$${discountAmount}`}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Express Insured Shipping</span>
                    <span>{remaining === 0 ? 'FREE' : currency === 'INR' ? '₹99' : '$5'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-base text-[#E9708A]">
                      {currency === 'INR' ? `₹${finalTotal.toLocaleString('en-IN')}` : `$${finalTotal}`}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-4 bg-[#1A1818] hover:bg-black text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Insured & Tamper-Evident Packaging</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
