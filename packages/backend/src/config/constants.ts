import { ClubConfig } from '@padel-bot/shared';

export const CLUBS: Record<string, ClubConfig> = {
  mouratoglou: {
    id: "mouratoglou",
    name: "Mouratoglou Country Club",
    clubId: "652b9a65-0756-4f08-9b30-e20130aeea42",
    activityId: "700a126b-59e1-4f94-8931-0c87483c6f10",
    baseUrl: "https://api-blockout.doinsport.club/clubs/playgrounds/plannings/",
    bookingUrl: "https://mouratogloucc.doinsport.club/select-booking"
  },
  allinpadel: {
    id: "allinpadel", 
    name: "All In Padel Mougins",
    clubId: "76eab5bf-ac6d-4fd3-84fc-0ec862242e6e",
    activityId: "ce8c306e-224a-4f24-aa9d-6500580924dc",
    baseUrl: "https://allin-api.doinsport.club/clubs/playgrounds/plannings/",
    bookingUrl: "https://allinpadel.doinsport.club/select-booking"
  },
  stadiumantibes: {
    id: "stadiumantibes",
    name: "Stadium-Antibes",
    clubId: "c8e997d2-303d-4fb3-988a-bbb0640643cd",
    activityId: "ce8c306e-224a-4f24-aa9d-6500580924dc",
    baseUrl: "https://api-v3.doinsport.club/clubs/playgrounds/plannings/",
    bookingUrl: "https://stadium-antibes.doinsport.club/select-booking"
  },
  padelriviera: {
    id: "padelriviera",
    name: "Padel Riviera",
    clubId: "5b3a0eb9-3565-4fc5-abd3-928f7f46dc14",
    activityId: "ce8c306e-224a-4f24-aa9d-6500580924dc",
    baseUrl: "https://api-v3.doinsport.club/clubs/playgrounds/plannings/",
    bookingUrl: "https://padelriviera.doinsport.club/select-booking"
  }
};

export const PADEL_CONFIG = {
  DEFAULT_BOOKING_TYPE: "unique",
  DEFAULT_FROM_TIME: "00:00:00", 
  DEFAULT_TO_TIME: "23:59:59",
  DAYS_TO_CHECK: 8
} as const;

export const CRON_SCHEDULES = {
  HOURLY_CHECK: '0 * * * *'  // Run every hour at minute 0
} as const;