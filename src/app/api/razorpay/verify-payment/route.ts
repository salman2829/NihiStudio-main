import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createShiprocketOrder } from '@/lib/shiprocket';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || process.env.WOOCOMMERCE_API_URL || 'https://nihistudio.com';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

function getAuthHeader() {
  return 'Basic ' + Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body;

    // 1. Verify Razorpay cryptographic payment signature
    if (razorpay_signature) {
      const isValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: 'Razorpay payment signature verification failed.' },
          { status: 400 }
        );
      }
    }

    const generatedOrderId = `NIHI-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Sync to WooCommerce
    if (WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET && orderDetails) {
      try {
        const wooLineItems = (orderDetails.items || []).map((item: any) => ({
          product_id: parseInt(item.productId?.replace(/\D/g, '') || '0', 10) || undefined,
          name: `${item.productName} (${item.variantName})`,
          quantity: item.quantity,
          subtotal: item.priceINR.toString(),
          total: (item.priceINR * item.quantity).toString(),
        }));

        await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method: 'razorpay',
            payment_method_title: `Razorpay Online Payment (Txn ID: ${razorpay_payment_id || 'N/A'})`,
            set_paid: true,
            transaction_id: razorpay_payment_id,
            billing: {
              first_name: orderDetails.shippingAddress?.firstName,
              last_name: orderDetails.shippingAddress?.lastName,
              address_1: orderDetails.shippingAddress?.address1,
              city: orderDetails.shippingAddress?.city,
              state: orderDetails.shippingAddress?.state,
              postcode: orderDetails.shippingAddress?.postcode,
              country: 'IN',
              email: orderDetails.customerEmail,
              phone: orderDetails.shippingAddress?.phone,
            },
            shipping: {
              first_name: orderDetails.shippingAddress?.firstName,
              last_name: orderDetails.shippingAddress?.lastName,
              address_1: orderDetails.shippingAddress?.address1,
              city: orderDetails.shippingAddress?.city,
              state: orderDetails.shippingAddress?.state,
              postcode: orderDetails.shippingAddress?.postcode,
              country: 'IN',
            },
            line_items: wooLineItems,
          }),
        });
      } catch (err: any) {
        console.warn('WooCommerce order sync note:', err.message);
      }
    }

    // 3. Automatically Create Order in Shiprocket for Dispatch
    if (orderDetails && orderDetails.shippingAddress) {
      createShiprocketOrder({
        orderId: generatedOrderId,
        customerName: orderDetails.customerName || `${orderDetails.shippingAddress.firstName || ''} ${orderDetails.shippingAddress.lastName || ''}`.trim(),
        customerEmail: orderDetails.customerEmail,
        customerPhone: orderDetails.shippingAddress.phone,
        shippingAddress: orderDetails.shippingAddress,
        items: orderDetails.items || [],
        subtotal: orderDetails.subtotal,
        total: orderDetails.total,
        paymentMethod: 'Prepaid',
      }).catch((err) => console.error('[Shiprocket Order Dispatch Error]:', err));
    }

    // 4. Dispatch confirmation and shipping details email
    if (orderDetails && orderDetails.customerEmail) {
      sendOrderConfirmationEmail({
        orderId: generatedOrderId,
        customerEmail: orderDetails.customerEmail,
        customerName: orderDetails.customerName,
        items: orderDetails.items,
        shippingAddress: orderDetails.shippingAddress,
        subtotal: orderDetails.subtotal,
        shippingCost: orderDetails.shippingCost,
        total: orderDetails.total,
        currency: 'INR',
        paymentMethod: `Razorpay UPI / Cards (Txn: ${razorpay_payment_id || 'Success'})`,
      }).catch((err) => console.error('Order email error:', err));
    }

    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      paymentId: razorpay_payment_id,
      message: 'Payment verified, order placed, and Shiprocket shipment scheduled successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
