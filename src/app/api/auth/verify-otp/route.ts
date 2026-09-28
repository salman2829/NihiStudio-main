import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyOtpChallenge,
  findWooCustomerByEmail,
  createWooCustomer,
  createSessionToken,
} from '@/lib/woocommerce-auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || body.target || '').trim().toLowerCase();
    const otp = (body.otp || '').trim();
    const firstName = (body.firstName || '').trim();
    const lastName = (body.lastName || '').trim();
    const mode = body.mode || 'login';

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('nihi_otp_challenge')?.value;
    const challengeToken = body.challengeToken || challengeCookie;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    // 1. Verify OTP code via HMAC Challenge
    const isValid = verifyOtpChallenge(email, otp, challengeToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code. Please check your email for the latest code.' },
        { status: 400 }
      );
    }

    // 2. Fetch or Create Customer in WooCommerce / Local Store
    let user = await findWooCustomerByEmail(email);
    let isNewCustomer = false;

    if (!user) {
      isNewCustomer = true;
      const createRes = await createWooCustomer({
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
      });

      if (!createRes.success || !createRes.user) {
        return NextResponse.json(
          { error: createRes.error || 'Failed to create customer profile.' },
          { status: 400 }
        );
      }

      user = createRes.user;

      // Dispatch welcome email asynchronously
      sendWelcomeEmail(email, firstName || user.firstName).catch((err) =>
        console.error('Failed to send welcome email:', err)
      );
    } else if (mode === 'register' && firstName) {
      // User exists and provided a name during registration, update if missing
      if (!user.firstName || user.firstName === email.split('@')[0]) {
        user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        user.displayName = `${firstName} ${lastName || user.lastName || ''}`.trim();
      }
    }

    // 3. Generate Session Token
    const token = createSessionToken(user);

    const message = isNewCustomer
      ? 'Account created successfully!'
      : mode === 'register'
      ? 'Account verified! Welcome back.'
      : 'Welcome back!';

    const response = NextResponse.json({
      success: true,
      user,
      message,
    });

    // Clear the short-lived challenge cookie
    response.cookies.delete('nihi_otp_challenge');

    // Set 30-day session cookie
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
      { error: error.message || 'Verification error' },
      { status: 500 }
    );
  }
}
