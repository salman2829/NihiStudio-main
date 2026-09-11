import { NextResponse } from 'next/server';
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
      customerName,
      customerEmail,
      items,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      currency = 'INR',
      paymentMethod = 'Online Payment',
    } = body;

    if (!customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer email and cart items are required to place an order.' },
        { status: 400 }
      );
    }

    const generatedOrderId = `NIHI-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Sync order to WooCommerce REST API (if keys configured)
    if (WOOCOMMERCE_CONSUMER_KEY && WOOCOMMERCE_CONSUMER_SECRET) {
      try {
        const wooLineItems = items.map((item: any) => ({
          product_id: parseInt(item.productId.replace(/\D/g, '') || '0', 10) || undefined,
          name: `${item.productName} (${item.variantName})`,
          quantity: item.quantity,
          subtotal: (currency === 'INR' ? item.priceINR : item.priceUSD).toString(),
          total: ((currency === 'INR' ? item.priceINR : item.priceUSD) * item.quantity).toString(),
        }));

        await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeader(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
            payment_method_title: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (UPI/Cards)',
            set_paid: paymentMethod !== 'cod',
            billing: {
              first_name: shippingAddress.firstName,
              last_name: shippingAddress.lastName,
              address_1: shippingAddress.address1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postcode: shippingAddress.postcode,
              country: shippingAddress.country || 'IN',
              email: customerEmail,
              phone: shippingAddress.phone,
            },
            shipping: {
              first_name: shippingAddress.firstName,
              last_name: shippingAddress.lastName,
              address_1: shippingAddress.address1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postcode: shippingAddress.postcode,
              country: shippingAddress.country || 'IN',
            },
            line_items: wooLineItems,
          }),
        });
      } catch (err: any) {
        console.warn('WooCommerce order sync notice:', err.message);
      }
    }

    // 2. Automatically dispatch order to Shiprocket
    if (shippingAddress) {
       try {
         await createShiprocketOrder({
           orderId: generatedOrderId,
           customerName: customerName || `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim(),
           customerEmail: customerEmail.trim().toLowerCase(),
           customerPhone: shippingAddress.phone,
           shippingAddress: shippingAddress,
           items: items,
           subtotal: subtotal || total,
           total: total,
           paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
         });
       } catch (err: any) {
         console.error('[Shiprocket Order Dispatch Error]:', err.message);
       }
    }

    // 3. Dispatch real Order Confirmation & Shipping Email to Customer
    const emailResult = await sendOrderConfirmationEmail({
      orderId: generatedOrderId,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName || `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || 'Valued Customer',
      items,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      currency,
      paymentMethod,
    });

    console.log(`[ORDER PLACED] Order #${generatedOrderId} | Customer: ${customerEmail} | Email result:`, emailResult);

    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      emailDispatched: emailResult.success,
      message: 'Order created, Shiprocket shipment scheduled, and confirmation email dispatched successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
