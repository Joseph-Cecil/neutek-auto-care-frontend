export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE:   20,
  MAX_PAGE_SIZE:       100,

  // File upload
  MAX_FILE_SIZE_MB:    10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,

  // Debounce
  SEARCH_DEBOUNCE_MS:  300,

  // Toast duration
  TOAST_DURATION_MS:   4000,

  // Token
  ACCESS_TOKEN_TTL_MS: 14 * 60 * 1000,  // 14 min (refresh before 15 min expiry)

  // WebSocket events
  WS_EVENTS: {
    JOIN_JOB:    'join:job',
    LEAVE_JOB:   'leave:job',
    JOB_UPDATED: 'job:updated',
  },

  // Ghana timezone
  TIMEZONE: 'Africa/Accra',

  // Supported vehicle brands
  VEHICLE_BRANDS: [
    'Toyota', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan',
    'Hyundai', 'Kia', 'Ford', 'Volkswagen', 'Suzuki',
    'Mitsubishi', 'Chevrolet', 'Peugeot', 'Renault', 'Mazda',
    'Other',
  ],
} as const;