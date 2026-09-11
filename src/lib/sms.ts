/**
 * SMS Dispatcher for Nihi Studio
 * Supports Fast2SMS (India), 2Factor.in (India), and Twilio (Global)
 */

export async function sendRealSMS(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> {
  const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10); // Extract 10-digit number for India

  // 1. Check Fast2SMS
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return { success: true, message: 'SMS delivered via Fast2SMS' };
      } else {
        console.warn('Fast2SMS error:', data.message);
      }
    } catch (err: any) {
      console.error('Fast2SMS dispatch error:', err.message);
    }
  }

  // 2. Check 2Factor.in
  const twoFactorKey = process.env.TWO_FACTOR_API_KEY;
  if (twoFactorKey) {
    try {
      const url = `https://2factor.in/API/V1/${twoFactorKey}/SMS/${cleanPhone}/${otp}/NIHI_STUDIO_OTP`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status === 'Success') {
        return { success: true, message: 'SMS delivered via 2Factor' };
      }
    } catch (err: any) {
      console.error('2Factor dispatch error:', err.message);
    }
  }

  // 3. Check Twilio (Global SMS)
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${cleanPhone}`;
      const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const body = new URLSearchParams({
        To: fullPhone,
        From: twilioFrom,
        Body: `Your Nihi Studio verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json();
      if (response.ok && !data.error_code) {
        return { success: true, message: 'SMS delivered via Twilio' };
      }
    } catch (err: any) {
      console.error('Twilio dispatch error:', err.message);
    }
  }

  return {
    success: false,
    message: 'No active SMS Gateway configured in .env.local (e.g. FAST2SMS_API_KEY or TWO_FACTOR_API_KEY).',
  };
}
