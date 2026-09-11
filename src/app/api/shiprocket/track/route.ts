import { NextResponse } from 'next/server';
import { trackShiprocketOrder } from '@/lib/shiprocket';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const awb = searchParams.get('awb');

    if (!orderId && !awb) {
      return NextResponse.json(
        { error: 'Order ID or AWB number is required to track shipment.' },
        { status: 400 }
      );
    }

    const result = await trackShiprocketOrder(
      awb ? awb.trim() : orderId!.trim(),
      awb ? 'awb' : 'order'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track shipment' },
      { status: 500 }
    );
  }
}
