import express, { Express, Request, Response } from 'express';
import { ENV } from '@config/env.config.ts';
import connectDB from '@config/db.config.ts';
import errorHandler from '@core/errors/handler.error.ts';
import { applySecurityMiddlewares } from '@config/security.config.ts';
import { maintenanceMode } from '@core/middlewares/maintenance.middleware.ts';
import { loadRoutes } from './lib/routeloader.ts';
import { tracer } from '@core/middlewares/tracer.middleware.ts';
import { unallocatedHandler } from '@core/middlewares/unallocated.middleware.ts';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Torque Toyz Ecom API is running smoothly 🔐');
});

app.use(express.json());
app.use(tracer);

export const bootstrap = async (): Promise<void> => {
  if (!ENV.MONGO_URI) throw new Error('MONGO_URI is not defined');
  await connectDB(ENV.MONGO_URI);

  applySecurityMiddlewares(app);
  app.use(maintenanceMode);

  await loadRoutes(app);

  app.use(unallocatedHandler);
  app.use(errorHandler);
};

export default app;
