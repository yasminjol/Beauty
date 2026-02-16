import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CLIENT_BOOKINGS,
  ClientBooking,
  ClientBookingAddOn,
  ClientBookingStatus,
} from '@/constants/clientBookings';

type CreateBookingInput = {
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
  basePrice: number;
  addOns: ClientBookingAddOn[];
  taxes: number;
  depositPaid: number;
  cancellationNotice?: string;
  hasMapPreview?: boolean;
};

type RescheduleRequestInput = {
  bookingId: string;
  newDateLabel: string;
  newTimeLabel: string;
  pricingAdjustment: number;
};

type ClientBookingsContextType = {
  bookings: ClientBooking[];
  upcomingBookings: ClientBooking[];
  pastBookings: ClientBooking[];
  addBooking: (input: CreateBookingInput) => ClientBooking;
  updateBookingStatus: (bookingId: string, status: ClientBookingStatus) => void;
  rescheduleBooking: (bookingId: string, appointmentDateLabel: string, appointmentTimeLabel: string) => void;
  submitRescheduleRequest: (input: RescheduleRequestInput) => void;
  clearRescheduleNotice: (bookingId: string) => void;
  markBookingReviewed: (bookingId: string) => void;
  getBookingById: (bookingId?: string | null) => ClientBooking | undefined;
};

const UPCOMING_STATUSES: ClientBookingStatus[] = ['Confirmed', 'Reschedule Pending', 'In Progress'];

const ClientBookingsContext = createContext<ClientBookingsContextType | undefined>(undefined);

export function ClientBookingsProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<ClientBooking[]>(CLIENT_BOOKINGS);
  const rescheduleTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const addBooking = useCallback((input: CreateBookingInput) => {
    const newBooking: ClientBooking = {
      id: `booking-${Date.now()}`,
      serviceId: input.serviceId,
      providerId: input.providerId,
      serviceName: input.serviceName,
      providerName: input.providerName,
      providerBusiness: input.providerBusiness,
      providerLocation: input.providerLocation,
      appointmentDateLabel: input.appointmentDateLabel,
      appointmentTimeLabel: input.appointmentTimeLabel,
      durationMinutes: input.durationMinutes,
      serviceLocation: input.serviceLocation,
      status: 'Confirmed',
      basePrice: input.basePrice,
      addOns: input.addOns,
      taxes: input.taxes,
      depositPaid: input.depositPaid,
      cancellationNotice: input.cancellationNotice,
      hasMapPreview: input.hasMapPreview,
      hasReview: false,
    };

    setBookings((current) => [newBooking, ...current]);
    return newBooking;
  }, []);

  const updateBookingStatus = useCallback((bookingId: string, status: ClientBookingStatus) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  }, []);

  const rescheduleBooking = useCallback(
    (bookingId: string, appointmentDateLabel: string, appointmentTimeLabel: string) => {
      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                appointmentDateLabel,
                appointmentTimeLabel,
                status: booking.status === 'Cancelled' ? 'Confirmed' : booking.status,
                rescheduleNotice: undefined,
              }
            : booking,
        ),
      );
    },
    [],
  );

  const submitRescheduleRequest = useCallback((input: RescheduleRequestInput) => {
    const { bookingId, newDateLabel, newTimeLabel, pricingAdjustment } = input;

    setBookings((current) =>
      current.map((booking) => {
        if (booking.id !== bookingId) return booking;

        return {
          ...booking,
          status: 'Reschedule Pending',
          pendingRescheduleRequest: {
            oldDateLabel: booking.appointmentDateLabel,
            oldTimeLabel: booking.appointmentTimeLabel,
            newDateLabel,
            newTimeLabel,
            pricingAdjustment,
            requestedAtLabel: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
          rescheduleNotice: 'Reschedule request sent. Waiting for provider response.',
        };
      }),
    );

    if (rescheduleTimersRef.current[bookingId]) {
      clearTimeout(rescheduleTimersRef.current[bookingId]);
    }

    rescheduleTimersRef.current[bookingId] = setTimeout(() => {
      setBookings((current) =>
        current.map((booking) => {
          if (booking.id !== bookingId || booking.status !== 'Reschedule Pending' || !booking.pendingRescheduleRequest) {
            return booking;
          }

          const request = booking.pendingRescheduleRequest;
          const shouldAccept = !request.newTimeLabel.includes('5:00 PM');

          if (!shouldAccept) {
            return {
              ...booking,
              status: 'Confirmed',
              pendingRescheduleRequest: undefined,
              rescheduleNotice: 'Provider declined this slot. Please select another time.',
            };
          }

          const adjustedBasePrice = Math.max(booking.basePrice + request.pricingAdjustment, 0);
          const taxDelta = Math.round(request.pricingAdjustment * 0.08 * 100) / 100;

          return {
            ...booking,
            status: 'Confirmed',
            appointmentDateLabel: request.newDateLabel,
            appointmentTimeLabel: request.newTimeLabel,
            basePrice: adjustedBasePrice,
            taxes: Math.max(booking.taxes + taxDelta, 0),
            pendingRescheduleRequest: undefined,
            rescheduleNotice: 'Provider accepted your reschedule request. Appointment updated.',
          };
        }),
      );

      delete rescheduleTimersRef.current[bookingId];
    }, 2600);
  }, []);

  const clearRescheduleNotice = useCallback((bookingId: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              rescheduleNotice: undefined,
            }
          : booking,
      ),
    );
  }, []);

  const markBookingReviewed = useCallback((bookingId: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              hasReview: true,
            }
          : booking,
      ),
    );
  }, []);

  const getBookingById = useCallback(
    (bookingId?: string | null) => {
      if (!bookingId) return undefined;
      return bookings.find((booking) => booking.id === bookingId);
    },
    [bookings],
  );

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const upcoming = bookings.filter((booking) => UPCOMING_STATUSES.includes(booking.status));
    const past = bookings.filter((booking) => !UPCOMING_STATUSES.includes(booking.status));

    return {
      upcomingBookings: upcoming,
      pastBookings: past,
    };
  }, [bookings]);

  useEffect(() => {
    return () => {
      Object.values(rescheduleTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      rescheduleTimersRef.current = {};
    };
  }, []);

  return (
    <ClientBookingsContext.Provider
      value={{
        bookings,
        upcomingBookings,
        pastBookings,
        addBooking,
        updateBookingStatus,
        rescheduleBooking,
        submitRescheduleRequest,
        clearRescheduleNotice,
        markBookingReviewed,
        getBookingById,
      }}
    >
      {children}
    </ClientBookingsContext.Provider>
  );
}

export function useClientBookings() {
  const context = useContext(ClientBookingsContext);

  if (!context) {
    throw new Error('useClientBookings must be used within ClientBookingsProvider');
  }

  return context;
}
