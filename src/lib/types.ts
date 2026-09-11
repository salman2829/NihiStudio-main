export type CurrencyType = 'INR' | 'USD';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Silver", "Rose Gold", "Yellow Gold"
  colorHex: string; // e.g. "#C0C0C0", "#E9708A", "#D4AF37"
  priceINR: number;
  originalPriceINR: number;
  priceUSD: number;
  originalPriceUSD: number;
  sku: string;
  inStock: boolean;
  images: string[];
}

export interface PriceBreakdown {
  metalType: string;
  metalWeightGrams: number;
  metalRatePerGramINR: number;
  metalCostINR: number;
  gemstoneDescription: string;
  gemstoneCostINR: number;
  makingChargesINR: number;
  gstINR: number;
  totalINR: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  userImage?: string;
  productVariant?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  category: 'Rings' | 'Earrings' | 'Necklaces' | 'Bracelets' | "Men's" | 'Silver 925' | 'Gifts';
  metal: '925 Sterling Silver' | '18K Gold Plated' | '14K Rose Gold' | 'Lab-grown Diamonds';
  rating: number;
  reviewCount: number;
  badge?: 'Bestseller' | 'New Arrival' | 'Trending' | 'Editor\'s Pick' | 'Sale' | '₹1 Test Mode';
  description: string;
  details: string[];
  dimensions?: string;
  weightGrams?: number;
  warranty: string; // e.g. "6-Month Plating & Authenticity Warranty"
  hallmark: string; // e.g. "BIS Hallmarked & 925 Stamp"
  allowsEngraving: boolean;
  engravingMaxChars?: number;
  hasSizes: boolean;
  sizeType?: 'ring' | 'bangle' | 'necklace';
  availableSizes?: string[];
  variants: ProductVariant[];
  priceBreakdown: PriceBreakdown;
  reviews: Review[];
  featuredImage: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (productId-variantId-size-engraving)
  productId: string;
  productName: string;
  slug: string;
  variantId: string;
  variantName: string;
  image: string;
  size?: string;
  engravingText?: string;
  giftWrap: boolean;
  priceINR: number;
  priceUSD: number;
  quantity: number;
}

export interface FilterOptions {
  category?: string;
  metal?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  pincode?: string;
  postcode?: string;
  houseNo?: string; // Flat, House no., Building, Company, Apartment
  streetAddress?: string; // Area, Colony, Street, Sector, Village
  landmark?: string; // Landmark (Optional, e.g. Near Apollo Hospital)
  city: string;
  state: string;
  country: string;
  addressType?: 'Home' | 'Work'; // Home (All day delivery) | Work (Delivery 10 AM - 6 PM)
  address1: string;
  address2?: string;
}

export interface User {
  id: number | string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  role?: string;
  billing?: CustomerAddress;
  shipping?: CustomerAddress;
}

export interface OrderItem {
  id: number;
  name: string;
  productId: number;
  quantity: number;
  subtotal: string;
  total: string;
  price: number;
  image?: string;
}

export interface Order {
  id: number;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency: string;
  dateCreated: string;
  total: string;
  shippingTotal: string;
  discountTotal: string;
  lineItems: OrderItem[];
  shipping: CustomerAddress;
  billing: CustomerAddress;
  paymentMethodTitle: string;
  trackingNumber?: string;
}
