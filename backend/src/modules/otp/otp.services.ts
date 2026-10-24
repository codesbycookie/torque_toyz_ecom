import Otp, { OtpPurpose } from '@db/models/otp.model.ts';
import User from '@db/models/user.model.ts';
import { ApiError } from '@core/errors/api.error.ts';
import { sendEmail } from '@core/utils/mail.util.ts';

export const sendOtp = async (email: string, purpose: OtpPurpose) => {
  let recipientName = 'Collector';
  if (purpose === 'login' || purpose === 'password_reset') {
    const user = await User.findOne({ email, active: true, deleted: false });
    if (!user) throw new ApiError(404, 'No account found with this email');
    recipientName = user.name || 'Collector';
  }

  const code = await Otp.generate(email, purpose);

  const subjectMap: Record<OtpPurpose, string> = {
    login: 'Your Torque Toyzz Login Passcode',
    password_reset: 'Your Torque Toyzz Password Reset Code',
    email_verification: 'Verify Your Torque Toyzz Email',
    phone_verification: 'Verify Your Contact Number',
  };

  // Dispatch email via EmailJS
  await sendEmail({
    to_email: email,
    to_name: recipientName,
    subject: subjectMap[purpose] || 'Your Verification Code',
    otp: code,
    message: `Your verification code is ${code}. It expires in 10 minutes.`,
  });

  console.log(`[DEV & AUDIT] OTP for ${email} (${purpose}): ${code}`);

  return { message: 'OTP sent to your email' };
};

export const verifyOtp = async (email: string, purpose: OtpPurpose, code: string) => {
  const isValid = await Otp.verify(email, purpose, code);
  if (!isValid) throw new ApiError(400, 'Invalid or expired OTP');
  return { verified: true };
};