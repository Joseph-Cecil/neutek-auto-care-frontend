/** Local workshop photography in /public/mechanic-images. */
export const MECHANIC_IMAGES = {
  hero: {
    src: '/mechanic-images/pexels-aliyu-jooney-2151008543-31928799.jpg',
    alt: 'Technician at work beside a vehicle with the hood open',
  },
  quote: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555015.jpg',
    alt: 'Technicians inspecting an engine bay during diagnostics',
  },
  workshop: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555018.jpg',
    alt: 'Neutek-style workshop team ready for service',
  },
  engineTeam: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555012.jpg',
    alt: 'Two technicians working on a white Toyota engine',
  },
  wheelWork: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555009.jpg',
    alt: 'Technicians repairing a vehicle wheel assembly',
  },
  engineClose: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555013.jpg',
    alt: 'Close view of technicians servicing a pickup engine',
  },
  wheelAssist: {
    src: '/mechanic-images/pexels-abasiakan-255745439-12555010.jpg',
    alt: 'Technicians collaborating on a bus wheel repair',
  },
  focusedTech: {
    src: '/mechanic-images/pexels-dionisio-castigotivane-1013672643-28153670.jpg',
    alt: 'Technician carefully assembling engine components',
  },
  bayNight: {
    src: '/mechanic-images/pexels-cottonbro-7540622.jpg',
    alt: 'Mechanic inspecting a chassis in the workshop bay',
  },
  bayPortrait: {
    src: '/mechanic-images/pexels-matt-jerome-connor-1428905-4439588.jpg',
    alt: 'Technician working beside a car in the workshop',
  },
} as const;

export type MechanicImageKey = keyof typeof MECHANIC_IMAGES;
