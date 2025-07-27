/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Array of day names in French
 */
export const DAYS_OF_WEEK_NAMES = [
  'Dimanche', 
  'Lundi', 
  'Mardi', 
  'Mercredi', 
  'Jeudi', 
  'Vendredi', 
  'Samedi'
] as const;

/**
 * Get day name in French from day number (0=Sunday)
 */
export function getDayName(dayNumber: number): string {
  return DAYS_OF_WEEK_NAMES[dayNumber] || 'Unknown';
}