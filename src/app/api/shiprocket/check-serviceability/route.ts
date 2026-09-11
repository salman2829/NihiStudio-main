import { NextResponse } from 'next/server';
import { checkPincodeServiceability } from '@/lib/shiprocket';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const weight = parseFloat(searchParams.get('weight') || '0.3');

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return NextResponse.json(
        { serviceable: false, error: 'Please enter a valid 6-digit Indian pincode.' },
        { status: 400 }
      );
    }

    const result = await checkPincodeServiceability(pincode.trim(), weight);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { serviceable: false, error: error.message || 'Serviceability check failed' },
      { status: 500 }
    );
  }
}
