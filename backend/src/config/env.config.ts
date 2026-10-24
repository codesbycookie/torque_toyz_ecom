import dotenv from 'dotenv';

dotenv.config();

type ENVTYPE = {
  NODE_ENV: string;
  DEBUG: string;
  PORT: number | string;
  MONGO_URI: string | undefined;
  CLIENT_URL: string;
  MAINTENANCE_MODE: string | undefined;
  MAINTENANCE_BYPASS_KEY: string | undefined;
  CLOUDINARY_CLOUD_NAME: string | undefined;
  CLOUDINARY_API_KEY: string | undefined;
  CLOUDINARY_API_SECRET: string | undefined;
  EMAILJS_SERVICE_ID: string | undefined;
  EMAILJS_TEMPLATE_ID: string | undefined;
  EMAILJS_PUBLIC_KEY: string | undefined;
  EMAILJS_PRIVATE_KEY: string | undefined;
};

export const ENV: ENVTYPE = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG || 'true',
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || 'false',
  MAINTENANCE_BYPASS_KEY: process.env.MAINTENANCE_BYPASS_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || 'service_6c4rj3o',
  EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || 'uYySZeyRILTzH3PM7',
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY || '',
};

export const ENVCONFIG = {
  prod: ENV.NODE_ENV === 'production',
  debug: ENV.DEBUG === 'true',
};
