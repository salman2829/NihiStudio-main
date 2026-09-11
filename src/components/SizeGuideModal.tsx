'use client';

import React from 'react';
import { X, Ruler, HelpCircle, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';

const RING_SIZES = [
  { us: 'US 5', india: 'Size 9-10', innerDiameter: '15.7 mm', circumference: '49.3 mm' },
  { us: 'US 6', india: 'Size 11-12', innerDiameter: '16.5 mm', circumference: '51.9 mm' },
  { us: 'US 7', india: 'Size 13-14', innerDiameter: '17.3 mm', circumference: '54.4 mm' },
  { us: 'US 8', india: 'Size 16-17', innerDiameter: '18.1 mm', circumference: '57.0 mm' },
  { us: 'US 9', india: 'Size 18-19', innerDiameter: '18.9 mm', circumference: '59.5 mm' },
  { us: 'US 10', india: 'Size 20-22', innerDiameter: '19.8 mm', circumference: '62.1 mm' },
  { us: 'US 11', india: 'Size 23-25', innerDiameter: '20.6 mm', circumference: '64.6 mm' },
  { us: 'US 12', india: 'Size 26-28', innerDiameter: '21.4 mm', circumference: '67.2 mm' },
];

const BANGLE_SIZES = [
  { size: '2.2 (Extra Small)', innerDiameter: '54.0 mm (2.12")', circumference: '169.6 mm' },
  { size: '2.4 (Small)', innerDiameter: '57.2 mm (2.25")', circumference: '179.6 mm' },
  { size: '2.6 (Medium - Standard)', innerDiameter: '60.3 mm (2.37")', circumference: '189.4 mm' },
  { size: '2.8 (Large)', innerDiameter: '63.5 mm (2.50")', circumference: '199.4 mm' },
  { size: '2.10 (Extra Large)', innerDiameter: '66.7 mm (2.62")', circumference: '209.4 mm' },
];

export default function SizeGuideModal() {
  const { isSizeModalOpen, setIsSizeModalOpen, sizeModalType, setSizeModalType } = useStore();

  if (!isSizeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSizeModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#EFE9E6] z-10 my-auto animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FDF0F3] flex items-center justify-center text-[#E9708A]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-gray-900">Find My Perfect Size</h3>
              <p className="text-xs text-gray-500">Accurate millimeter measurements & international conversions</p>
            </div>
          </div>
          <button
            onClick={() => setIsSizeModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-200/70 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSizeModalType('ring')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors text-center border-b-2 ${
              sizeModalType === 'ring'
                ? 'border-[#E9708A] text-[#E9708A] bg-[#FDF0F3]/30'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Ring Sizing Chart
          </button>
          <button
            onClick={() => setSizeModalType('bangle')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors text-center border-b-2 ${
              sizeModalType === 'bangle'
                ? 'border-[#E9708A] text-[#E9708A] bg-[#FDF0F3]/30'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Bangle & Bracelet Chart
          </button>
        </div>

        {/* Table Content */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {sizeModalType === 'ring' ? (
            <div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF7F5] text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">US Size</th>
                      <th className="p-3">India / Asian Size</th>
                      <th className="p-3">Inner Diameter</th>
                      <th className="p-3">Finger Circumference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {RING_SIZES.map((row, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">{row.us}</td>
                        <td className="p-3 text-gray-600">{row.india}</td>
                        <td className="p-3 text-gray-600 font-mono">{row.innerDiameter}</td>
                        <td className="p-3 text-gray-600 font-mono">{row.circumference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* How to measure tips */}
              <div className="mt-5 p-4 rounded-xl bg-[#FAF7F5] border border-gray-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide">
                  <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                  How to Measure at Home in 2 Minutes:
                </div>
                <ul className="text-xs text-gray-600 space-y-1.5 pl-5 list-disc">
                  <li>Wrap a thin strip of paper or non-elastic string comfortably around the base of your intended finger.</li>
                  <li>Mark the exact spot where the paper overlaps with a fine pen.</li>
                  <li>Measure the length against a ruler in millimeters (mm) to find your Circumference above.</li>
                  <li><strong>Pro Tip:</strong> Measure at room temperature when your fingers are at normal size. If between sizes, choose the larger size.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FAF7F5] text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Standard Bangle Size</th>
                      <th className="p-3">Inner Diameter (mm & inches)</th>
                      <th className="p-3">Hand Circumference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BANGLE_SIZES.map((row, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">{row.size}</td>
                        <td className="p-3 text-gray-600 font-mono">{row.innerDiameter}</td>
                        <td className="p-3 text-gray-600 font-mono">{row.circumference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-[#FAF7F5] border border-gray-200/80 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide">
                  <CheckCircle className="w-4 h-4 text-[#E9708A]" />
                  Bangle Measurement Method:
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Bring your thumb and little finger together as if putting on a bangle. Wrap a measuring tape around the widest part of your hand (across the knuckles). Compare the measurement to the hand circumference column.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Need personal assistance? Our stylists are here to help.</p>
          <button
            onClick={() => setIsSizeModalOpen(false)}
            className="px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
