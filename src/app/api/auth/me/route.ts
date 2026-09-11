import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, getWooCustomerById } from '@/lib/woocommerce-auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('nihi_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ user: null });
    }

    const session = verifySessionToken(sessionCookie.value);
    if (!session || !session.id) {
      return NextResponse.json({ user: null });
    }

    // Refresh live customer data from WooCommerce
    const user = await getWooCustomerById(session.id);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}
