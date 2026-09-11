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

    // 2. Fetch or Create Customer in WooCommerce
    let user = await findWooCustomerByEmail(email);
    let isNewCustomer = false;

    if (mode === 'register' && !user) {
      isNewCustomer = true;
      const createRes = await createWooCustomer({
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
      });

      if (!createRes.success || !createRes.user) {
        return NextResponse.json(
          { error: createRes.error || 'Failed to create customer profile in WooCommerce.' },
          { status: 400 }
        );
      }

      user = createRes.user;

      // Dispatch welcome email asynchronously
      sendWelcomeEmail(email, firstName || user.firstName).catch((err) =>
        console.error('Failed to send welcome email:', err)
      );
    } else if (!user) {
      // If user not found during login, create customer profile
      const createRes = await createWooCustomer({
        email,
        firstName: email.split('@')[0],
        lastName: '',
      });
      if (createRes.user) {
        user = createRes.user;
      } else {
        return NextResponse.json(
          { error: 'User account not found.' },
          { status: 404 }
        );
      }
    }

    // 3. Generate Session Token
    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      message: mode === 'register' ? 'Account created successfully!' : 'Welcome back!',
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
