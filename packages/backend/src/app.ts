import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://padel-bot-v4.vercel.app'].filter((url): url is string => Boolean(url))
      : true,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api', router);

  // Global health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      service: 'padel-bot-backend',
      timestamp: new Date().toISOString() 
    });
  });

  // 404 handler
  app.use('*', notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}