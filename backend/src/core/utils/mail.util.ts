import { ENV } from '@config/env.config.ts';

export interface SendEmailPayload {
  to_email: string;
  to_name?: string;
  subject?: string;
  message?: string;
  otp?: string;
  [key: string]: any;
}

/**
 * Sends an email using EmailJS REST API.
 */
export const sendEmail = async ({
  to_email,
  to_name = 'Collector',
  subject,
  message,
  otp,
  ...extra
}: SendEmailPayload): Promise<boolean> => {
  const serviceId = ENV.EMAILJS_SERVICE_ID;
  const templateId = ENV.EMAILJS_TEMPLATE_ID;
  const publicKey = ENV.EMAILJS_PUBLIC_KEY;
  const privateKey = ENV.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Configuration missing (serviceId, templateId, or publicKey). Email skipped.');
    return false;
  }

  const expiryDate = new Date(Date.now() + 15 * 60 * 1000);
  const formattedTime = expiryDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const payload: Record<string, any> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email,
      email: to_email,
      user_email: to_email,
      recipient_email: to_email,
      reply_to: to_email,
      to: to_email,
      to_name,
      user_name: to_name,
      name: to_name,
      subject: subject || 'Torque Toyzz Verification Code',
      message: message || (otp ? `Your one-time passcode is ${otp}. It expires in 15 minutes.` : ''),
      otp: otp || '',
      passcode: otp || '',
      code: otp || '',
      time: extra.time || formattedTime,
      company_name: 'Torque Toyzz',
      company: 'Torque Toyzz',
      ...extra,
    },
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  try {
    const origin = ENV.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5175';
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[EmailJS] Failed to send email (HTTP ${response.status}):`, errorBody);
      return false;
    }

    console.log(`[EmailJS] Verification email successfully sent to ${to_email}`);
    return true;
  } catch (error) {
    console.error('[EmailJS] Network error while sending email:', error);
    return false;
  }
};
