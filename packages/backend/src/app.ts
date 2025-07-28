import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export function createApp(): Application {
  const app = express();

  // Middleware
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        'https://padel-bot-v4.vercel.app',
        'https://padel-bot-v4-frontend.vercel.app',
        // Allow any padel-bot domain on vercel
        /^https:\/\/padel-bot.*\.vercel\.app$/,
        // Allow preview deployments
        /^https:\/\/padel-bot-v4-.*\.vercel\.app$/
      ].filter((origin): origin is string | RegExp => Boolean(origin))
    : true;

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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