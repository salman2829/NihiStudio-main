'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { INSTAGRAM_POSTS } from '@/lib/mock-data';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function InstagramReel() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E9708A] uppercase tracking-widest mb-1">
            <InstagramIcon className="w-4 h-4" /> Join our community
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-gray-900">
            Styled by You on Instagram
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Tag <span className="font-semibold text-gray-800">@nihistudio_official</span> or #NihiSparkle to be featured
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-xs hover:shadow-lg transition-all"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wide">{post.handle}</span>
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-200 mb-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-300" /> {post.likes}
                  </div>
                  <p className="text-xs text-white/90 line-clamp-2">{post.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
