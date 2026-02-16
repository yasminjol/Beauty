export type ClientBookingStatus =
  | 'Confirmed'
  | 'Reschedule Pending'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type ClientBookingAddOn = {
  id: string;
  name: string;
  price: number;
};

export type ClientBooking = {
  id: string;
  serviceId?: string;
  providerId?: string;
  serviceName: string;
  providerName: string;
  providerBusiness: string;
  providerLocation: string;
  appointmentDateLabel: string;
  appointmentTimeLabel: string;
  durationMinutes: number;
  serviceLocation: string;
  status: ClientBookingStatus;
  basePrice: number;
  addOns: ClientBookingAddOn[];
  taxes: number;
  depositPaid: number;
  cancellationNotice?: string;
  hasMapPreview?: boolean;
  pendingRescheduleRequest?: {
    oldDateLabel: string;
    oldTimeLabel: string;
    newDateLabel: string;
    newTimeLabel: string;
    pricingAdjustment: number;
    requestedAtLabel: string;
  };
  rescheduleNotice?: string;
  hasReview?: boolean;
};

export const CLIENT_BOOKINGS: ClientBooking[] = [
  {
    id: 'booking-101',
    serviceId: 'service-boho-knotless',
    providerId: 'provider-glow-house',
    serviceName: 'Boho Knotless Braids',
    providerName: 'Yasmine N.',
    providerBusiness: 'Glow House Studio',
    providerLocation: 'Oakland, CA',
    appointmentDateLabel: 'Tue, Feb 18, 2026',
    appointmentTimeLabel: '10:00 AM',
    durationMinutes: 240,
    serviceLocation: '123 Main St, Oakland, CA',
    status: 'Confirmed',
    basePrice: 210,
    addOns: [
      { id: 'addon-1', name: 'Hair Wash', price: 20 },
      { id: 'addon-2', name: 'Boho Hair', price: 35 },
    ],
    taxes: 21,
    depositPaid: 90,
    cancellationNotice:
      'Free cancellation up to 24 hours before appointment. Late cancellations may incur a fee.',
    hasMapPreview: true,
    hasReview: false,
  },
  {
    id: 'booking-102',
    serviceId: 'service-luxury-gelx',
    providerId: 'provider-nailed-by-tori',
    serviceName: 'Luxury Gel-X Set',
    providerName: 'Tori M.',
    providerBusiness: 'Nailed by Tori',
    providerLocation: 'Brooklyn, NY',
    appointmentDateLabel: 'Today, Feb 16, 2026',
    appointmentTimeLabel: '2:30 PM',
    durationMinutes: 120,
    serviceLocation: '17 Willoughby St, Brooklyn, NY',
    status: 'In Progress',
    basePrice: 95,
    addOns: [{ id: 'addon-3', name: 'Chrome Finish', price: 15 }],
    taxes: 8.8,
    depositPaid: 40,
    hasMapPreview: true,
    hasReview: false,
  },
  {
    id: 'booking-103',
    serviceId: 'service-hybrid-lashes',
    providerId: 'provider-blink-atelier',
    serviceName: 'Hybrid Lash Fill',
    providerName: 'Chloe R.',
    providerBusiness: 'Blink Atelier',
    providerLocation: 'Atlanta, GA',
    appointmentDateLabel: 'Sun, Feb 9, 2026',
    appointmentTimeLabel: '11:30 AM',
    durationMinutes: 75,
    serviceLocation: '88 Midtown Ave, Atlanta, GA',
    status: 'Completed',
    basePrice: 78,
    addOns: [{ id: 'addon-4', name: 'Lash Bath', price: 10 }],
    taxes: 7.04,
    depositPaid: 30,
    hasReview: false,
  },
  {
    id: 'booking-104',
    serviceId: 'service-loc-retwist',
    providerId: 'provider-crown-coils',
    serviceName: 'Loc Retwist',
    providerName: 'Naya P.',
    providerBusiness: 'Crown & Coils',
    providerLocation: 'Dallas, TX',
    appointmentDateLabel: 'Thu, Feb 6, 2026',
    appointmentTimeLabel: '4:00 PM',
    durationMinutes: 150,
    serviceLocation: '211 Elm St, Dallas, TX',
    status: 'Cancelled',
    basePrice: 140,
    addOns: [],
    taxes: 11.2,
    depositPaid: 50,
    hasReview: false,
  },
];

export function getClientBookingById(id?: string | null): ClientBooking | undefined {
  if (!id) return undefined;
  return CLIENT_BOOKINGS.find((booking) => booking.id === id);
}

export function getClientBookingsByGroup() {
  const upcoming = CLIENT_BOOKINGS.filter(
    (booking) =>
      booking.status === 'Confirmed' ||
      booking.status === 'Reschedule Pending' ||
      booking.status === 'In Progress',
  );
  const past = CLIENT_BOOKINGS.filter(
    (booking) => booking.status === 'Completed' || booking.status === 'Cancelled',
  );

  return { upcoming, past };
}
