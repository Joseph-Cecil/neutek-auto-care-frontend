export const siteConfig = {
  name:        'Neutek Auto Care',
  description: 'Smart Diagnostics. ECU Repair. Complete Auto Care.',
  url:         process.env.NEXT_PUBLIC_APP_URL ?? 'https://neutekautocare.com',
  apiUrl:      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  wsUrl:       process.env.NEXT_PUBLIC_WS_URL  ?? 'http://localhost:3000',
  phone:       '+233 XX XXX XXXX',
  email:       'info@neutekautocare.com',
  address:     'Accra, Ghana',
  social: {
    whatsapp: 'https://wa.me/233XXXXXXXXX',
    twitter:  'https://twitter.com/neutekautocare',
    facebook: 'https://facebook.com/neutekautocare',
  },
  brandColors: {
    darkBlue:     '#0A1628',
    electricBlue: '#0066FF',
    sky:          '#3B9EFF',
  },
} as const;