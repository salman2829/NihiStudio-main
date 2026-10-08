import { NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/woocommerce';

export async function GET() {
  try {
    const products = await getProducts();
    const categories = await getCategories();
    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error('Error in /api/products route:', error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
