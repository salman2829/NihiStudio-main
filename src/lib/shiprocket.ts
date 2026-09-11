/**
 * Shiprocket API Client & Integration Library for NihiStudio
 * Documentation: https://apidocs.shiprocket.in/
 */

interface CachedToken {
  token: string;
  expiresAt: number; // timestamp ms
}

let memoryTokenCache: CachedToken | null = null;

/**
 * Obtain or reuse cached Shiprocket JWT authentication token
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn('[Shiprocket] Missing SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD in environment.');
    return null;
  }

  // Return cached token if valid (with 1 hour buffer)
  if (memoryTokenCache && memoryTokenCache.expiresAt > Date.now() + 3600 * 1000) {
    return memoryTokenCache.token;
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim(),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Shiprocket Auth Error]:', response.status, errData);
      return null;
    }

    const data = await response.json();
    const token = data.token;

    if (token) {
      // Shiprocket tokens are valid for 10 days (864000s)
      memoryTokenCache = {
        token,
        expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
      };
      return token;
    }
    return null;
  } catch (err: any) {
    console.error('[Shiprocket Auth Exception]:', err.message);
    return null;
  }
}

export interface ShiprocketOrderItem {
  name: string;
  sku?: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
}

export interface CreateShiprocketOrderParams {
  orderId: string;
  orderDate?: string; // YYYY-MM-DD HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    firstName?: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country?: string;
    phone?: string;
  };
  items: Array<{
    productId?: string | number;
    productName: string;
    variantName?: string;
    quantity: number;
    priceINR: number;
    sku?: string;
  }>;
  subtotal: number;
  total: number;
  paymentMethod?: 'Prepaid' | 'COD' | string;
  dimensions?: {
    length?: number; // cm
    breadth?: number; // cm
    height?: number; // cm
    weight?: number; // kg
  };
}

/**
 * Creates an ad-hoc order directly in Shiprocket for delivery dispatch
 */
export async function createShiprocketOrder(params: CreateShiprocketOrderParams) {
  const token = await getShiprocketToken();
  if (!token) {
    console.warn('[Shiprocket] Skipping order sync - unable to authenticate.');
    return { success: false, message: 'Authentication failed' };
  }

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Home';
  
  // Format current date: YYYY-MM-DD HH:mm
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const rawAddress = (params.shippingAddress.address1 || '').trim();
  const cleanAddress = rawAddress.length < 10 ? `${rawAddress || 'Main Street'}, Near City Center` : rawAddress;
  const cleanPhone = (params.shippingAddress.phone || params.customerPhone || '9876543210').replace(/\D/g, '').slice(-10) || '9876543210';
  const cleanPincode = (params.shippingAddress.postcode || '500046').replace(/\D/g, '').slice(0, 6) || '500046';
  const cleanCity = params.shippingAddress.city || 'Hyderabad';
  const cleanState = params.shippingAddress.state || 'Telangana';

  const orderItems = (params.items || []).map((item, idx) => ({
    name: `${item.productName || 'Fine Jewelry'}${item.variantName ? ` (${item.variantName})` : ''}`.slice(0, 50),
    sku: item.sku || `NIHI-${idx + 1}-${String(item.productId || 'JEWEL').replace(/\D/g, '') || '01'}`,
    units: item.quantity || 1,
    selling_price: Math.max(1, item.priceINR || 1),
    discount: 0,
    tax: 0,
  }));

  const payload = {
    order_id: params.orderId,
    order_date: params.orderDate || formattedDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName.slice(0, 30),
    billing_last_name: lastName.slice(0, 30),
    billing_address: cleanAddress.slice(0, 100),
    billing_address_2: (params.shippingAddress.address2 || '').slice(0, 100),
    billing_city: cleanCity.slice(0, 50),
    billing_pincode: cleanPincode,
    billing_state: cleanState.slice(0, 50),
    billing_country: params.shippingAddress.country || 'India',
    billing_email: params.customerEmail || 'care@nihistudio.com',
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: orderItems.length > 0 ? orderItems : [{
      name: 'Nihi Fine Jewelry Item',
      sku: 'NIHI-JW-01',
      units: 1,
      selling_price: Math.max(1, params.total || 1),
    }],
    payment_method: params.paymentMethod === 'COD' || params.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: Math.max(1, params.subtotal || params.total || 1),
    length: params.dimensions?.length || 10,
    breadth: params.dimensions?.breadth || 10,
    height: params.dimensions?.height || 5,
    weight: params.dimensions?.weight || 0.2, // 200g standard jewelry package
  };

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status_code === 400 || data.status_code === 422) {
      console.error('[Shiprocket Order Creation Error]:', data);
      return { success: false, error: data.message || 'Failed to create order in Shiprocket', raw: data };
    }

    console.log(`[Shiprocket] Order created successfully! Shiprocket Order ID: ${data.order_id}, Shipment ID: ${data.shipment_id}`);
    return {
      success: true,
      shiprocketOrderId: data.order_id,
      shipmentId: data.shipment_id,
      awbCode: data.awb_code || null,
      status: data.status,
      raw: data,
    };
  } catch (err: any) {
    console.error('[Shiprocket API Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Check courier serviceability & estimated delivery days for a pincode
 */
export async function checkPincodeServiceability(deliveryPincode: string, weightKg: number = 0.3) {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, message: 'Authentication failed' };
  }

  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '500046';

  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${encodeURIComponent(
      pickupPincode
    )}&delivery_postcode=${encodeURIComponent(deliveryPincode)}&weight=${weightKg}&cod=0`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || data.status === 404 || !data.data) {
      return {
        serviceable: false,
        message: data.message || 'Pincode is currently not serviceable',
      };
    }

    const availableCouriers = data.data.available_courier_companies || [];
    const isServiceable = availableCouriers.length > 0;

    // Find best courier & estimated delivery days
    let minDays = 3;
    let maxDays = 5;

    if (isServiceable) {
      const etas = availableCouriers
        .map((c: any) => parseInt(c.estimated_delivery_days, 10))
        .filter((d: number) => !isNaN(d) && d > 0);
      if (etas.length > 0) {
        minDays = Math.min(...etas);
        maxDays = Math.max(...etas);
      }
    }

    return {
      success: true,
      serviceable: isServiceable,
      courierCount: availableCouriers.length,
      estimatedDeliveryDays: `${minDays}-${maxDays} business days`,
      availableCouriers: availableCouriers.slice(0, 3).map((c: any) => ({
        name: c.courier_name,
        rate: c.rate,
        estimatedDeliveryDays: c.estimated_delivery_days,
      })),
    };
  } catch (err: any) {
    console.error('[Shiprocket Serviceability Exception]:', err.message);
    return { success: false, serviceable: false, error: err.message };
  }
}

/**
 * Track shipment live by AWB code or Order ID
 */
export async function trackShiprocketOrder(identifier: string, type: 'awb' | 'order' = 'order') {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, message: 'Authentication failed' };
  }

  try {
    const endpoint =
      type === 'awb'
        ? `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(identifier)}`
        : `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${encodeURIComponent(identifier)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return { success: true, trackingData: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
