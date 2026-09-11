import { NextResponse } from 'next/server';
import { createWooCustomer, createSessionToken } from '@/lib/woocommerce-auth';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and First Name are required.' },
        { status: 400 }
      );
    }

    const result = await createWooCustomer({
      email,
      firstName,
      lastName: lastName || '',
      password,
      phone,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Failed to create account.' },
        { status: 400 }
      );
    }

    const token = createSessionToken(result.user);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Account created successfully!',
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
