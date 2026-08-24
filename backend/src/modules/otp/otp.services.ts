import Otp, { OtpPurpose } from '@db/models/otp.model.ts';
import User from '@db/models/user.model.ts';
import { ApiError } from '@core/errors/api.error.ts';
// import { sendEmail } from '@core/utils/mail.util.ts'; // wire up to your mail provider

export const sendOtp = async (email: string, purpose: OtpPurpose) => {
  if (purpose === 'login' || purpose === 'password_reset') {
    const user = await User.findOne({ email, active: true, deleted: false });
    if (!user) throw new ApiError(404, 'No account found with this email not found');
  }

  const code = await Otp.generate(email, purpose);

  // TODO: wire to actual email provider
  // await sendEmail(email, 'Your verification code', `Your OTP is ${code}. It expires in 10 minutes.`);

  console.log(`[DEV ONLY] OTP for ${email} (${purpose}): ${code}`); // remove once mail provider is wired in

  return { message: 'OTP sent to your email' };
};

export const verifyOtp = async (email: string, purpose: OtpPurpose, code: string) => {
  const isValid = await Otp.verify(email, purpose, code);
  if (!isValid) throw new ApiError(400, 'Invalid or expired OTP');
  return { verified: true };
};