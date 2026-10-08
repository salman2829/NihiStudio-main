import { Product } from './types';
import { PRODUCTS } from './mock-data';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || process.env.WOOCOMMERCE_API_URL || 'https://lightsalmon-squid-120374.hostingersite.com';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_081a4a709e11de50c96e72c9d5d7177006277145';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_a42e25a6fd53611ae3a08a571d3a4e5d256513c0';

/**
 * Checks if live WooCommerce credentials are configured
 */
export function isWooCommerceConfigured(): boolean {
  return Boolean(WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET);
}

/**
 * Fetch all products from WooCommerce REST API (using URL query parameters for Hostinger compatibility)
 */
export async function getProducts(): Promise<Product[]> {
  if (!isWooCommerceConfigured()) {
    return PRODUCTS;
  }

  try {
    const auth = 'Basic ' + Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
    const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products?per_page=50&status=publish&consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.warn('WooCommerce API error response:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    // Map WooCommerce product format to Nihi Studio product model
    const mappedProducts: Product[] = data.map((item: any, index: number): Product => {
      const regularPrice = parseFloat(item.regular_price || item.price || '0');
      const salePrice = parseFloat(item.sale_price || item.price || '0');
      const priceUSD = Math.round((salePrice || regularPrice) / 80);
      const originalPriceUSD = Math.round((regularPrice || salePrice) / 80);

      const images = item.images?.length > 0 
        ? item.images.map((img: any) => img.src)
        : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop'];

      return {
        id: `wc-${item.id}`,
        name: item.name,
        slug: item.slug || `product-${item.id}`,
        subtitle: item.short_description?.replace(/<[^>]*>/g, '').slice(0, 100) || 'Handcrafted Fine Jewelry',
        category: (item.categories?.[0]?.name as any) || 'Rings',
        metal: '925 Sterling Silver',
        rating: parseFloat(item.average_rating) || 4.9,
        reviewCount: item.rating_count || 120,
        badge: item.featured ? 'Bestseller' : 'New Arrival',
        description: item.description?.replace(/<[^>]*>/g, '') || item.name,
        details: [
          'Solid 925 Sterling Silver with anti-tarnish rhodium / gold finish',
          'Hypoallergenic & Lead-free composition',
          'Authenticity Certificate & Luxury Gift Box Included',
        ],
        dimensions: 'Standard Comfort Fit',
        weightGrams: 3.2,
        warranty: '6-Month Plating & Authenticity Warranty',
        hallmark: 'BIS Hallmarked & 925 Stamped',
        allowsEngraving: true,
        engravingMaxChars: 12,
        hasSizes: item.attributes?.some((attr: any) => attr.name?.toLowerCase().includes('size')) || false,
        sizeType: 'ring',
        availableSizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10'],
        featuredImage: images[0],
        variants: [
          {
            id: `wc-var-${item.id}-silver`,
            name: 'Silver',
            colorHex: '#D8D8D8',
            priceINR: salePrice || regularPrice,
            originalPriceINR: regularPrice || salePrice,
            priceUSD: priceUSD,
            originalPriceUSD: originalPriceUSD,
            sku: item.sku || `NIHI-WC-${item.id}`,
            inStock: item.stock_status === 'instock',
            images: images,
          },
        ],
        priceBreakdown: {
          metalType: '925 Pure Silver (3.2g)',
          metalWeightGrams: 3.2,
          metalRatePerGramINR: 320,
          metalCostINR: Math.round((salePrice || regularPrice) * 0.4),
          gemstoneDescription: 'AAA+ Swiss Cut Crystals',
          gemstoneCostINR: Math.round((salePrice || regularPrice) * 0.3),
          makingChargesINR: Math.round((salePrice || regularPrice) * 0.2),
          gstINR: Math.round((salePrice || regularPrice) * 0.1),
          totalINR: salePrice || regularPrice,
        },
        reviews: PRODUCTS[0].reviews,
      };
    });

    return mappedProducts;
  } catch (error) {
    console.error('Failed to fetch from WooCommerce:', error);
    return [];
  }
}

/**
 * Fetch product categories dynamically from WooCommerce API
 */
export async function getCategories() {
  if (!isWooCommerceConfigured()) {
    return [];
  }

  try {
    const auth = 'Basic ' + Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
    const apiUrl = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products/categories?per_page=100&hide_empty=true&consumer_key=${WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${WOOCOMMERCE_CONSUMER_SECRET}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
      slug: cat.slug,
      image: cat.image?.src || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      itemCount: cat.count || 0,
      description: cat.description?.replace(/<[^>]*>/g, '') || `Handcrafted ${cat.name}`,
    }));
  } catch (err) {
    console.error('Error fetching WooCommerce categories:', err);
    return [];
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  const match = products.find((p) => p.slug === slug || p.id === slug || p.id === `wc-${slug}`);
  if (match) return match;

  return PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}
