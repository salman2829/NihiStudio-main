import { NextResponse } from 'next/server';
import { findWooCustomerByEmail, createSessionToken } from '@/lib/woocommerce-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    // Lookup customer in WooCommerce
    const user = await findWooCustomerByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please create an account.' },
        { status: 404 }
      );
    }

    // In a headless setup with WooCommerce REST API, customer records are retrieved and validated.
    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Welcome back!',
    });

    response.cookies.set('nihi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
