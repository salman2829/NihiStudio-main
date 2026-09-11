import crypto from 'crypto';
import { User, Order, CustomerAddress } from './types';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || process.env.WOOCOMMERCE_API_URL || 'https://nihistudio.com';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

const SESSION_SECRET = process.env.SESSION_SECRET || 'nihi-studio-luxury-jewelry-session-secret-key-2026';

function getAuthHeader() {
  return 'Basic ' + Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
}

/**
 * Sign session payload to a secure tamper-proof token
 */
export function createSessionToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Payload, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(b64Payload).digest('base64url');
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a new customer in WooCommerce
 */
export async function createWooCustomer(params: {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  phone?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const username = params.email.split('@')[0] + Math.floor(Math.random() * 1000);
    const body: Record<string, any> = {
      email: params.email.trim().toLowerCase(),
      first_name: params.firstName.trim(),
      last_name: params.lastName.trim(),
      username: username,
      billing: {
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
        email: params.email.trim().toLowerCase(),
        phone: params.phone?.trim() || '',
      },
      shipping: {
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
      },
    };

    if (params.password) {
      body.password = params.password;
    }

    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.code === 'registration-error-email-exists') {
        return { success: false, error: 'An account with this email address already exists. Please log in.' };
      }
      return { success: false, error: data.message || 'Failed to create account.' };
    }

    const user = mapWooCustomerToUser(data);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error to WooCommerce' };
  }
}

interface OtpRecord {
  otp: string;
  expiresAt: number;
  type: 'email' | 'phone';
}

declare global {
  // eslint-disable-next-line no-var
  var __NIHI_OTP_STORE__: Map<string, OtpRecord> | undefined;
}

const getGlobalOtpStore = (): Map<string, OtpRecord> => {
  if (!globalThis.__NIHI_OTP_STORE__) {
    globalThis.__NIHI_OTP_STORE__ = new Map<string, OtpRecord>();
  }
  return globalThis.__NIHI_OTP_STORE__;
};

// Cryptographic HMAC OTP Challenge System (Stateless & immune to multi-worker / serverless restarts)
export function generateOtpChallenge(target: string): { otp: string; challengeToken: string } {
  const normalizedTarget = target.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const dataToSign = `${normalizedTarget}:${otp}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(dataToSign).digest('hex');
  const challengeToken = `${expiresAt}.${signature}`;

  // Also save to globalThis store for fallback
  const store = getGlobalOtpStore();
  store.set(normalizedTarget, { otp, expiresAt, type: 'email' });

  return { otp, challengeToken };
}

/**
 * Verify OTP using HMAC challenge token or in-memory fallback
 */
export function verifyOtpChallenge(
  target: string,
  inputOtp: string,
  challengeToken?: string
): boolean {
  const normalizedTarget = target.trim().toLowerCase();
  const cleanOtp = inputOtp.trim().replace(/\D/g, '');

  if (cleanOtp.length !== 6) return false;

  // 1. First verify using HMAC token if provided
  if (challengeToken && challengeToken.includes('.')) {
    try {
      const [expiresAtStr, expectedSignature] = challengeToken.split('.');
      const expiresAt = parseInt(expiresAtStr, 10);

      if (expiresAt > Date.now()) {
        const computedSignature = crypto
          .createHmac('sha256', SESSION_SECRET)
          .update(`${normalizedTarget}:${cleanOtp}:${expiresAt}`)
          .digest('hex');

        if (computedSignature === expectedSignature) {
          console.log(`[OTP HMAC SUCCESS] Verified for ${normalizedTarget}`);
          // Clear global store entry if present
          getGlobalOtpStore().delete(normalizedTarget);
          return true;
        }
      } else {
        console.warn(`[OTP HMAC EXPIRED] Expired for ${normalizedTarget}`);
      }
    } catch (err: any) {
      console.warn(`[OTP HMAC ERROR] ${err.message}`);
    }
  }

  // 2. Fallback to global store
  const store = getGlobalOtpStore();
  const record = store.get(normalizedTarget);

  if (record && record.expiresAt > Date.now() && record.otp === cleanOtp) {
    store.delete(normalizedTarget);
    console.log(`[OTP STORE SUCCESS] Verified for ${normalizedTarget}`);
    return true;
  }

  console.warn(`[OTP VERIFY FAILED] Could not verify code ${cleanOtp} for ${normalizedTarget}`);
  return false;
}

/**
 * Legacy wrapper
 */
export function generateAndSaveOtp(target: string, type: 'email' | 'phone'): string {
  const { otp } = generateOtpChallenge(target);
  return otp;
}

export function verifyOtp(target: string, inputOtp: string): boolean {
  return verifyOtpChallenge(target, inputOtp);
}

/**
 * Find customer by email or phone in WooCommerce
 */
export async function findWooCustomerByPhoneOrEmail(target: string): Promise<User | null> {
  try {
    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes('@');

    if (isEmail) {
      return findWooCustomerByEmail(cleanTarget);
    }

    // Search by phone or username
    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers?search=${encodeURIComponent(cleanTarget)}&per_page=10`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    // Check if billing phone matches
    const cleanDigits = cleanTarget.replace(/\D/g, '');
    const matched = data.find((cust: any) => {
      const custPhone = (cust.billing?.phone || '').replace(/\D/g, '');
      return custPhone && custPhone.includes(cleanDigits.slice(-10));
    }) || data[0];

    return mapWooCustomerToUser(matched);
  } catch {
    return null;
  }
}

/**
 * Find customer by email in WooCommerce
 */
export async function findWooCustomerByEmail(email: string): Promise<User | null> {
  try {
    const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers?email=${cleanEmail}`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return mapWooCustomerToUser(data[0]);
  } catch {
    return null;
  }
}

/**
 * Fetch customer by ID in WooCommerce
 */
export async function getWooCustomerById(id: number | string): Promise<User | null> {
  try {
    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers/${id}`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return mapWooCustomerToUser(data);
  } catch {
    return null;
  }
}

/**
 * Update customer profile / address in WooCommerce
 */
export async function updateWooCustomer(id: number | string, updateData: Partial<User>): Promise<User | null> {
  try {
    const payload: Record<string, any> = {};
    if (updateData.firstName) payload.first_name = updateData.firstName;
    if (updateData.lastName) payload.last_name = updateData.lastName;

    if (updateData.billing) {
      payload.billing = {
        first_name: updateData.billing.firstName || updateData.firstName,
        last_name: updateData.billing.lastName || updateData.lastName,
        address_1: updateData.billing.address1 || '',
        address_2: updateData.billing.address2 || '',
        city: updateData.billing.city || '',
        state: updateData.billing.state || '',
        postcode: updateData.billing.postcode || '',
        country: updateData.billing.country || 'IN',
        email: updateData.billing.email || updateData.email,
        phone: updateData.billing.phone || '',
      };
    }

    if (updateData.shipping) {
      payload.shipping = {
        first_name: updateData.shipping.firstName || updateData.firstName,
        last_name: updateData.shipping.lastName || updateData.lastName,
        address_1: updateData.shipping.address1 || '',
        address_2: updateData.shipping.address2 || '',
        city: updateData.shipping.city || '',
        state: updateData.shipping.state || '',
        postcode: updateData.shipping.postcode || '',
        country: updateData.shipping.country || 'IN',
      };
    }

    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return mapWooCustomerToUser(data);
  } catch {
    return null;
  }
}

/**
 * Fetch customer's orders from WooCommerce
 */
export async function getWooCustomerOrders(customerId: number | string, customerEmail?: string): Promise<Order[]> {
  try {
    let url = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders?customer=${customerId}&per_page=20`;
    let res = await fetch(url, {
      headers: { Authorization: getAuthHeader() },
      next: { revalidate: 0 },
    });

    if (!res.ok && customerEmail) {
      // Fallback search by email
      url = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders?search=${encodeURIComponent(customerEmail)}&per_page=20`;
      res = await fetch(url, {
        headers: { Authorization: getAuthHeader() },
      });
    }

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((ord: any): Order => ({
      id: ord.id,
      status: ord.status,
      currency: ord.currency,
      dateCreated: ord.date_created,
      total: ord.total,
      shippingTotal: ord.shipping_total,
      discountTotal: ord.discount_total,
      paymentMethodTitle: ord.payment_method_title || 'Online Payment',
      trackingNumber: ord.meta_data?.find((m: any) => m.key?.toLowerCase().includes('tracking'))?.value,
      lineItems: (ord.line_items || []).map((li: any) => ({
        id: li.id,
        name: li.name,
        productId: li.product_id,
        quantity: li.quantity,
        subtotal: li.subtotal,
        total: li.total,
        price: li.price,
        image: li.image?.src || '',
      })),
      shipping: mapAddress(ord.shipping),
      billing: mapAddress(ord.billing),
    }));
  } catch {
    return [];
  }
}

function mapAddress(raw: any): CustomerAddress {
  if (!raw) {
    return {
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'IN',
    };
  }
  return {
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    company: raw.company || '',
    address1: raw.address_1 || '',
    address2: raw.address_2 || '',
    city: raw.city || '',
    state: raw.state || '',
    postcode: raw.postcode || '',
    country: raw.country || 'IN',
    email: raw.email || '',
    phone: raw.phone || '',
  };
}

function mapWooCustomerToUser(item: any): User {
  return {
    id: item.id,
    email: item.email,
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    displayName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username || item.email.split('@')[0],
    avatarUrl: item.avatar_url,
    role: item.role || 'customer',
    billing: mapAddress(item.billing),
    shipping: mapAddress(item.shipping),
  };
}
