import { NextResponse } from 'next/server';
import { generateOtpChallenge, findWooCustomerByEmail } from '@/lib/woocommerce-auth';
import { sendRealEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || body.target || '').trim().toLowerCase();
    const name = body.name || body.firstName || '';
    const mode = body.mode || 'login'; // 'login' or 'register'

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check if user exists in WooCommerce when logging in
    if (mode === 'login') {
      const existingUser = await findWooCustomerByEmail(email);
      if (!existingUser) {
        return NextResponse.json(
          {
            error: 'No account found with this email. Please switch to "Create Account" tab.',
            notFound: true,
          },
          { status: 404 }
        );
      }
    }

    // Generate 6-digit numeric OTP with HMAC challenge token
    const { otp, challengeToken } = generateOtpChallenge(email);

    // Dispatch real email via Hostinger SMTP
    const emailResult = await sendRealEmail(email, otp, name);

    console.log(
      `[NIHI STUDIO OTP] Sent email OTP to: ${email} | Result: ${
        emailResult.success ? 'Delivered' : emailResult.message
      }`
    );

    const response = NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
      target: email,
      challengeToken,
      realDelivery: emailResult,
    });

    // Set secure short-lived cookie with challenge token (15 mins)
    response.cookies.set('nihi_otp_challenge', challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch verification email.' },
      { status: 500 }
    );
  }
}
