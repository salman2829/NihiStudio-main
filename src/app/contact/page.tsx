'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, Check, HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I claim my 6-Month Anti-Tarnish Plating Warranty?',
    a: 'Every Nihi Studio product is covered under our complimentary 6-month replating guarantee. If your jewelry shows any discoloration or tarnishing within 6 months, simply message our concierge with your Order ID and photo. We arrange a free doorstep pickup, replate it with genuine rhodium/gold, and return it within 7 days.',
  },
  {
    q: 'What is your return & exchange policy?',
    a: 'We offer a 30-day hassle-free doorstep return and exchange on all standard items. Products must be in original condition with tags and authenticity cards intact.',
  },
  {
    q: 'Is custom engraving really permanent and free?',
    a: 'Yes! Custom engraving is executed with high-precision fiber lasers into the metal substrate and will never fade or scratch off. It is 100% complimentary on all eligible designs.',
  },
  {
    q: 'How long does express shipping take?',
    a: 'All orders are dispatched within 24 hours in tamper-evident velvet gift boxes. Deliveries across major Indian cities (Bengaluru, Mumbai, Delhi, Hyderabad) take 2–3 business days. US and international deliveries take 4–7 business days.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: 'order-tracking',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAF7F5]/40 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E9708A]">
            Client Concierge & Care
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mt-1">
            We&apos;re Here to Assist You
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Have questions about styling, order status, custom sizing, or warranty claims? Our concierge team is available 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE9E6] shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-gray-900">Message Received</h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Thank you, {formData.name}. Our jewelry concierge has received your request and will respond within 4 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-[#1A1818] text-white text-xs font-semibold uppercase rounded-xl hover:bg-black transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-serif font-bold text-gray-900 pb-2 border-b border-gray-100">
                  Send a Message to Our Concierge
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ananya Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E9708A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ananya@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E9708A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Order ID (if applicable)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="NIHI-104928"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E9708A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Inquiry Type *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E9708A]"
                    >
                      <option value="order-tracking">Order Tracking & Dispatch</option>
                      <option value="warranty-claim">6-Month Warranty & Replating</option>
                      <option value="custom-engraving">Custom Engraving & Bespoke Sizing</option>
                      <option value="returns">30-Day Returns & Exchanges</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe how our stylists or support team can assist you..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E9708A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Right: Quick Contacts & FAQs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Box */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Direct Channels
              </h3>

              <div className="space-y-3 text-xs text-gray-700">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F5]">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-semibold block text-gray-900">WhatsApp Concierge</span>
                    <span className="text-gray-500">+91 91234 56789 (10 AM – 8 PM IST)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F5]">
                  <Mail className="w-5 h-5 text-[#E9708A]" />
                  <div>
                    <span className="font-semibold block text-gray-900">Email Support</span>
                    <span className="text-gray-500">care@nihistudio.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF7F5]">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <div>
                    <span className="font-semibold block text-gray-900">Working Hours</span>
                    <span className="text-gray-500">Monday to Sunday, 9:00 AM – 9:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE9E6] shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
                <HelpCircle className="w-4 h-4 text-[#D4AF37]" /> Frequently Asked Questions
              </div>

              <div className="space-y-2">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-3 bg-[#FAF7F5] flex items-center justify-between text-left text-xs font-semibold text-gray-900"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-500 shrink-0 transition-transform ${
                          openFaqIndex === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="p-3 bg-white text-xs text-gray-600 leading-relaxed font-light">
                        {faq.a}
                      </div>
                    )}
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
