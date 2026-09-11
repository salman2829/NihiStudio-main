import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

/**
 * Get configured Razorpay client instance
 */
export function getRazorpayClient(): Razorpay | null {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a new Razorpay Order (amount in Rupees, converted to Paise)
 */
export async function createRazorpayOrder(params: {
  amountINR: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ success: boolean; orderId?: string; amount?: number; currency?: string; key?: string; error?: string }> {
  try {
    const rzp = getRazorpayClient();
    const key = RAZORPAY_KEY_ID;

    // Amount in Paise (e.g. ₹2499 -> 249900 paise)
    const amountInPaise = Math.round(params.amountINR * 100);

    if (!rzp) {
      // If Razorpay keys not yet set in .env.local, return simulated order for seamless testing
      return {
        success: true,
        orderId: `order_sim_${Math.floor(100000 + Math.random() * 900000)}`,
        amount: amountInPaise,
        currency: 'INR',
        key: key || 'rzp_test_simulated',
      };
    }

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount as number,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
    };
  } catch (error: any) {
    console.error('Razorpay order creation error:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to initialize Razorpay payment',
    };
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    // If running in test simulation mode without secret
    return true;
  }

  try {
    const text = `${params.orderId}|${params.paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === params.signature;
  } catch {
    return false;
  }
}
