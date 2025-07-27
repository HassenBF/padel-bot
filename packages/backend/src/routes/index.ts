import { Router } from 'express';
import { padelRouter } from './padel.routes';

export const router: Router = Router();

// Base API info
router.get('/', (req, res) => {
  res.json({ 
    message: 'Padel Bot API is running',
    version: '4.0.0',
    endpoints: {
      health: '/api/padel/health',
      checkAvailability: '/api/padel/check-availability',
      checkSpecificDate: '/api/padel/check-availability/:date',
      checkFiltered: '/api/padel/check-availability/filtered',
      startCron: '/api/padel/cron/start',
      stopCron: '/api/padel/cron/stop',
      manualCheck: '/api/padel/cron/manual'
    }
  });
});

// Mount padel routes
router.use('/padel', padelRouter);