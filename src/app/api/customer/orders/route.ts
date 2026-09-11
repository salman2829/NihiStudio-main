import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, getWooCustomerOrders } from '@/lib/woocommerce-auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('nihi_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = verifySessionToken(sessionCookie.value);
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const orders = await getWooCustomerOrders(session.id, session.email);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
