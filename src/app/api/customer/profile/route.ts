import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, updateWooCustomer } from '@/lib/woocommerce-auth';

export async function PUT(request: Request) {
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

    const body = await request.json();
    const updatedUser = await updateWooCustomer(session.id, body);

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
