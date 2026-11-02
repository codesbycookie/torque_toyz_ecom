import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cookieParser from 'cookie-parser';

export const applySecurityMiddlewares = (app: Express) => {
  console.log('🛡️ Applying security middlewares...');

  app.use(cookieParser());
  console.log('✅ Cookie parser active');

  const origins = process.env.ALLOWED_ORIGINS?.split(', ') ?? [];

  app.use(
    cors({
      origin: (origin: any, callback: any) => {
        const isLocalNetwork = origin && /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (!origin || origins.includes(origin) || isLocalNetwork) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      exposedHeaders: ['Content-Disposition'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    })
  );
  console.log(`✅ CORS enabled for origins: ${origins.join(', ')}`);

  app.use(helmet());
  console.log('✅ Helmet enabled');

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));
  console.log('✅ Body parser configured');

  const xssOptions = {
    maxDepth: 50,
    allowedKeys: ['name', 'title'],
    allowedTags: ['b', 'i', 'em', 'strong', 'h1', 'h2'],
  };

  app.use(xss(xssOptions));
  console.log('✅ XSS sanitizer enabled');

  app.use(compression());
  console.log('✅ Response compression enabled');

  console.log('🟢 Security middleware setup complete\n');
};
