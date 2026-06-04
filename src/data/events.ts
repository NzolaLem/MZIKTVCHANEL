import type { MzikEvent } from '../types'

const assets = '/mzik-assets'

export const events: MzikEvent[] = [
  {
    id: 'evt-live-sessions',
    slug: 'mzik-tv-live-sessions',
    title: 'MzikTV Live Sessions',
    kicker: 'Live taping',
    date: '2026-07-18',
    time: '19:00',
    location: 'Maputo, Mozambique',
    venue: 'Mzik Studios Pop-Up Floor',
    image: `${assets}/lookbook-05.jpg`,
    accent: '#b7ade3',
    status: 'available',
    description:
      'A filmed MzikTV night with live performances, interviews, style moments, and a limited audience inside the Mzik universe.',
    importantInfo: [
      'Doors open 60 minutes before showtime.',
      'Digital ticket and matching ID required at entry.',
      'The event will be filmed for MzikTV content.',
    ],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 950,
        description: 'Entry to the live taping floor.',
        includes: ['Standing access', 'Digital ticket', 'MzikTV crowd experience'],
        available: 86,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 1800,
        description: 'Closer access, faster entry, and a limited merch moment.',
        includes: ['Priority entry', 'VIP viewing area', 'Mzik gift item'],
        available: 24,
      },
      {
        id: 'premium',
        name: 'Backstage / Premium Access',
        price: 3200,
        description: 'Premium access for guests who want the full production night.',
        includes: ['Backstage access', 'Artist meet moment', 'Premium lounge entry'],
        available: 8,
      },
    ],
  },
  {
    id: 'evt-popup',
    slug: 'mzik-pop-up-experience',
    title: 'Mzik Pop-Up Experience',
    kicker: 'Retail x culture',
    date: '2026-08-01',
    time: '15:00',
    location: 'Maputo, Mozambique',
    venue: 'Warehouse 09',
    image: `${assets}/lookbook-04.jpg`,
    accent: '#c0a391',
    status: 'low-stock',
    description:
      'A day-to-night Mzik pop-up with limited drops, DJ sets, creator interviews, and private fitting moments.',
    importantInfo: [
      'Limited product quantities will be available on-site.',
      'Ticket holders get timed entry windows.',
      'No refunds after purchase confirmation.',
    ],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 700,
        description: 'Timed entry into the Mzik pop-up.',
        includes: ['Pop-up entry', 'Live DJ access', 'Drop preview'],
        available: 42,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 1450,
        description: 'Priority entry and private shopping access.',
        includes: ['Priority entry', 'Private fitting slot', 'Refreshment token'],
        available: 12,
      },
      {
        id: 'premium',
        name: 'Backstage / Premium Access',
        price: 2600,
        description: 'For buyers who want early access and content moments.',
        includes: ['Early access', 'Creator photo slot', 'Reserved lounge pass'],
        available: 4,
      },
    ],
  },
  {
    id: 'evt-music-night',
    slug: 'mzik-music-night',
    title: 'Mzik Music Night',
    kicker: 'Sound system',
    date: '2026-08-22',
    time: '21:00',
    location: 'Matola, Mozambique',
    venue: 'The Yard',
    image: `${assets}/lookbook-09.jpg`,
    accent: '#334fb4',
    status: 'available',
    description:
      'A late-night music culture event curated by MzikTV, built around live DJ sets, performance clips, and style-led crowd energy.',
    importantInfo: [
      'Age restriction: 18+.',
      'Entry closes at 23:30.',
      'Outside drinks are not permitted.',
    ],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 800,
        description: 'Entry to the main music night.',
        includes: ['Main floor access', 'Digital ticket', 'DJ sets'],
        available: 120,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 1700,
        description: 'Reserved platform access with faster entry.',
        includes: ['Priority entry', 'VIP platform', 'One drink token'],
        available: 30,
      },
      {
        id: 'premium',
        name: 'Backstage / Premium Access',
        price: 2900,
        description: 'Production-side access for the full MzikTV night.',
        includes: ['Backstage access', 'Artist area pass', 'Premium wristband'],
        available: 10,
      },
    ],
  },
  {
    id: 'evt-fashion-music',
    slug: 'mzik-fashion-x-music-event',
    title: 'Mzik Fashion x Music Event',
    kicker: 'Runway session',
    date: '2026-09-05',
    time: '18:30',
    location: 'Maputo, Mozambique',
    venue: 'Concrete Hall',
    image: `${assets}/lookbook-07.jpg`,
    accent: '#f04b35',
    status: 'available',
    description:
      'A fashion-first MzikTV session combining streetwear looks, live music, and editorial video capture.',
    importantInfo: [
      'Guests may appear in event photography.',
      'Arrive early for seating allocations.',
      'Dress code: expressive streetwear.',
    ],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 1100,
        description: 'Access to the runway and live music experience.',
        includes: ['Show access', 'Digital ticket', 'Standing/photo zones'],
        available: 74,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 2100,
        description: 'Reserved section and priority content moments.',
        includes: ['Reserved section', 'Priority entry', 'MzikTV photo wall'],
        available: 18,
      },
      {
        id: 'premium',
        name: 'Backstage / Premium Access',
        price: 3800,
        description: 'Backstage and production access for a closer MzikTV experience.',
        includes: ['Backstage access', 'Designer preview', 'Premium gift item'],
        available: 6,
      },
    ],
  },
  {
    id: 'evt-screening',
    slug: 'mzik-private-screening',
    title: 'Mzik Private Screening',
    kicker: 'First look',
    date: '2026-09-19',
    time: '20:00',
    location: 'Maputo, Mozambique',
    venue: 'Black Room Cinema',
    image: `${assets}/lookbook-06.jpg`,
    accent: '#111111',
    status: 'available',
    description:
      'An intimate screening of MzikTV content, behind-the-scenes footage, and a conversation around the next Mzik chapter.',
    importantInfo: [
      'Seated event with limited capacity.',
      'Phones may be restricted during exclusive previews.',
      'Ticket transfer support will be added in a later release.',
    ],
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: 650,
        description: 'Entry to the screening room.',
        includes: ['Screening access', 'Digital ticket', 'Audience Q&A'],
        available: 55,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 1350,
        description: 'Better seating and creator conversation access.',
        includes: ['Preferred seating', 'Creator Q&A', 'Snack token'],
        available: 16,
      },
      {
        id: 'premium',
        name: 'Backstage / Premium Access',
        price: 2400,
        description: 'Private pre-screening access with the MzikTV team.',
        includes: ['Private pre-screening', 'Team meet moment', 'Premium seat'],
        available: 5,
      },
    ],
  },
]

export const featuredEvent = events[0]

export function getEventBySlug(slug?: string) {
  return events.find((event) => event.slug === slug)
}

export function getRelatedEvents(eventId: string) {
  return events.filter((event) => event.id !== eventId).slice(0, 3)
}
