'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  MapPin,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Order, CustomerAddress } from '@/lib/types';

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'orders' | 'addresses' | 'profile' | 'privacy') || 'orders';

  const { user, setUser, logout, setIsAuthModalOpen, currency } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'privacy'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [erasureRequested, setErasureRequested] = useState(false);

  // Address edit state
  const [shippingAddr, setShippingAddr] = useState<CustomerAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'India',
    phone: '',
  });

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');

      if (user.shipping) {
        setShippingAddr({
          firstName: user.shipping.firstName || user.firstName || '',
          lastName: user.shipping.lastName || user.lastName || '',
          address1: user.shipping.address1 || '',
          address2: user.shipping.address2 || '',
          city: user.shipping.city || '',
          state: user.shipping.state || '',
          postcode: user.shipping.postcode || '',
          country: user.shipping.country || 'India',
          phone: user.shipping.phone || user.billing?.phone || '',
        });
      }
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/customer/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          shipping: shippingAddr,
          billing: shippingAddr,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center mx-auto mb-5 shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Sign In to Nihi Studio
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
          Access your order tracking, authenticity certificates, and saved delivery preferences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xs mx-auto">
          <button
            onClick={() => setIsAuthModalOpen(true, 'login')}
            className="w-full py-3.5 bg-[#1A1818] hover:bg-[#E9708A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
          >
            Sign In to Account
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true, 'register')}
            className="w-full py-3.5 bg-[#FAF7F5] hover:bg-gray-100 text-gray-800 text-xs font-semibold uppercase tracking-wider rounded-xl border border-gray-200 transition-all cursor-pointer"
          >
            Create New Account
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#F0EBE6]">
            <Truck className="w-5 h-5 text-[#E9708A] mb-2" />
            <h4 className="text-xs font-bold text-gray-900 mb-1">Live Order Tracking</h4>
            <p className="text-[11px] text-gray-500">Track your pure silver and lab diamond jewelry dispatch in real-time.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#F0EBE6]">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-2" />
            <h4 className="text-xs font-bold text-gray-900 mb-1">6-Month Warranty Card</h4>
            <p className="text-[11px] text-gray-500">Digital hallmark & anti-tarnish certificate stored with every purchase.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#FAF7F5] border border-[#F0EBE6]">
            <Sparkles className="w-5 h-5 text-[#E9708A] mb-2" />
            <h4 className="text-xs font-bold text-gray-900 mb-1">VIP Priority Concierge</h4>
            <p className="text-[11px] text-gray-500">Early access to limited handcrafted artisan silver drops.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F5] via-[#FFF9F9] to-[#FAF7F5] p-6 sm:p-8 rounded-3xl border border-[#F0EBE6] mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> Nihi Silver Patron
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome, {user.firstName || user.displayName}!
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-xl border border-red-100 shadow-2xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#1A1818] text-white shadow-xs'
                : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Orders & Tracking</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'addresses'
                ? 'bg-[#1A1818] text-white shadow-xs'
                : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#1A1818] text-white shadow-xs'
                : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserIcon className="w-4 h-4" />
              <span>Account Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#1A1818] text-white shadow-xs'
                : 'bg-[#FAF7F5] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Privacy & DPDP Rights</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-gray-900">Your Orders</h2>
                <button
                  onClick={fetchOrders}
                  className="text-xs text-[#E9708A] hover:underline font-semibold"
                >
                  Refresh
                </button>
              </div>

              {loadingOrders ? (
                <div className="py-16 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-[#E9708A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs">Fetching your order history...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-[#FAF7F5] rounded-3xl border border-[#F0EBE6]">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
                  <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                    When you place orders for 925 hallmarked fine silver, they will appear here with live tracking.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1818] hover:bg-[#E9708A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-colors"
                  >
                    Explore Jewelry Collection
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-[#E9708A]/40 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-900">Order #{ord.id}</p>
                          <p className="text-[11px] text-gray-400">
                            Placed on {new Date(ord.dateCreated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : ord.status === 'processing'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span className="font-serif text-sm font-bold text-gray-900">
                            ₹{parseFloat(ord.total).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="py-4 space-y-3">
                        {ord.lineItems.map((li) => (
                          <div key={li.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-800">
                              {li.name} <span className="text-gray-400">× {li.quantity}</span>
                            </span>
                            <span className="text-gray-600 font-semibold">₹{parseFloat(li.total).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> BIS 925 Hallmarked
                        </span>
                        {ord.trackingNumber && (
                          <span className="text-[#E9708A] font-semibold">
                            Tracking: {ord.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 & 3: ADDRESSES & PROFILE FORM */}
          {(activeTab === 'addresses' || activeTab === 'profile') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
              <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
                {activeTab === 'addresses' ? 'Default Shipping Address' : 'Account Details'}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Saved details will automatically pre-fill your future checkouts.
              </p>

              {saveSuccess && (
                <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="font-semibold">Profile details updated successfully!</p>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">
                    Shipping Details
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                        Street Address / Flat No.
                      </label>
                      <input
                        type="text"
                        value={shippingAddr.address1}
                        onChange={(e) => setShippingAddr({ ...shippingAddr, address1: e.target.value })}
                        placeholder="House / Apartment, Street"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingAddr.city}
                          onChange={(e) => setShippingAddr({ ...shippingAddr, city: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          value={shippingAddr.state}
                          onChange={(e) => setShippingAddr({ ...shippingAddr, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                          PIN / ZIP Code
                        </label>
                        <input
                          type="text"
                          value={shippingAddr.postcode}
                          onChange={(e) => setShippingAddr({ ...shippingAddr, postcode: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingAddr.phone || ''}
                        onChange={(e) => setShippingAddr({ ...shippingAddr, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#1A1818] hover:bg-[#E9708A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: Privacy & DPDP Act Data Rights */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-[10px] font-bold uppercase tracking-widest border border-[#F6D0D9] mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> DPDP Act 2023 Compliance
                </div>
                <h3 className="text-base font-bold text-gray-900">Your Privacy & Data Principal Rights</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Under the <strong>Digital Personal Data Protection Act, 2023</strong>, you have full control over your digital personal data stored with Nihi Studio.
                </p>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">Personal Data on File</h4>
                  <ul className="text-[11px] text-gray-600 space-y-1">
                    <li>• <strong>Name:</strong> {user.displayName || user.firstName || 'Not provided'}</li>
                    <li>• <strong>Email:</strong> {user.email}</li>
                    <li>• <strong>Saved Addresses:</strong> {user.shipping?.address1 ? `${user.shipping.city}, ${user.shipping.postcode}` : 'No saved address'}</li>
                    <li>• <strong>Total Orders:</strong> {orders.length} orders</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">Security & Encryption</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    All authentication is handled via cryptographic stateless HMAC OTPs. No credit/debit card numbers are ever stored on our servers.
                  </p>
                </div>
              </div>

              {/* Export Data Action */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Download Account Data (Data Portability)</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Download a complete machine-readable JSON copy of all personal and order data associated with your account.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ user, orders }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `nihi_studio_data_${user.email.split('@')[0]}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-4 py-2 bg-[#1A1818] hover:bg-black text-white text-[11px] font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ml-3"
                  >
                    Export Data (JSON)
                  </button>
                </div>
              </div>

              {/* Delete / Erasure Request */}
              <div className="p-5 rounded-2xl border border-red-100 bg-red-50/40 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-red-700">Request Account Deletion (Right to Erasure)</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Under Section 12 of the DPDP Act 2023, you can request complete erasure of your customer profile, authentication tokens, and delivery records.
                  </p>
                </div>

                {erasureRequested ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Erasure request logged. Our Grievance Desk will confirm via {user.email} within 48 hours.
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setErasureRequested(true);
                      window.location.href = `mailto:care@nihistudio.com?subject=DPDP%20Act%20Account%20Erasure%20Request%20-%20${encodeURIComponent(user.email)}&body=Dear%20Grievance%20Officer,%0A%0AI%20hereby%20request%20the%20complete%20deletion%20of%20my%20account%20and%20personal%20data%20under%20the%20Digital%20Personal%20Data%20Protection%20Act,%202023.%0A%0AAccount%20Email:%20${encodeURIComponent(user.email)}`;
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Request Account Erasure
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
