import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import SizeGuideModal from '@/components/SizeGuideModal';
import AuthModal from '@/components/AuthModal';
import CookieBanner from '@/components/CookieBanner';

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nihi Studio | Everyday Fine Jewelry - 925 Hallmarked Silver & 18K Gold',
  description:
    'Discover everyday luxury fine jewelry by Nihi Studio. Handcrafted in 925 pure sterling silver, 18K gold vermeil, and lab-grown diamonds with 6-month anti-tarnish warranty.',
  keywords: [
    'fine jewelry',
    '925 silver jewelry',
    'solitaire rings',
    'giva jewelry',
    'lab grown diamonds',
    'gold plated necklace',
    'tennis bracelet',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Nihi Studio | Everyday Fine Jewelry',
    description: 'Everyday fine jewelry crafted in pure 925 silver and 18K gold.',
    type: 'website',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#1A1818] antialiased selection:bg-[#FDF0F3] selection:text-[#E9708A]">
        <AnnouncementBar />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />

        {/* Global Drawers & Modals */}
        <CartDrawer />
        <SearchModal />
        <SizeGuideModal />
        <AuthModal />
        <CookieBanner />
      </body>
    </html>
  );
}
