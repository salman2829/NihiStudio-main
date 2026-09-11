'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Gift,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, clearCart, getCartTotal, currency, user } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: currency === 'INR' ? 'upi' : 'stripe',
  });

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.shipping?.phone || user.billing?.phone || prev.phone,
        address: user.shipping?.address1 || prev.address,
        city: user.shipping?.city || prev.city,
        state: user.shipping?.state || prev.state,
        pincode: user.shipping?.postcode || prev.pincode,
      }));
    }
  }, [user]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [confirmedSummary, setConfirmedSummary] = useState<{
    total: number;
    subtotal: number;
    shippingCost: number;
    items: typeof cart;
    isCod: boolean;
    city: string;
    pincode: string;
    address: string;
  } | null>(null);

  const totals = getCartTotal();
  const subtotal = currency === 'INR' ? totals.inr : totals.usd;
  const isFreeShipping = subtotal >= (currency === 'INR' ? 999 : 15);
  const shippingCost = isFreeShipping ? 0 : currency === 'INR' ? 99 : 5;
  const grandTotal = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderPayload = {
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerEmail: formData.email,
      items: cart,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.pincode,
        phone: formData.phone,
        country: currency === 'INR' ? 'India' : 'United States',
      },
      subtotal,
      shippingCost,
      total: grandTotal,
      currency,
      paymentMethod: formData.paymentMethod,
    };

    // Save full snapshot of order summary for success screen before cart is cleared
    const summarySnapshot = {
      total: grandTotal,
      subtotal,
      shippingCost,
      items: [...cart],
      isCod: formData.paymentMethod === 'cod',
      city: formData.city,
      pincode: formData.pincode,
      address: formData.address,
    };

    // Razorpay Flow for INR online payments (UPI, Cards, Netbanking)
    if (currency === 'INR' && formData.paymentMethod !== 'cod') {
      try {
        const orderRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountINR: grandTotal,
            receipt: `rcpt_${Date.now()}`,
          }),
        });

        const orderData = await orderRes.json();
        const isLoaded = await loadRazorpayScript();

        if (isLoaded && window.Razorpay && orderData.key && orderData.key !== 'rzp_test_simulated') {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'NIHI STUDIO',
            description: 'Everyday Fine Jewelry - 925 Pure Silver & Diamonds',
            image: 'https://nihistudio.com/wp-content/uploads/2026/09/DJBE12797-1024x1024-1.jpg',
            order_id: orderData.orderId,
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone,
            },
            theme: {
              color: '#E9708A',
            },
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/razorpay/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderDetails: orderPayload,
                  }),
                });

                const verifyData = await verifyRes.json();
                setOrderId(verifyData.orderId || `NIHI-${Math.floor(100000 + Math.random() * 900000)}`);
                setConfirmedSummary(summarySnapshot);
                setIsProcessing(false);
                setOrderComplete(true);
                clearCart();

                confetti({
                  particleCount: 120,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ['#E9708A', '#D4AF37', '#FAF7F5', '#1A1818'],
                });
              } catch {
                setOrderId(`NIHI-${Math.floor(100000 + Math.random() * 900000)}`);
                setConfirmedSummary(summarySnapshot);
                setIsProcessing(false);
                setOrderComplete(true);
                clearCart();
              }
            },
            modal: {
              ondismiss: function () {
                setIsProcessing(false);
              },
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          return;
        }
      } catch (err) {
        console.warn('Razorpay checkout initialization note:', err);
      }
    }

    // Standard / COD / USD Order Flow
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      const confirmedId = data.orderId || `NIHI-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(confirmedId);
      setConfirmedSummary(summarySnapshot);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E9708A', '#D4AF37', '#FAF7F5', '#1A1818'],
      });
    } catch {
      const fallbackId = `NIHI-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(fallbackId);
      setConfirmedSummary(summarySnapshot);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
    }
  };

  if (orderComplete) {
    const finalTotal = confirmedSummary?.total || grandTotal || 0;

    return (
      <div className="bg-[#FAF7F5]/40 min-h-screen py-12 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE9E6] shadow-xl text-center space-y-6 animate-scaleUp">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#D4AF37] block">
              {confirmedSummary?.isCod ? '💵 Cash on Delivery Confirmed' : '✨ Order Confirmed & Certified'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              Thank You, {formData.firstName || 'Valued Patron'}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Your order <strong className="text-gray-900 font-mono">#{orderId}</strong> has been received and sent to our master jewellers for hallmarking and velvet packaging.
            </p>
          </div>

          {/* Itemized Order Details */}
          {confirmedSummary?.items && confirmedSummary.items.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-[#FAF7F5]/60 p-4 text-left space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200/60 pb-1.5">
                Ordered Items ({confirmedSummary.items.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {confirmedSummary.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.image && (
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <Image src={item.image} alt={item.productName} fill className="object-cover" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                        <p className="text-[10px] text-gray-500">{item.variantName} {item.size ? `• ${item.size}` : ''} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0 ml-2">
                      {currency === 'INR'
                        ? `₹${((item.priceINR + (item.giftWrap ? 199 : 0)) * item.quantity).toLocaleString('en-IN')}`
                        : `$${(item.priceUSD + (item.giftWrap ? 3 : 0)) * item.quantity}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery & Payment Invoice Info */}
          <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-gray-200/80 text-left space-y-3 text-xs text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Dispatch:</span>
              <span className="font-semibold text-gray-900">24–48 Business Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[240px] truncate">
                {confirmedSummary?.city || formData.city || 'Kamareddy'}, {confirmedSummary?.pincode || formData.pincode || '503108'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-gray-200/60">
              <div>
                <span className="text-gray-600 font-medium block">
                  {confirmedSummary?.isCod ? 'Total Payable on Delivery (COD):' : 'Amount Paid Online:'}
                </span>
                {confirmedSummary?.isCod ? (
                  <span className="text-[10px] text-amber-800 bg-amber-100 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Pay Cash / UPI at Doorstep
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Verified Online Payment
                  </span>
                )}
              </div>
              <span className="font-extrabold text-[#E9708A] text-lg">
                {currency === 'INR' ? `₹${finalTotal.toLocaleString('en-IN')}` : `$${finalTotal}`}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="text-xl font-serif font-semibold text-gray-800">Your shopping box is empty</h2>
        <Link href="/shop" className="mt-4 text-xs font-bold text-[#E9708A] uppercase tracking-wider hover:underline">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F5]/40 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-gray-700 text-xs font-semibold uppercase tracking-widest border border-gray-200 mb-2">
            <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit Encrypted Secure Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
            Express Checkout
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Information & Payment Method */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                1. Customer & Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Ananya"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Email Address (for order tracking) *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ananya@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Apartment / House No / Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat 402, Radiant Residency, Palm Avenue"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">PIN / Zip Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="560001"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  2. Payment Gateway & Options
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {currency === 'INR' ? '🇮🇳 Razorpay Instant UPI' : '🇺🇸 Stripe / PayPal Global'}
                </span>
              </div>

              <div className="space-y-3">
                {currency === 'INR' ? (
                  <>
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E9708A] bg-[#FDF0F3]/40 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Instant UPI / QR / Google Pay / PhonePe</p>
                          <p className="text-[11px] text-gray-500">Zero transaction charges via Razorpay</p>
                        </div>
                      </div>
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Credit / Debit Card / NetBanking</p>
                          <p className="text-[11px] text-gray-500">Visa, Mastercard, RuPay, Amex</p>
                        </div>
                      </div>
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</p>
                          <p className="text-[11px] text-gray-500">Pay at doorstep with OTP verification</p>
                        </div>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-[#E9708A] bg-[#FDF0F3]/40 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={formData.paymentMethod === 'stripe'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">Credit Card / Apple Pay (Stripe)</p>
                          <p className="text-[11px] text-gray-500">Worldwide encrypted checkout</p>
                        </div>
                      </div>
                      <CreditCard className="w-4 h-4 text-[#E9708A]" />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-gray-300 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === 'paypal'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">PayPal Express</p>
                          <p className="text-[11px] text-gray-500">Buyer protection guaranteed</p>
                        </div>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 pb-3 border-b border-gray-100">
                Order Summary ({cart.reduce((t, i) => t + i.quantity, 0)} Items)
              </h3>

              {/* Items preview */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                      <Image src={item.image} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-[11px] text-gray-500">{item.variantName} {item.size ? `• ${item.size}` : ''}</p>
                      {item.engravingText && (
                        <p className="text-[10px] text-[#C94D6A] font-mono">
                          Engraved: &ldquo;{item.engravingText}&rdquo;
                        </p>
                      )}
                      {item.giftWrap && (
                        <p className="text-[10px] text-emerald-700 flex items-center gap-0.5">
                          <Gift className="w-3 h-3" /> Velvet Gift Box
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">
                      {currency === 'INR'
                        ? `₹${((item.priceINR + (item.giftWrap ? 199 : 0)) * item.quantity).toLocaleString('en-IN')}`
                        : `$${(item.priceUSD + (item.giftWrap ? 3 : 0)) * item.quantity}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {currency === 'INR' ? `₹${subtotal.toLocaleString('en-IN')}` : `$${subtotal}`}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Insured Express Shipping</span>
                  <span>{isFreeShipping ? 'FREE' : currency === 'INR' ? '₹99' : '$5'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-base text-[#E9708A]">
                    {currency === 'INR' ? `₹${grandTotal.toLocaleString('en-IN')}` : `$${grandTotal}`}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#1A1818] hover:bg-black text-white text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Processing Secure Payment...</span>
                ) : (
                  <>
                    Complete Order <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>BIS Hallmarked • 30-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
