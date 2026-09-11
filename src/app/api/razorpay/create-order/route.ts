import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amountINR, receipt = 'rcpt_nihi' } = body;

    if (!amountINR || amountINR <= 0) {
      return NextResponse.json(
        { error: 'Valid amount in INR is required.' },
        { status: 400 }
      );
    }

    const result = await createRazorpayOrder({
      amountINR: parseFloat(amountINR),
      receipt: `${receipt}_${Date.now()}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create Razorpay order' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
