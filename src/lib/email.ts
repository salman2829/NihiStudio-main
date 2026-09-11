import nodemailer from 'nodemailer';
import { CartItem, CustomerAddress } from './types';

/**
 * Real Email Dispatcher for Nihi Studio
 * Optimized for Hostinger Business Email (smtp.hostinger.com)
 */

function getTransporter() {
  const smtpUser = process.env.SMTP_USER || 'care@nihistudio.com';
  const smtpPass = process.env.SMTP_PASS || 'nihiStudio@123';
  const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * 1. Send 6-Digit OTP Verification Email
 */
export async function sendRealEmail(
  toEmail: string,
  otp: string,
  userName?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER || 'care@nihistudio.com';
    const transporter = getTransporter();
    const greeting = userName ? `Hello ${userName},` : 'Hello,';

    const mailOptions = {
      from: `"Nihi Studio" <${smtpUser}>`,
      to: toEmail,
      subject: `${otp} is your Nihi Studio Verification Code`,
      text: `Your Nihi Studio verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nihi Studio Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #EFE9E6; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 35px 30px 20px 30px; background: linear-gradient(180deg, #FDF8F5 0%, #FFFFFF 100%);">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #1A1818; text-transform: uppercase;">NIHI STUDIO</h1>
                      <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">Everyday Fine Jewelry</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 35px 30px 35px; text-align: center;">
                      <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #1A1818;">${greeting}</p>
                      <p style="margin: 0 0 24px 0; font-size: 13px; color: #666666; line-height: 1.6;">
                        Use the 6-digit verification code below to complete your authentication with Nihi Studio:
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #FDF0F3; border: 1.5px dashed #E9708A; border-radius: 16px; padding: 18px 24px; display: inline-block; margin-bottom: 24px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E9708A; display: block; margin-left: 8px;">${otp}</span>
                      </div>
                      
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                        This code is valid for <strong>10 minutes</strong>.
                      </p>
                      <p style="margin: 0; font-size: 11px; color: #AAAAAA;">
                        If you did not request this code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FAF7F5; padding: 20px 30px; text-align: center; border-top: 1px solid #EFE9E6;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #555555;">
                        925 Sterling Silver & Lab-Grown Diamonds
                      </p>
                      <p style="margin: 0; font-size: 10px; color: #999999;">
                        © 2026 Nihi Studio (nihistudio.com). All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Email dispatched successfully (ID: ${info.messageId})` };
  } catch (err: any) {
    console.error('Hostinger SMTP delivery error:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * 2. Send Welcome & Account Creation Email
 */
export async function sendWelcomeEmail(
  toEmail: string,
  firstName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER || 'care@nihistudio.com';
    const transporter = getTransporter();

    const mailOptions = {
      from: `"Nihi Studio" <${smtpUser}>`,
      to: toEmail,
      subject: `Welcome to Nihi Studio, ${firstName || 'Patron'}! ✨`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #EFE9E6; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
                  <!-- Banner -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 25px 30px; background: linear-gradient(180deg, #FDF8F5 0%, #FFFFFF 100%);">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #1A1818; text-transform: uppercase;">NIHI STUDIO</h1>
                      <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">Everyday Fine Jewelry</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 20px 35px 35px 35px;">
                      <h2 style="font-size: 20px; font-weight: 700; color: #1A1818; margin: 0 0 12px 0;">
                        Welcome to the Nihi Studio Circle, ${firstName}!
                      </h2>
                      <p style="font-size: 14px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
                        Your member account has been created. You now have access to exclusive artisan fine jewelry drops, saved delivery preferences, and order tracking.
                      </p>

                      <!-- Perks Box -->
                      <div style="background-color: #FAF7F5; border-radius: 16px; padding: 20px; border: 1px solid #EFE9E6; margin-bottom: 25px;">
                        <h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1A1818; margin: 0 0 12px 0;">
                          Your Member Guarantees:
                        </h4>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #444;">
                              ✨ <strong>Official BIS 925 Hallmark</strong> stamped on every piece
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #444;">
                              🛡️ <strong>6-Month Anti-Tarnish & Plating Warranty</strong>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-size: 13px; color: #444;">
                              🎁 <strong>Luxury Velvet Box & Certificate</strong> included
                            </td>
                          </tr>
                        </table>
                      </div>

                      <div style="text-align: center;">
                        <a href="https://nihistudio.com/shop" style="display: inline-block; background-color: #1A1818; color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
                          Explore Fine Jewelry
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FAF7F5; padding: 20px 30px; text-align: center; border-top: 1px solid #EFE9E6;">
                      <p style="margin: 0; font-size: 11px; color: #888888;">
                        Have questions? Reply to this email or reach us at <strong>care@nihistudio.com</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Welcome email sent (ID: ${info.messageId})` };
  } catch (err: any) {
    console.error('Welcome email dispatch error:', err.message);
    return { success: false, message: err.message };
  }
}

/**
 * 3. Send Order Confirmation & Shipping Details Email (Supports COD and Online Payment)
 */
export async function sendOrderConfirmationEmail(params: {
  orderId: string | number;
  customerEmail: string;
  customerName: string;
  items: CartItem[];
  shippingAddress: CustomerAddress;
  total: number;
  subtotal: number;
  shippingCost: number;
  currency: string;
  paymentMethod: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER || 'care@nihistudio.com';
    const transporter = getTransporter();

    const currencySymbol = params.currency === 'INR' ? '₹' : '$';
    const isCod = params.paymentMethod?.toLowerCase().includes('cod') || params.paymentMethod?.toLowerCase().includes('cash');

    const itemsHtml = params.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #F0EBE6;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1A1818;">${item.productName}</p>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #888888;">
              Variant: ${item.variantName} ${item.size ? `• Size: ${item.size}` : ''} ${item.giftWrap ? '• Luxury Gift Wrap' : ''}
            </p>
          </td>
          <td align="center" style="padding: 12px 10px; font-size: 12px; color: #666; border-bottom: 1px solid #F0EBE6;">
            × ${item.quantity}
          </td>
          <td align="right" style="padding: 12px 0; font-size: 13px; font-weight: 700; color: #1A1818; border-bottom: 1px solid #F0EBE6;">
            ${currencySymbol}${(params.currency === 'INR' ? item.priceINR : item.priceUSD) * item.quantity}
          </td>
        </tr>
      `
      )
      .join('');

    const subjectText = isCod
      ? `Order Confirmed (Cash on Delivery): #${params.orderId} - Nihi Studio 💍`
      : `Order Confirmed: #${params.orderId} - Nihi Studio 💍`;

    const mailOptions = {
      from: `"Nihi Studio Orders" <${smtpUser}>`,
      to: params.customerEmail,
      cc: smtpUser, // Also send a copy to store owner
      subject: subjectText,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; background-color: #FAF7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F5; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #EFE9E6; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 35px 30px 20px 30px; background: linear-gradient(180deg, #FDF8F5 0%, #FFFFFF 100%);">
                      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #1A1818; text-transform: uppercase;">NIHI STUDIO</h1>
                      <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">Everyday Fine Jewelry</p>
                    </td>
                  </tr>

                  <!-- Confirmation Banner -->
                  <tr>
                    <td style="padding: 10px 35px 20px 35px; text-align: center;">
                      <div style="display: inline-block; background-color: ${isCod ? '#FEF3C7' : '#FDF0F3'}; color: ${isCod ? '#B45309' : '#E9708A'}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 20px; margin-bottom: 12px;">
                        ${isCod ? '💵 Cash on Delivery Confirmed' : '✨ Order Confirmed & Paid'}
                      </div>
                      <h2 style="font-size: 22px; font-weight: 700; color: #1A1818; margin: 0 0 8px 0;">
                        Thank You, ${params.customerName}!
                      </h2>
                      <p style="font-size: 13px; color: #666666; margin: 0;">
                        Your order <strong style="color: #1A1818; font-family: monospace;">#${params.orderId}</strong> has been received and is being prepared with our master jewellers for hallmarking and velvet packaging.
                      </p>

                      ${
                        isCod
                          ? `
                        <div style="background-color: #FFFBEB; border: 1.5px dashed #F59E0B; border-radius: 14px; padding: 16px; margin-top: 18px; text-align: left;">
                          <p style="margin: 0; font-size: 13px; font-weight: 700; color: #92400E;">
                            💵 Amount to Pay on Delivery: ${currencySymbol}${params.total.toLocaleString('en-IN')}
                          </p>
                          <p style="margin: 4px 0 0 0; font-size: 11px; color: #B45309;">
                            Please keep ${currencySymbol}${params.total.toLocaleString('en-IN')} in cash or ready via UPI QR scan when our delivery partner arrives at your doorstep.
                          </p>
                        </div>
                      `
                          : `
                        <div style="background-color: #F0FDF4; border: 1.5px dashed #22C55E; border-radius: 14px; padding: 14px; margin-top: 18px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #15803D;">
                            ✅ Payment Completed Online (${currencySymbol}${params.total.toLocaleString('en-IN')})
                          </p>
                        </div>
                      `
                      }
                    </td>
                  </tr>

                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 10px 35px 20px 35px;">
                      <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888888; margin: 0 0 10px 0; border-bottom: 1px solid #EFE9E6; padding-bottom: 8px;">
                        Items Ordered
                      </h3>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        ${itemsHtml}
                      </table>

                      <!-- Price Summary -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 15px;">
                        <tr>
                          <td style="padding: 4px 0; font-size: 12px; color: #666;">Subtotal:</td>
                          <td align="right" style="padding: 4px 0; font-size: 12px; color: #1A1818;">${currencySymbol}${params.subtotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-size: 12px; color: #666;">Insured Express Shipping:</td>
                          <td align="right" style="padding: 4px 0; font-size: 12px; color: #22C55E; font-weight: 600;">
                            ${params.shippingCost === 0 ? 'FREE' : `${currencySymbol}${params.shippingCost}`}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0 0 0; font-size: 15px; font-weight: 800; color: #1A1818; border-top: 1.5px solid #1A1818;">
                            ${isCod ? 'Total Payable on Delivery:' : 'Total Paid:'}
                          </td>
                          <td align="right" style="padding: 8px 0 0 0; font-size: 16px; font-weight: 800; color: #E9708A; border-top: 1.5px solid #1A1818;">
                            ${currencySymbol}${params.total.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Shipping & Delivery Details -->
                  <tr>
                    <td style="padding: 0 35px 30px 35px;">
                      <div style="background-color: #FAF7F5; border-radius: 16px; padding: 20px; border: 1px solid #EFE9E6;">
                        <h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4AF37; margin: 0 0 8px 0;">
                          📍 Delivery & Shipping Address
                        </h4>
                        <p style="font-size: 13px; font-weight: 700; color: #1A1818; margin: 0 0 4px 0;">
                          ${params.shippingAddress.firstName} ${params.shippingAddress.lastName}
                        </p>
                        <p style="font-size: 12px; color: #555555; line-height: 1.5; margin: 0 0 4px 0;">
                          ${params.shippingAddress.address1} ${params.shippingAddress.address2 || ''}
                        </p>
                        <p style="font-size: 12px; color: #555555; margin: 0 0 6px 0;">
                          ${params.shippingAddress.city}, ${params.shippingAddress.state} - ${params.shippingAddress.postcode}
                        </p>
                        <p style="font-size: 12px; color: #777777; margin: 0;">
                          📞 Contact Phone: ${params.shippingAddress.phone || 'Provided on checkout'}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Delivery Timeline & Hallmark Guarantee -->
                  <tr>
                    <td style="padding: 0 35px 30px 35px;">
                      <div style="border-left: 3px solid #E9708A; padding-left: 15px;">
                        <p style="font-size: 12px; font-weight: 700; color: #1A1818; margin: 0 0 4px 0;">
                          🚚 Estimated Dispatch: Within 24–48 Business Hours
                        </p>
                        <p style="font-size: 11px; color: #777777; margin: 0;">
                          Your jewelry will be securely shipped with tamper-evident seal, BIS 925 Authenticity Certificate, and Velvet Gift Box.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #FAF7F5; padding: 20px 30px; text-align: center; border-top: 1px solid #EFE9E6;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; color: #555555;">
                        Track your order anytime at <strong><a href="https://nihistudio.com/account?tab=orders" style="color: #E9708A; text-decoration: none;">nihistudio.com/account</a></strong>
                      </p>
                      <p style="margin: 0; font-size: 10px; color: #999999;">
                        Need help? Email us at care@nihistudio.com • © 2026 Nihi Studio
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, message: `Order confirmation email sent (ID: ${info.messageId})` };
  } catch (err: any) {
    console.error('Order confirmation email dispatch error:', err.message);
    return { success: false, message: err.message };
  }
}
