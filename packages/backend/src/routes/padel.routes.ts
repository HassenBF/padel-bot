import { Router } from 'express';
import { padelController } from '../controllers/padel.controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const padelRouter: Router = Router();

// Health check endpoint
padelRouter.get('/health', padelController.getHealthCheck);

// Get all clubs configuration
padelRouter.get('/clubs', padelController.getClubs);

// Check availability for a specific date
padelRouter.get('/check-availability/:date', asyncHandler(padelController.checkAvailabilityForDate));

// Check availability for next 8 days
padelRouter.get('/check-availability', asyncHandler(padelController.checkAvailabilityForNextDays));

// Check filtered availability based on user preferences
padelRouter.post('/check-availability/filtered', asyncHandler(padelController.checkFilteredAvailability));

// Cron job control endpoints
padelRouter.post('/cron/start', asyncHandler(padelController.startAutomaticChecks));
padelRouter.post('/cron/stop', asyncHandler(padelController.stopAutomaticChecks));
padelRouter.post('/cron/manual', asyncHandler(padelController.runManualCheck));