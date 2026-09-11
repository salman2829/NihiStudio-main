import { Product } from './types';
import { PRODUCTS } from './mock-data';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || process.env.WOOCOMMERCE_API_URL;
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

/**
 * Checks if live WooCommerce credentials are configured
 */
export function isWooCommerceConfigured(): boolean {
  return Boolean(WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET);
}

/**
 * Fetch all products from WooCommerce REST API or fallback to mock data
 */
export async function getProducts(): Promise<Product[]> {
  if (!isWooCommerceConfigured()) {
    return PRODUCTS;
  }

  try {
    const auth = Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
    const response = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/products?per_page=50&status=publish`, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn('WooCommerce API error, falling back to mock catalog:', response.statusText);
      return PRODUCTS;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return PRODUCTS;
    }

    // Map WooCommerce product format to Nihi Studio product model
    return data.map((item: any, index: number): Product => {
      const regularPrice = parseFloat(item.regular_price || item.price || '2999');
      const salePrice = parseFloat(item.sale_price || item.price || '2499');
      const priceUSD = Math.round(salePrice / 80);
      const originalPriceUSD = Math.round(regularPrice / 80);

      const images = item.images?.length > 0 
        ? item.images.map((img: any) => img.src)
        : [PRODUCTS[index % PRODUCTS.length].featuredImage];

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
            priceINR: salePrice,
            originalPriceINR: regularPrice,
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
          metalCostINR: 1024,
          gemstoneDescription: 'AAA+ Swiss Cut Crystals',
          gemstoneCostINR: 850,
          makingChargesINR: 500,
          gstINR: 125,
          totalINR: salePrice,
        },
        reviews: PRODUCTS[0].reviews,
      };
    });
  } catch (error) {
    console.error('Failed to fetch from WooCommerce:', error);
    return PRODUCTS;
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}
