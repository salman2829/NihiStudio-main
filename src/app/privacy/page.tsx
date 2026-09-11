import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, UserCheck, Trash2, Mail, FileText, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy & DPDP Act Compliance | Nihi Studio',
  description: 'Digital Personal Data Protection Act (DPDP Act 2023) Compliance Notice, Privacy Policy, and Data Principal Rights at Nihi Studio.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF0F3] text-[#E9708A] text-xs font-bold uppercase tracking-widest border border-[#F6D0D9]">
            <ShieldCheck className="w-4 h-4 text-[#E9708A]" /> DPDP Act 2023 Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            This Privacy Notice is issued in compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India and global data privacy best practices.
          </p>
          <p className="text-xs text-gray-400">Last updated: September 2026 • Version 2.4</p>
        </div>

        {/* DPDP Act Key Highlights Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#D4AF37]" /> Your Data Privacy Guarantees under DPDP Act 2023
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            At <strong>Nihi Studio</strong>, we process your personal data solely for legitimate purposes related to fine jewelry purchases, authentic BIS hallmarking certification, insured delivery dispatch, and post-purchase warranties. We do not sell, rent, or trade your personal data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Purpose Limitation
              </p>
              <p className="text-[11px] text-gray-500">Collected exclusively for order fulfillment and verified warranty tracking.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Data Minimisation
              </p>
              <p className="text-[11px] text-gray-500">Only essential delivery and invoicing details are requested.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Right to Erasure
              </p>
              <p className="text-[11px] text-gray-500">Easily request deletion of your account and personal records anytime.</p>
            </div>
          </div>
        </div>

        {/* Section 1: Data We Collect */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide text-xs text-[#E9708A]">
            Section 1 • Notice of Personal Data Collected
          </h3>
          <h4 className="text-lg font-serif font-semibold text-gray-900">What Personal Information We Collect</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            When you register, authenticate via OTP, or place an order on Nihi Studio, we collect:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 list-disc pl-5">
            <li><strong>Identity & Contact Data</strong>: Full name, verified email address, contact telephone number.</li>
            <li><strong>Shipping & Delivery Data</strong>: Street address, city, state, postal PIN code, and landmark for courier partner dispatch (Blue Dart, Delhivery, Shiprocket, DHL).</li>
            <li><strong>Order & Warranty Data</strong>: Jewelry specifications, ring sizes, personalized engraving messages, BIS hallmark certificates, and invoice numbers.</li>
            <li><strong>Payment Transaction Data</strong>: We <em>never</em> store your card numbers or UPI PINs. All online payments are processed through RBI-authorized, PCI-DSS Level 1 compliant gateways (Razorpay). We only receive transaction confirmation status and transaction IDs.</li>
          </ul>
        </div>

        {/* Section 2: Purpose of Processing */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide text-xs text-[#E9708A]">
            Section 2 • Lawful Basis & Specified Purpose
          </h3>
          <h4 className="text-lg font-serif font-semibold text-gray-900">How We Use Your Personal Data</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            In accordance with Section 4 and Section 7 of the DPDP Act 2023, your personal data is processed for the following specified purposes:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
            <p>1. <strong>Fulfillment & Delivery</strong>: Dispatching your certified fine jewelry orders with tracking notifications.</p>
            <p>2. <strong>Authentication & Security</strong>: Verifying your identity through secure 6-digit Email OTPs.</p>
            <p>3. <strong>Warranty & Authenticity Services</strong>: Validating your 6-month anti-tarnish and BIS 925 hallmarking claims.</p>
            <p>4. <strong>Legal & Tax Compliance</strong>: Generating GST tax invoices and regulatory shipping documentation.</p>
          </div>
        </div>

        {/* Section 3: Data Principal Rights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide text-xs text-[#E9708A]">
            Section 3 • Data Principal Rights (Your Legal Rights)
          </h3>
          <h4 className="text-lg font-serif font-semibold text-gray-900">Your Rights Under the DPDP Act 2023</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-[#E9708A]" /> Right to Access & Correction
              </div>
              <p className="text-[11px] text-gray-600">
                You can review, update, or edit your saved addresses and profile information at any time directly in your <Link href="/account" className="text-[#E9708A] underline font-semibold">Customer Dashboard</Link>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                <Trash2 className="w-4 h-4 text-red-500" /> Right to Erasure / Deletion
              </div>
              <p className="text-[11px] text-gray-600">
                You have the legal right to withdraw consent and request the complete deletion of your account and personal data by emailing our Data Privacy Desk.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                <FileText className="w-4 h-4 text-[#D4AF37]" /> Right to Data Portability
              </div>
              <p className="text-[11px] text-gray-600">
                You can request a machine-readable summary of all personal data held in connection with your account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
                <Mail className="w-4 h-4 text-emerald-600" /> Right to Grievance Redressal
              </div>
              <p className="text-[11px] text-gray-600">
                You have the right to register concerns or complaints with our designated Grievance Officer, who will respond within 48-72 business hours.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Grievance Officer Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9E6] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide text-xs text-[#E9708A]">
            Section 4 • Grievance Redressal Officer (Mandatory under DPDP Act)
          </h3>
          <h4 className="text-lg font-serif font-semibold text-gray-900">Designated Grievance & Privacy Officer</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            In compliance with Section 13 of the DPDP Act 2023, if you have any questions, requests to exercise your rights, or privacy grievances, you may contact our Grievance Officer directly:
          </p>

          <div className="p-5 rounded-2xl bg-[#FDF8F5] border border-[#F6D0D9] space-y-2 text-xs text-gray-800">
            <p><strong>Designation:</strong> Data Protection & Grievance Redressal Officer</p>
            <p><strong>Entity:</strong> Nihi Studio (Everyday Fine Jewelry)</p>
            <p><strong>Official Email:</strong> <a href="mailto:care@nihistudio.com" className="text-[#E9708A] font-bold hover:underline">care@nihistudio.com</a></p>
            <p><strong>Website:</strong> <a href="https://nihistudio.com" className="text-gray-900 hover:underline">nihistudio.com</a></p>
            <p><strong>Turnaround Time:</strong> Initial acknowledgment within 24 hours; full resolution within 7 business days.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1818] hover:bg-black text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-all shadow-md"
          >
            Return to Jewelry Boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
