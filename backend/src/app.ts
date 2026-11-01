import express, { Express, Request, Response } from 'express';
import { ENV } from '@config/env.config.ts';
import connectDB from '@config/db.config.ts';
import errorHandler from '@core/errors/handler.error.ts';
import { applySecurityMiddlewares } from '@config/security.config.ts';
import { loadRoutes } from './lib/routeloader.ts';
import { tracer } from '@core/middlewares/tracer.middleware.ts';
import { unallocatedHandler } from '@core/middlewares/unallocated.middleware.ts';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Torque Toyz Ecom API is running smoothly 🔐');
});

app.get(['/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Alias for typo tolerance
app.get('/api/v1/hom', (req: Request, res: Response) => {
  res.redirect(307, '/api/v1/home');
});

app.use(express.json());
app.use(tracer);

export const bootstrap = async (): Promise<void> => {
  if (!ENV.MONGO_URI) throw new Error('MONGO_URI is not defined');
  await connectDB(ENV.MONGO_URI);

  applySecurityMiddlewares(app);

  await loadRoutes(app);

  app.use(unallocatedHandler);
  app.use(errorHandler);
};

export default app;
