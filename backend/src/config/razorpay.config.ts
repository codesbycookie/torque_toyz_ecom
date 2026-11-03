import Razorpay from 'razorpay';
import { ApiError } from '@core/errors/api.error.ts';

let _instance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay => {
  if (!_instance) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new ApiError(
        500,
        'Razorpay API credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing or not configured.'
      );
    }

    _instance = new Razorpay({ key_id, key_secret });
  }
  return _instance;
};

// Lazy proxy so importing this file does not throw if environment variables are not set at startup
export const razorpayInstance = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const instance = getRazorpayInstance();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

// Razorpay expects amounts in paise, not rupees
export const toPaise = (rupees: number) => Math.round(rupees * 100);
export const toRupees = (paise: number) => paise / 100;
