import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import SizeGuideModal from '@/components/SizeGuideModal';
import AuthModal from '@/components/AuthModal';
import CookieBanner from '@/components/CookieBanner';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
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
  openGraph: {
    title: 'Nihi Studio | Everyday Fine Jewelry',
    description: 'Everyday fine jewelry crafted in pure 925 silver and 18K gold.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
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
