import { NextResponse } from 'next/server';
import { getShiprocketToken, checkPincodeServiceability } from '@/lib/shiprocket';

export async function GET() {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not authenticate with Shiprocket. Please check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env.local',
        emailConfigured: !!process.env.SHIPROCKET_EMAIL,
        passwordConfigured: !!process.env.SHIPROCKET_PASSWORD,
        pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'Home',
        pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '500046',
      }, { status: 401 });
    }

    // Try checking a test pincode serviceability (e.g., 500046 or 110001)
    const testPincode = '500046';
    const serviceability = await checkPincodeServiceability(testPincode);

    return NextResponse.json({
      status: 'success',
      message: 'Shiprocket API connected and authenticated successfully!',
      tokenGenerated: true,
      pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'Home',
      pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '500046',
      sampleServiceabilityCheck: serviceability,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}
