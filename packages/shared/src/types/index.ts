// Frontend-Backend Communication Types
export interface FilterRequest {
  daysOfWeek: number[];  // 0=Sunday, 1=Monday, etc.
  weeksAhead: number;
  timeStart: string;     // "HH:MM" format
  timeEnd: string;       // "HH:MM" format
  includePriorWeeks: boolean;  // Include all weeks from 1 to weeksAhead
}

export interface SlotInfo {
  startTime: string;
  endTime: string;
  playground: string;
  price: number;
  duration: number;
  fullInfo: string;
}

export interface FilteredDayResult {
  date: string;
  dayName: string;
  dayOfWeek: number;
  slots: SlotInfo[];
}

export interface ClubConfig {
  id: string;
  name: string;
  clubId: string;
  activityId: string;
  baseUrl: string;
  bookingUrl: string;
}

export interface ClubResults {
  results: FilteredDayResult[];
  daysWithNoSlots: FilteredDayResult[];
  totalSlots: number;
}

export interface FilteredAvailabilityResult {
  success: boolean;
  resultsByClub: Record<string, ClubResults>;
  totalSlots: number;
  searchCriteria: FilterRequest;
}