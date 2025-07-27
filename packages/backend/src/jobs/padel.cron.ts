import cron from 'node-cron';
import { padelService } from '../services/padel.service';
import { CRON_SCHEDULES, CLUBS } from '../config/constants';

export class PadelCronJobs {
  private jobs: cron.ScheduledTask[] = [];

  startAutomaticChecks(): void {
    console.log('📅 Starting automatic padel availability checks...');
    
    const job = cron.schedule(CRON_SCHEDULES.HOURLY_CHECK, async () => {
      console.log('\n⏰ Automatic padel check started:', new Date().toISOString());
      try {
        // Check all clubs
        for (const club of Object.values(CLUBS)) {
          console.log(`🏢 Checking ${club.name}...`);
          await padelService.checkMultipleDays(club);
        }
        // Here you could add notification logic
        // For example: send email, SMS, or push notification if slots are found
      } catch (error) {
        console.error('❌ Error during automatic check:', error);
      }
    }, {
      scheduled: false, // Don't start immediately
      timezone: "Europe/Paris"
    });

    this.jobs.push(job);
    job.start();
    
    console.log('✅ Automatic checks scheduled (every hour at minute 0)');
  }

  stopAutomaticChecks(): void {
    console.log('🛑 Stopping automatic checks...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }

  // Manual trigger for testing
  async runManualCheck(): Promise<void> {
    console.log('🔍 Running manual check...');
    try {
      // Check all clubs
      for (const club of Object.values(CLUBS)) {
        console.log(`🏢 Manual check for ${club.name}...`);
        await padelService.checkMultipleDays(club);
      }
    } catch (error) {
      console.error('❌ Error during manual check:', error);
    }
  }
}

export const padelCronJobs = new PadelCronJobs();