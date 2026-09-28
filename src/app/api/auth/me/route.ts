import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, getWooCustomerById } from '@/lib/woocommerce-auth';
import { User } from '@/lib/types';

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

    // Refresh live customer data from WooCommerce or local store
    const liveUser = await getWooCustomerById(session.id);
    if (liveUser) {
      return NextResponse.json({ user: liveUser });
    }

    // Resilient fallback from signed session payload
    const sessionUser: User = {
      id: session.id,
      email: session.email,
      firstName: session.firstName || '',
      lastName: session.lastName || '',
      displayName: session.displayName || session.firstName || session.email?.split('@')[0] || 'Member',
      role: session.role || 'customer',
      avatarUrl: session.avatarUrl,
      billing: session.billing,
      shipping: session.shipping,
    };

    return NextResponse.json({ user: sessionUser });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}

