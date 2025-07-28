import { Request, Response } from 'express';
import { padelService } from '../services/padel.service.js';
import { padelCronJobs } from '../jobs/padel.cron.js';
import { FilterRequest } from '@padel-bot/shared';
import { CLUBS } from '../config/constants.js';
import { AppError } from '../middleware/error-handler.js';

export class PadelController {
  async checkAvailabilityForDate(req: Request, res: Response): Promise<void> {
    const dateParam = req.params.date;
    const clubParam = req.params.club || 'mouratoglou'; // default to Mouratoglou
    const date = new Date(dateParam);
    
    if (isNaN(date.getTime())) {
      throw new AppError(400, 'Invalid date format. Use YYYY-MM-DD');
    }

    const club = CLUBS[clubParam];
    if (!club) {
      throw new AppError(400, `Invalid club. Available clubs: ${Object.keys(CLUBS).join(', ')}`);
    }

    const result = await padelService.checkAvailabilityApi(date, club);
    res.json(result);
  }

  async checkAvailabilityForNextDays(req: Request, res: Response): Promise<void> {
    const clubParam = req.params.club || 'mouratoglou'; // default to Mouratoglou
    const club = CLUBS[clubParam];
    if (!club) {
      throw new AppError(400, `Invalid club. Available clubs: ${Object.keys(CLUBS).join(', ')}`);
    }

    const results = await padelService.checkMultipleDays(club);
    res.json(results);
  }

  async checkFilteredAvailability(req: Request, res: Response): Promise<void> {
    const filterRequest: FilterRequest = req.body;
    
    // Validate request
    if (!filterRequest.daysOfWeek || !Array.isArray(filterRequest.daysOfWeek) || filterRequest.daysOfWeek.length === 0) {
      throw new AppError(400, 'daysOfWeek must be a non-empty array');
    }
    
    if (!filterRequest.weeksAhead || filterRequest.weeksAhead < 1 || filterRequest.weeksAhead > 4) {
      throw new AppError(400, 'weeksAhead must be between 1 and 4');
    }
    
    if (!filterRequest.timeStart || !filterRequest.timeEnd) {
      throw new AppError(400, 'timeStart and timeEnd are required');
    }
    
    if (typeof filterRequest.includePriorWeeks !== 'boolean') {
      throw new AppError(400, 'includePriorWeeks must be a boolean');
    }
    
    const result = await padelService.checkFilteredAvailability(filterRequest);
    res.json(result);
  }

  async getHealthCheck(req: Request, res: Response): Promise<void> {
    res.json({ 
      status: 'ok', 
      service: 'padel-checker',
      timestamp: new Date().toISOString() 
    });
  }

  async getClubs(req: Request, res: Response): Promise<void> {
    const clubsData = Object.entries(CLUBS).map(([key, club]) => ({
      ...club,
      key
    }));
    res.json({
      clubs: clubsData,
      total: clubsData.length
    });
  }

  async startAutomaticChecks(req: Request, res: Response): Promise<void> {
    padelCronJobs.startAutomaticChecks();
    res.json({ message: 'Automatic checks started' });
  }

  async stopAutomaticChecks(req: Request, res: Response): Promise<void> {
    padelCronJobs.stopAutomaticChecks();
    res.json({ message: 'Automatic checks stopped' });
  }

  async runManualCheck(req: Request, res: Response): Promise<void> {
    await padelCronJobs.runManualCheck();
    res.json({ message: 'Manual check completed' });
  }
}

export const padelController = new PadelController();