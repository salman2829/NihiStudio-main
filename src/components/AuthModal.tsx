'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Edit3,
  Inbox,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalTab, setUser } = useStore();

  // Active tab: 'login' | 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Steps: 'input' | 'otp'
  const [step, setStep] = useState<'input' | 'otp'>('input');

  // Input states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // 6-Digit OTP states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [challengeToken, setChallengeToken] = useState('');
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Sync tab with store state when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab || 'login');
      setStep('input');
      setOtpDigits(['', '', '', '', '', '']);
      setChallengeToken('');
      setErrorMessage('');
      setSuccessMessage('');
      setCountdown(30);
      setCanResend(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (tab === 'register' && !firstName.trim()) {
      setErrorMessage('Please enter your First Name.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          name: firstName.trim(),
          mode: tab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      if (data.challengeToken) {
        setChallengeToken(data.challengeToken);
      }

      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);

      // Focus first OTP digit box
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send OTP. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit on all 6 digits
    const combinedOtp = newDigits.join('');
    if (combinedOtp.length === 6 && !newDigits.includes('')) {
      handleVerifyOtp(combinedOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpToVerify?: string) => {
    const code = otpToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code,
          challengeToken,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mode: tab,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');

      setUser(data.user);
      setSuccessMessage(data.message || 'Authenticated successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#FAF1EC] animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-[#FAF7F5] rounded-full transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-b from-[#FDF8F5] via-[#FFFBF9] to-white pt-8 pb-4 px-6 sm:px-8 text-center border-b border-[#FAF1EC]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FDF0F3] text-[#E9708A] mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            NIHI STUDIO
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest font-semibold">
            Fine Jewelry Member Portal
          </p>

          {/* Tab Switcher (Only on Input step) */}
          {step === 'input' && (
            <div className="flex bg-[#F5EFEA]/70 p-1 rounded-xl mt-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'login'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  tab === 'register'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-semibold">{successMessage}</p>
            </div>
          )}

          {/* STEP 1: Enter Email / Details */}
          {step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {tab === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      First Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Priya"
                        className="w-full pl-10 pr-3 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40 focus:border-[#E9708A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40 focus:border-[#E9708A]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F5] border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E9708A]/40 focus:border-[#E9708A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 bg-[#1A1818] hover:bg-[#E9708A] text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit Email OTP Entry */}
          {step === 'otp' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#FDF0F3] text-[#E9708A] flex items-center justify-center mx-auto mb-2">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500">
                  We sent a 6-digit code to{' '}
                  <strong className="text-gray-900 block mt-0.5">{email}</strong>
                </p>
                <button
                  onClick={() => setStep('input')}
                  className="inline-flex items-center gap-1 text-[11px] text-[#E9708A] hover:underline font-semibold mt-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Email Address
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 text-center font-mono text-base font-bold bg-[#FAF7F5] border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E9708A] focus:border-[#E9708A] transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1A1818] hover:bg-[#E9708A] text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{tab === 'register' ? 'Verify & Create Account' : 'Verify & Sign In'}</span>
                )}
              </button>

              {/* Resend & Inbox Note */}
              <div className="text-center pt-2 space-y-2">
                <div>
                  {canResend ? (
                    <button
                      onClick={() => handleSendOtp()}
                      className="inline-flex items-center gap-1.5 text-xs text-[#E9708A] hover:underline font-semibold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Resend code in <strong className="text-gray-600 font-mono">{countdown}s</strong>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-normal">
                  💡 Tip: If you don&apos;t see the email within 15 seconds, check your <strong>Spam / Junk / Promotions</strong> tab.
                </p>
              </div>
            </div>
          )}

          {/* Trust Highlights */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              Secure 256-bit Encryption
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E9708A]" />
              925 Pure Silver Member
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
