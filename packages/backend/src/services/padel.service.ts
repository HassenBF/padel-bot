import fetch from 'node-fetch';
import { CLUBS, PADEL_CONFIG } from '../config/constants.js';
import {
  ApiResponse,
  AvailabilityResult,
  DayAvailability
} from '../types/padel.types.js';
import {
  FilterRequest,
  FilteredAvailabilityResult,
  FilteredDayResult,
  SlotInfo,
  ClubConfig,
  ClubResults,
  timeToMinutes,
  minutesToTime,
  DAYS_OF_WEEK_NAMES
} from '@padel-bot/shared';

export class PadelService {
  async checkAvailabilityApi(dateToCheck: Date, club: ClubConfig): Promise<AvailabilityResult> {
    const dateStr = dateToCheck.toISOString().split('T')[0];
    const fromTime = PADEL_CONFIG.DEFAULT_FROM_TIME;
    const toTime = PADEL_CONFIG.DEFAULT_TO_TIME;

    const apiUrl = `${club.baseUrl}${dateStr}?club.id=${club.clubId}&from=${fromTime}&to=${toTime}&activities.id=${club.activityId}&bookingType=${PADEL_CONFIG.DEFAULT_BOOKING_TYPE}`;

    try {
      // This works because it's a server-side request - no CORS!
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let data: ApiResponse;
      try {
        data = await response.json() as ApiResponse;
      } catch (jsonError) {
        console.error(`Erreur de décodage de la réponse JSON: ${jsonError}`);
        return { available: false, slots: [] };
      }
      const availableSlots: string[] = [];

      if (data['hydra:member']) {
        for (const playground of data['hydra:member']) {
          const playgroundName = playground.name || "Unknown Padel Court";
          
          if (playground.activities?.[0]?.slots) {
            for (const slot of playground.activities[0].slots) {
              let isBookable = false;
              
              for (const priceInfo of slot.prices || []) {
                if (priceInfo.bookable) {
                  isBookable = true;
                  break;
                }
              }

              if (isBookable) {
                const startTime = slot.startAt || "N/A";
                
                // Iterate through all prices to find bookable slots and their durations/prices
                for (const priceInfo of slot.prices || []) {
                  if (priceInfo.bookable) {
                    const durationSeconds = priceInfo.duration || 0;
                    const durationMinutes = Math.floor(durationSeconds / 60);
                    // Price is in cents, convert to euros
                    const priceInCents = priceInfo.pricePerParticipant || 0;
                    const priceInEuros = priceInCents / 100;
                    
                    availableSlots.push(
                      `${playgroundName} - Heure: ${startTime} (${durationMinutes} min), Prix: ${priceInEuros.toFixed(2)}€`
                    );
                  }
                }
              }
            }
          }
        }
      }

      if (availableSlots.length > 0) {
        const dayOfWeek = dateToCheck.getDay();
        const dayName = DAYS_OF_WEEK_NAMES[dayOfWeek];
        
        console.log(`Des créneaux sont disponibles pour le ${dayName} ${dateStr}:`);
        availableSlots.forEach(slot => console.log(`- ${slot}`));
        return { available: true, slots: availableSlots };
      } else {
        const dayOfWeek = dateToCheck.getDay();
        const dayName = DAYS_OF_WEEK_NAMES[dayOfWeek];
        
        console.log(`Aucun créneau disponible pour le ${dayName} ${dateStr}.`);
        return { available: false, slots: [] };
      }

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error(`Erreur lors de la requête API: ${error}`);
      } else {
        console.error(`Une erreur inattendue s'est produite: ${error}`);
      }
      return { available: false, slots: [] };
    }
  }

  async checkMultipleDays(club: ClubConfig): Promise<DayAvailability[]> {
    console.log(`=== Vérification des disponibilités ${club.name} ===\n`);
    const results: DayAvailability[] = [];
    
    for (let i = 0; i < PADEL_CONFIG.DAYS_TO_CHECK; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`Vérification pour le ${dateStr}:`);
      const result = await this.checkAvailabilityApi(date, club);
      console.log("----------------------------------------");
      
      results.push({
        date: dateStr,
        ...result
      });
    }

    return results;
  }

  async checkFilteredAvailability(filterRequest: FilterRequest): Promise<FilteredAvailabilityResult> {
    const resultsByClub: Record<string, ClubResults> = {};
    
    // Check all clubs
    for (const club of Object.values(CLUBS)) {
      console.log(`\n🏢 Checking ${club.name}...`);
      const results: FilteredDayResult[] = [];
      const daysWithNoSlots: FilteredDayResult[] = [];
      
      // Calculate date range based on weeks ahead and includePriorWeeks option
      const startDay = filterRequest.includePriorWeeks ? 0 : (filterRequest.weeksAhead - 1) * 7;
      const endDay = filterRequest.weeksAhead * 7;
      
      for (let i = startDay; i < endDay; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dayOfWeek = date.getDay();
        
        // Skip if this day is not in the selected days
        if (!filterRequest.daysOfWeek.includes(dayOfWeek)) {
          continue;
        }
        
        try {
          const availability = await this.checkAvailabilityApi(date, club);
          console.log(`🔍 [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}: Found ${availability.slots.length} slots, available: ${availability.available}`);
          
          if (availability.available && availability.slots.length > 0) {
            // Filter slots by time range
            const filteredSlots = this.filterSlotsByTime(availability.slots, filterRequest.timeStart, filterRequest.timeEnd);
            console.log(`⏰ [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}: ${availability.slots.length} → ${filteredSlots.length} slots after time filtering (${filterRequest.timeStart}-${filterRequest.timeEnd})`);
            
            if (filteredSlots.length > 0) {
              console.log(`✅ [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}: Adding ${filteredSlots.length} slots to results`);
              results.push({
                date: date.toISOString().split('T')[0],
                dayName: DAYS_OF_WEEK_NAMES[dayOfWeek],
                dayOfWeek: dayOfWeek,
                slots: filteredSlots
              });
            } else {
              console.log(`❌ [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}: All slots filtered out by time range`);
              // Day was checked but no slots matched time criteria
              daysWithNoSlots.push({
                date: date.toISOString().split('T')[0],
                dayName: DAYS_OF_WEEK_NAMES[dayOfWeek],
                dayOfWeek: dayOfWeek,
                slots: []
              });
            }
          } else {
            console.log(`❌ [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}: No slots available`);
            // Day was checked but no slots available at all
            daysWithNoSlots.push({
              date: date.toISOString().split('T')[0],
              dayName: DAYS_OF_WEEK_NAMES[dayOfWeek],
              dayOfWeek: dayOfWeek,
              slots: []
            });
          }
        } catch (error) {
          console.error(`💥 [${club.name}] ${DAYS_OF_WEEK_NAMES[dayOfWeek]} ${date.toISOString().split('T')[0]}:`, error);
        }
      }
      
      // Store results for this club
      resultsByClub[club.id] = {
        results,
        daysWithNoSlots,
        totalSlots: results.reduce((total, day) => total + day.slots.length, 0)
      };
    }
    
    // Calculate total slots across all clubs
    const totalSlots = Object.values(resultsByClub).reduce((total, clubResults) => total + clubResults.totalSlots, 0);
    
    return {
      success: true,
      resultsByClub,
      totalSlots,
      searchCriteria: filterRequest
    };
  }

  private filterSlotsByTime(slots: string[], timeStart: string, timeEnd: string): SlotInfo[] {
    const startMinutes = timeToMinutes(timeStart);
    const endMinutes = timeToMinutes(timeEnd);
    
    return slots.map(slot => this.parseSlotInfo(slot))
      .filter(slotInfo => {
        const slotStartMinutes = timeToMinutes(slotInfo.startTime);
        return slotStartMinutes >= startMinutes && slotStartMinutes <= endMinutes;
      });
  }

  private parseSlotInfo(slotString: string): SlotInfo {
    // Parse slot string format: "Court Name - Heure: HH:MM (duration min), Prix: X.XX€"
    const parts = slotString.split(' - ');
    const playground = parts[0] || 'Unknown Court';
    
    // Updated to match new French format "Heure:"
    const timeMatch = slotString.match(/Heure: (\d{2}:\d{2})/);
    const startTime = timeMatch ? timeMatch[1] : '00:00';
    
    const durationMatch = slotString.match(/\((\d+) min\)/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 60;
    
    // Updated to match new French format "Prix:" and decimal prices
    const priceMatch = slotString.match(/Prix: ([\d.]+)€/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
    
    // Calculate end time
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    const endTime = minutesToTime(endMinutes);
    
    return {
      startTime,
      endTime,
      playground,
      price,
      duration,
      fullInfo: slotString
    };
  }


}

export const padelService = new PadelService();