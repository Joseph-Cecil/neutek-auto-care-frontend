export const APP_CONSTANTS = {
  DEFAULT_PAGE_SIZE:   20,
  MAX_PAGE_SIZE:       100,
  MAX_FILE_SIZE_MB:    10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  SEARCH_DEBOUNCE_MS:  300,
  TOAST_DURATION_MS:   4000,
  ACCESS_TOKEN_TTL_MS: 14 * 60 * 1000,
  WS_EVENTS: {
    JOIN_JOB:    'join:job',
    LEAVE_JOB:   'leave:job',
    JOB_UPDATED: 'job:updated',
  },
  TIMEZONE: 'Africa/Accra',
  VEHICLE_BRANDS: [
    'Toyota','Mercedes-Benz','BMW','Honda','Nissan',
    'Hyundai','Kia','Ford','Volkswagen','Suzuki',
    'Mitsubishi','Chevrolet','Peugeot','Renault','Mazda','Other',
  ],
} as const;