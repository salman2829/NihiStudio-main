import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Truck, RefreshCw, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Nihi Studio Fine Jewelry',
  description: 'Terms and conditions for purchasing 925 sterling silver and fine jewelry from Nihi Studio.',
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-xs font-bold uppercase tracking-widest border border-[#F6D0D9]">
            <FileText className="w-4 h-4 text-[#E9708A]" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Please review these terms governing your purchase and use of the <strong>Nihi Studio</strong> online fine jewelry boutique.
          </p>
          <p className="text-xs text-gray-400">Effective Date: September 2026</p>
        </div>

        {/* Section 1: Authenticity & BIS Hallmarking */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" /> 1. Purity & BIS 925 Hallmarking Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            All silver jewelry sold on Nihi Studio is crafted in genuine <strong>925 Sterling Silver (92.5% pure silver)</strong> and stamped with the official 925 hallmark. Each piece includes an authenticity warranty card confirming purity standards.
          </p>
        </div>

        {/* Section 2: 6-Month Anti-Tarnish Warranty */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> 2. 6-Month Plating & Tarnish Warranty
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            We provide a <strong>6-Month Warranty</strong> against manufacturing defects and premature plating wear under normal care conditions. To claim warranty replacement, contact <a href="mailto:care@nihistudio.com" className="text-[#E9708A] font-bold">care@nihistudio.com</a> with your order number.
          </p>
        </div>

        {/* Section 3: Orders, Payments & COD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#E9708A]" /> 3. Shipping, Payments & Cash on Delivery
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            • <strong>Online Payments</strong>: Processed securely via Razorpay (UPI, Credit/Debit Cards, NetBanking).
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            • <strong>Cash on Delivery (COD)</strong>: Available across 19,000+ Indian PIN codes. Customers must provide an accurate mobile number and make payment upon package handover.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            • <strong>Delivery Timelines</strong>: Orders are dispatched within 24–48 business hours with tamper-evident insured packaging. Estimated delivery is 3–5 business days within India, and 5–8 business days for USA & international destinations.
          </p>
        </div>

        {/* Section 4: Returns & Replacements */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" /> 4. 30-Day Easy Returns & Exchanges
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Unused jewelry in original velvet packaging with certificates may be exchanged or returned within 30 days of delivery. Personalized/custom engraved items are eligible for size adjustment but cannot be returned for cash refund unless a defect is present upon arrival.
          </p>
        </div>

        {/* Section 5: Governing Law & Grievance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-lg font-serif font-bold text-gray-900">
            5. Governing Law & Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
