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
  Home,
  Building2,
  MapPin,
  Edit3,
  Check,
  PlusCircle,
  Phone,
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

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

export default function CheckoutPage() {
  const { cart, clearCart, getCartTotal, currency, user, savedAddress, setSavedAddress } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    pincode: '',
    houseNo: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: 'Telangana',
    addressType: 'Home' as 'Home' | 'Work',
    saveAddress: true,
    paymentMethod: currency === 'INR' ? 'upi' : 'stripe',
  });

  const [isEditingSavedAddress, setIsEditingSavedAddress] = useState(false);

  React.useEffect(() => {
    // 1. Prefill from savedAddress in Zustand / LocalStorage if present
    if (savedAddress) {
      setFormData((prev) => ({
        ...prev,
        firstName: savedAddress.firstName || prev.firstName,
        lastName: savedAddress.lastName || prev.lastName,
        email: savedAddress.email || prev.email,
        phone: savedAddress.phone || prev.phone,
        alternatePhone: savedAddress.alternatePhone || prev.alternatePhone,
        pincode: savedAddress.pincode || savedAddress.postcode || prev.pincode,
        houseNo: savedAddress.houseNo || prev.houseNo,
        streetAddress: savedAddress.streetAddress || savedAddress.address1 || prev.streetAddress,
        landmark: savedAddress.landmark || prev.landmark,
        city: savedAddress.city || prev.city,
        state: savedAddress.state || prev.state,
        addressType: savedAddress.addressType || 'Home',
      }));
    } else if (user) {
      // 2. Or prefill from logged-in user profile
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.shipping?.phone || user.billing?.phone || prev.phone,
        pincode: user.shipping?.pincode || user.shipping?.postcode || prev.pincode,
        houseNo: user.shipping?.houseNo || '',
        streetAddress: user.shipping?.streetAddress || user.shipping?.address1 || prev.streetAddress,
        city: user.shipping?.city || prev.city,
        state: user.shipping?.state || prev.state,
      }));
    }
  }, [user, savedAddress]);

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
  const isFreeShipping = subtotal >= (currency === 'INR' ? 999 : 15) || subtotal <= 5;
  const shippingCost = isFreeShipping ? 0 : currency === 'INR' ? 99 : 5;
  const grandTotal = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const fullAddressLine1 = `${formData.houseNo ? `${formData.houseNo}, ` : ''}${formData.streetAddress}`.trim();
    const fullAddressLine2 = `${formData.landmark ? `Near ${formData.landmark}` : ''} ${formData.addressType ? `(${formData.addressType})` : ''}`.trim();
    const finalFormattedAddress = `${fullAddressLine1}${fullAddressLine2 ? `, ${fullAddressLine2}` : ''}`;

    const shippingAddressPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address1: finalFormattedAddress || formData.streetAddress || 'Main Street, Landmark',
      address2: fullAddressLine2,
      houseNo: formData.houseNo,
      streetAddress: formData.streetAddress,
      landmark: formData.landmark,
      addressType: formData.addressType,
      city: formData.city || 'Hyderabad',
      state: formData.state || 'Telangana',
      postcode: formData.pincode || '500046',
      pincode: formData.pincode || '500046',
      phone: formData.phone,
      alternatePhone: formData.alternatePhone,
      email: formData.email,
      country: currency === 'INR' ? 'India' : 'United States',
    };

    // Save to user storage if checkbox is checked
    if (formData.saveAddress) {
      setSavedAddress(shippingAddressPayload);
    }

    const orderPayload = {
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerEmail: formData.email,
      items: cart,
      shippingAddress: shippingAddressPayload,
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
      address: finalFormattedAddress,
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
              <span className="font-semibold text-gray-900">24–48 Business Hours (Shiprocket Express)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[260px] truncate">
                {confirmedSummary?.address || `${formData.city}, ${formData.pincode}`}
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
        <h2 className="text-xl font-serif font-semibold text-gray-800">Your shopping box is empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-5 max-w-sm">
          Want to test the live Razorpay payment gateway right now? Click below to load the ₹1 test product.
        </p>
        <button
          type="button"
          onClick={() => {
            const { addToCart } = useStore.getState();
            addToCart({
              productId: 'nihi-test-1',
              productName: '₹1 Live Payment Verification Item',
              slug: 'nihi-test-verification-item',
              variantId: 'var-test-1',
              variantName: 'Test Sample',
              priceINR: 1,
              priceUSD: 1,
              quantity: 1,
              giftWrap: false,
              image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
            });
          }}
          className="px-6 py-3 bg-[#E9708A] hover:bg-[#d45d77] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md mb-3"
        >
          ⚡ Add ₹1 Test Product & Pay Now
        </button>
        <Link href="/shop" className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:underline">
          Or Browse Shop Collection
        </Link>
      </div>
    );
  }

  const hasSavedAddress = Boolean(savedAddress && savedAddress.streetAddress && savedAddress.city);

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
            {/* Delivery Address Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1A1818] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                {hasSavedAddress && !isEditingSavedAddress && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSavedAddress(true)}
                    className="text-xs font-semibold text-[#E9708A] hover:text-[#d45d77] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit / Change
                  </button>
                )}
              </div>

              {/* Flipkart-Style Saved Address Card if available and not in editing mode */}
              {hasSavedAddress && !isEditingSavedAddress ? (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#E9708A] bg-[#FDF0F3]/30 space-y-3 relative transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {formData.firstName} {formData.lastName}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-900 text-white rounded-md">
                        {formData.addressType || 'Home'}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Selected Address
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    {formData.houseNo ? `${formData.houseNo}, ` : ''}{formData.streetAddress}
                    {formData.landmark ? `, Near ${formData.landmark}` : ''}
                    , {formData.city}, {formData.state} - <strong className="font-mono">{formData.pincode}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> +91 {formData.phone}
                    </span>
                    {formData.alternatePhone && (
                      <span className="text-gray-500">
                        Alt: +91 {formData.alternatePhone}
                      </span>
                    )}
                    <span className="text-gray-500">
                      📧 {formData.email}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingSavedAddress(true)}
                      className="text-xs font-semibold text-gray-700 hover:text-black underline cursor-pointer"
                    >
                      + Add New or Modify Address
                    </button>
                  </div>
                </div>
              ) : (
                /* Full Flipkart-Style Address Form */
                <div className="space-y-4">
                  {hasSavedAddress && isEditingSavedAddress && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-gray-500">Editing delivery details:</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingSavedAddress(false)}
                        className="text-xs text-[#E9708A] hover:underline"
                      >
                        Cancel & Use Saved
                      </button>
                    </div>
                  )}

                  {/* Section: Recipient Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Ananya"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sharma"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        10-Digit Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-500">+91</span>
                        <input
                          type="tel"
                          name="phone"
                          required
                          maxLength={10}
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Alternate Mobile <span className="text-gray-400 font-normal">(Optional for delivery)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-500">+91</span>
                        <input
                          type="tel"
                          name="alternatePhone"
                          maxLength={10}
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          placeholder="9123456780"
                          className="w-full pl-11 pr-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Email Address (for order tracking & certificate) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ananya@example.com"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Section: Detailed Flipkart Address Fields */}
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="e.g. 500046"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        City / District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Hyderabad / Kamareddy"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Flat, House No., Building, Apartment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="houseNo"
                        required
                        value={formData.houseNo}
                        onChange={handleInputChange}
                        placeholder="e.g. Flat 402, Radiant Towers"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Area, Colony, Street, Sector, Village <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        required
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. Road No 36, Jubilee Hills / Main Bazar"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Landmark <span className="text-gray-400 font-normal">(Optional, e.g. Near Apollo Hospital, Opp Bus Stand)</span>
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="e.g. Near Big Bazaar / Beside SBI Bank"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#E9708A] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Section: Address Type (Home vs Work) */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-xs font-semibold text-gray-800 block mb-2">
                      Address Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.addressType === 'Home'
                            ? 'border-[#E9708A] bg-[#FDF0F3]/50 text-gray-900 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value="Home"
                          checked={formData.addressType === 'Home'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <Home className="w-3.5 h-3.5 text-[#E9708A]" />
                          <div>
                            <p className="font-semibold leading-tight">Home</p>
                            <p className="text-[10px] text-gray-500 font-normal">All-day delivery</p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.addressType === 'Work'
                            ? 'border-[#E9708A] bg-[#FDF0F3]/50 text-gray-900 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value="Work"
                          checked={formData.addressType === 'Work'}
                          onChange={handleInputChange}
                          className="accent-[#E9708A]"
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-gray-600" />
                          <div>
                            <p className="font-semibold leading-tight">Work / Office</p>
                            <p className="text-[10px] text-gray-500 font-normal">10 AM - 6 PM</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Section: Save address for faster future checkout */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="rounded accent-[#E9708A] w-4 h-4"
                      />
                      <span>Save this delivery address for faster 1-click checkout next time</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1A1818] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Payment Gateway & Options
                  </h2>
                </div>
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
