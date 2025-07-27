export interface PriceInfo {
  bookable: boolean;
  duration: number;
  pricePerParticipant: number;
}

export interface Slot {
  startAt: string;
  prices: PriceInfo[];
}

export interface Activity {
  slots: Slot[];
}

export interface Playground {
  name: string;
  activities: Activity[];
}

export interface ApiResponse {
  'hydra:member': Playground[];
}

export interface AvailabilityResult {
  available: boolean;
  slots: string[];
}

export interface DayAvailability {
  date: string;
  available: boolean;
  slots: string[];
}