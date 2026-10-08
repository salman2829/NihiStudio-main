import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { User, Order, CustomerAddress } from './types';

const WOOCOMMERCE_API_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL || process.env.WOOCOMMERCE_API_URL || 'https://lightsalmon-squid-120374.hostingersite.com';
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_081a4a709e11de50c96e72c9d5d7177006277145';
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_a42e25a6fd53611ae3a08a571d3a4e5d256513c0';

const SESSION_SECRET = process.env.SESSION_SECRET || 'nihi-studio-luxury-jewelry-session-secret-key-2026';

function getAuthHeader() {
  return 'Basic ' + Buffer.from(`${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64');
}

const COMMON_FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 NihiStudio/1.0',
  'Accept': 'application/json',
};

// ==========================================
// Local User Store & Persistent Fallback
// ==========================================

declare global {
  // eslint-disable-next-line no-var
  var __NIHI_USER_MAP__: Map<string, User> | undefined;
}

const getGlobalUserMap = (): Map<string, User> => {
  if (!globalThis.__NIHI_USER_MAP__) {
    globalThis.__NIHI_USER_MAP__ = new Map<string, User>();
    loadUsersFromDisk();
  }
  return globalThis.__NIHI_USER_MAP__;
};

function getStorageFilePath(): string {
  return path.join(process.cwd(), '.user_store.json');
}

function loadUsersFromDisk() {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed: Record<string, User> = JSON.parse(data);
      if (globalThis.__NIHI_USER_MAP__) {
        Object.entries(parsed).forEach(([key, val]) => {
          globalThis.__NIHI_USER_MAP__!.set(key.toLowerCase(), val);
        });
      }
    }
  } catch (e) {
    // Ignore file read error on restricted environments
  }
}

function saveUsersToDisk() {
  try {
    const map = globalThis.__NIHI_USER_MAP__;
    if (!map) return;
    const obj: Record<string, User> = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    fs.writeFileSync(getStorageFilePath(), JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    // Ignore file write error
  }
}

export function saveLocalUser(user: User): void {
  const map = getGlobalUserMap();
  map.set(user.email.toLowerCase(), user);
  map.set(String(user.id), user);
  saveUsersToDisk();
}

export function getLocalUserByEmail(email: string): User | null {
  const map = getGlobalUserMap();
  return map.get(email.trim().toLowerCase()) || null;
}

export function getLocalUserById(id: string | number): User | null {
  const map = getGlobalUserMap();
  return map.get(String(id)) || null;
}

// ==========================================
// Session Management
// ==========================================

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
    role: user.role || 'customer',
    avatarUrl: user.avatarUrl,
    billing: user.billing,
    shipping: user.shipping,
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

// ==========================================
// Customer Creation & Management
// ==========================================

/**
 * Create a new customer in WooCommerce with graceful fallback to local storage
 */
export async function createWooCustomer(params: {
  email: string;
  firstName: string;
  lastName?: string;
  password?: string;
  phone?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();
  const firstName = params.firstName.trim() || normalizedEmail.split('@')[0];
  const lastName = params.lastName?.trim() || '';

  // 1. Try creating customer in WooCommerce if API is configured
  if (WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY) {
    try {
      const username = normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000);
      const body: Record<string, any> = {
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        username: username,
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          phone: params.phone?.trim() || '',
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
        },
      };

      if (params.password) {
        body.password = params.password;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          ...COMMON_FETCH_HEADERS,
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const user = mapWooCustomerToUser(data);
        saveLocalUser(user);
        return { success: true, user };
      } else {
        const errorText = await res.text();
        let parsedErr: any = {};
        try {
          parsedErr = JSON.parse(errorText);
        } catch {}

        if (parsedErr.code === 'registration-error-email-exists') {
          // If customer already exists in WooCommerce, fetch or construct user profile
          const existingUser = await findWooCustomerByEmail(normalizedEmail);
          if (existingUser) {
            saveLocalUser(existingUser);
            return { success: true, user: existingUser };
          }
        }
        console.warn('[WooCommerce Customer Create Non-OK]:', res.status, parsedErr.message || errorText);
      }
    } catch (err: any) {
      console.warn('[WooCommerce Customer Create Error]:', err.message);
    }
  }

  // 2. Fallback: Create user in local resilient store
  const localUser: User = {
    id: `nihi_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    email: normalizedEmail,
    firstName: firstName,
    lastName: lastName,
    displayName: `${firstName} ${lastName}`.trim() || normalizedEmail.split('@')[0],
    role: 'customer',
    billing: {
      firstName: firstName,
      lastName: lastName,
      email: normalizedEmail,
      phone: params.phone?.trim() || '',
      address1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'IN',
    },
    shipping: {
      firstName: firstName,
      lastName: lastName,
      address1: '',
      city: '',
      state: '',
      postcode: '',
      country: 'IN',
    },
  };

  saveLocalUser(localUser);
  return { success: true, user: localUser };
}

// ==========================================
// OTP Challenge System
// ==========================================

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

export function generateAndSaveOtp(target: string, type: 'email' | 'phone'): string {
  const { otp } = generateOtpChallenge(target);
  return otp;
}

export function verifyOtp(target: string, inputOtp: string): boolean {
  return verifyOtpChallenge(target, inputOtp);
}

// ==========================================
// Customer Lookup & Queries
// ==========================================

/**
 * Find customer by email or phone in WooCommerce / Local Store
 */
export async function findWooCustomerByPhoneOrEmail(target: string): Promise<User | null> {
  const cleanTarget = target.trim();
  const isEmail = cleanTarget.includes('@');

  if (isEmail) {
    return findWooCustomerByEmail(cleanTarget);
  }

  // Search local map first
  const map = getGlobalUserMap();
  const cleanDigits = cleanTarget.replace(/\D/g, '');
  for (const user of map.values()) {
    const userPhone = (user.billing?.phone || '').replace(/\D/g, '');
    if (userPhone && userPhone.includes(cleanDigits.slice(-10))) {
      return user;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers?search=${encodeURIComponent(cleanTarget)}&per_page=10`, {
      headers: {
        ...COMMON_FETCH_HEADERS,
        Authorization: getAuthHeader(),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const matched = data.find((cust: any) => {
      const custPhone = (cust.billing?.phone || '').replace(/\D/g, '');
      return custPhone && custPhone.includes(cleanDigits.slice(-10));
    }) || data[0];

    const mapped = mapWooCustomerToUser(matched);
    saveLocalUser(mapped);
    return mapped;
  } catch {
    return null;
  }
}

/**
 * Find customer by email in WooCommerce / Local Store
 */
export async function findWooCustomerByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Try WooCommerce API if configured
  if (WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(cleanEmail)}`, {
        headers: {
          ...COMMON_FETCH_HEADERS,
          Authorization: getAuthHeader(),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const user = mapWooCustomerToUser(data[0]);
          saveLocalUser(user);
          return user;
        }
      }
    } catch {
      // Ignore network / forbidden error, fall back to local store
    }
  }

  // 2. Check local store
  return getLocalUserByEmail(cleanEmail);
}

/**
 * Fetch customer by ID in WooCommerce / Local Store
 */
export async function getWooCustomerById(id: number | string): Promise<User | null> {
  // Check local store first
  const local = getLocalUserById(id);
  if (local) return local;

  if (WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY && typeof id === 'number') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers/${id}`, {
        headers: {
          ...COMMON_FETCH_HEADERS,
          Authorization: getAuthHeader(),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const user = mapWooCustomerToUser(data);
        saveLocalUser(user);
        return user;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

/**
 * Update customer profile / address
 */
export async function updateWooCustomer(id: number | string, updateData: Partial<User>): Promise<User | null> {
  let existing = getLocalUserById(id);

  const updatedUser: User = {
    id: id,
    email: updateData.email || existing?.email || '',
    firstName: updateData.firstName || existing?.firstName || '',
    lastName: updateData.lastName || existing?.lastName || '',
    displayName: `${updateData.firstName || existing?.firstName || ''} ${updateData.lastName || existing?.lastName || ''}`.trim() || existing?.displayName || '',
    avatarUrl: updateData.avatarUrl || existing?.avatarUrl,
    role: existing?.role || 'customer',
    billing: {
      firstName: updateData.billing?.firstName || updateData.firstName || existing?.billing?.firstName || '',
      lastName: updateData.billing?.lastName || updateData.lastName || existing?.billing?.lastName || '',
      company: updateData.billing?.company || existing?.billing?.company || '',
      address1: updateData.billing?.address1 || existing?.billing?.address1 || '',
      address2: updateData.billing?.address2 || existing?.billing?.address2 || '',
      city: updateData.billing?.city || existing?.billing?.city || '',
      state: updateData.billing?.state || existing?.billing?.state || '',
      postcode: updateData.billing?.postcode || existing?.billing?.postcode || '',
      country: updateData.billing?.country || existing?.billing?.country || 'IN',
      email: updateData.billing?.email || updateData.email || existing?.billing?.email || '',
      phone: updateData.billing?.phone || existing?.billing?.phone || '',
    },
    shipping: {
      firstName: updateData.shipping?.firstName || updateData.firstName || existing?.shipping?.firstName || '',
      lastName: updateData.shipping?.lastName || updateData.lastName || existing?.shipping?.lastName || '',
      company: updateData.shipping?.company || existing?.shipping?.company || '',
      address1: updateData.shipping?.address1 || existing?.shipping?.address1 || '',
      address2: updateData.shipping?.address2 || existing?.shipping?.address2 || '',
      city: updateData.shipping?.city || existing?.shipping?.city || '',
      state: updateData.shipping?.state || existing?.shipping?.state || '',
      postcode: updateData.shipping?.postcode || existing?.shipping?.postcode || '',
      country: updateData.shipping?.country || existing?.shipping?.country || 'IN',
    },
  };

  saveLocalUser(updatedUser);

  // Try updating WooCommerce if id is a WooCommerce customer ID
  if (WOOCOMMERCE_API_URL && WOOCOMMERCE_CONSUMER_KEY && typeof id === 'number') {
    try {
      const payload: Record<string, any> = {};
      if (updateData.firstName) payload.first_name = updateData.firstName;
      if (updateData.lastName) payload.last_name = updateData.lastName;
      if (updateData.billing) payload.billing = updatedUser.billing;
      if (updateData.shipping) payload.shipping = updatedUser.shipping;

      await fetch(`${WOOCOMMERCE_API_URL}/wp-json/wc/v3/customers/${id}`, {
        method: 'PUT',
        headers: {
          ...COMMON_FETCH_HEADERS,
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Local update is already saved
    }
  }

  return updatedUser;
}

/**
 * Fetch customer's orders
 */
export async function getWooCustomerOrders(customerId: number | string, customerEmail?: string): Promise<Order[]> {
  try {
    let url = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders?customer=${customerId}&per_page=20`;
    let res = await fetch(url, {
      headers: {
        ...COMMON_FETCH_HEADERS,
        Authorization: getAuthHeader(),
      },
      next: { revalidate: 0 },
    });

    if (!res.ok && customerEmail) {
      url = `${WOOCOMMERCE_API_URL}/wp-json/wc/v3/orders?search=${encodeURIComponent(customerEmail)}&per_page=20`;
      res = await fetch(url, {
        headers: {
          ...COMMON_FETCH_HEADERS,
          Authorization: getAuthHeader(),
        },
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

