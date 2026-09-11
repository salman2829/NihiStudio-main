'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const METALS = [
  {
    title: '925 Sterling Silver',
    purity: 'Pure 92.5% Silver',
    description: 'Anti-tarnish rhodium barrier with brilliant cool white luster.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    link: '/shop?metal=925+Sterling+Silver',
    badge: 'Popular',
  },
  {
    title: '18K Gold Plated',
    purity: 'Thick Gold Vermeil',
    description: 'Rich warm golden radiance over pure sterling silver core.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    link: '/shop?metal=18K+Gold+Plated',
    badge: 'Luxury',
  },
  {
    title: '14K Rose Gold',
    purity: 'Blush Copper Gold Alloy',
    description: 'Romantic pink warmth engineered for everyday flattering shine.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    link: '/shop?metal=14K+Rose+Gold',
    badge: 'Trending',
  },
  {
    title: 'Lab-Grown Diamonds',
    purity: 'VVS Clarity / E-F Color',
    description: 'Conflict-free ethical luxury with supreme diamond fire.',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop',
    link: '/shop?metal=Lab-grown+Diamonds',
    badge: 'Certified',
  },
];

export default function ShopByMetal() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1">
            Precious Metals & Gems
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-gray-900">
            Shop by Metal & Gemstone
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Choose your signature metal finish engineered to never fade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {METALS.map((m, idx) => (
            <Link
              key={idx}
              href={m.link}
              className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-[#EFE9E6] flex flex-col justify-end p-5"
            >
              {/* Background Image */}
              <Image
                src={m.image}
                alt={m.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-gray-900">
                  {m.badge}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 text-white space-y-1">
                <p className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                  {m.purity}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-medium text-white group-hover:text-rose-200 transition-colors">
                    {m.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#E9708A] group-hover:scale-110 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 pt-1 font-light">
                  {m.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
