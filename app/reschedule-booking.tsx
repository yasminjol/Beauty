import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { getProviderById, getServiceById, MARKETPLACE_SERVICES } from '@/constants/marketplace';
import { useClientBookings } from '@/contexts/ClientBookingsContext';

type CalendarDay = {
  key: string;
  dayNumber: number;
  monthLabel: string;
  fullLabel: string;
  isToday: boolean;
  isAvailable: boolean;
  slots: string[];
};

type Step = 'calendar' | 'confirm';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatCurrency = (value: number) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}$${value.toFixed(2)}`;
};

const isPeakTime = (timeLabel: string) =>
  timeLabel.includes('5:00 PM') || timeLabel.includes('6:00 PM');

const buildCalendarDays = (slots: string[]): CalendarDay[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const lastOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const cells: CalendarDay[] = [];

  for (let day = 1; day <= lastOfMonth.getDate(); day += 1) {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().slice(0, 10);

    const isBeforeToday = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayDelta = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const withinWindow = dayDelta >= 0 && dayDelta <= 20;

    const weekday = date.getDay();
    const isClosedWeekday = weekday === 0;

    const slotsForDay = slots.filter((slot, index) => {
      if (weekday === 6) return index < 2;
      if (weekday % 2 === 0) return index % 2 === 0;
      return index % 2 !== 0;
    });

    const isAvailable = withinWindow && !isBeforeToday && !isClosedWeekday && slotsForDay.length > 0;

    cells.push({
      key: dateKey,
      dayNumber: day,
      monthLabel: date.toLocaleDateString('en-US', { month: 'short' }),
      fullLabel: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isToday: dateKey === today.toISOString().slice(0, 10),
      isAvailable,
      slots: isAvailable ? slotsForDay : [],
    });
  }

  const leadingEmptySlots = Array.from({ length: firstOfMonth.getDay() }).map((_, index) => ({
    key: `empty-${index}`,
    dayNumber: 0,
    monthLabel: '',
    fullLabel: '',
    isToday: false,
    isAvailable: false,
    slots: [],
  }));

  return [...leadingEmptySlots, ...cells];
};

export default function RescheduleBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getBookingById, submitRescheduleRequest } = useClientBookings();

  const bookingId = getParam(params.bookingId);
  const booking = getBookingById(bookingId);
  const service = getServiceById(booking?.serviceId) ?? MARKETPLACE_SERVICES[0];
  const provider = getProviderById(booking?.providerId ?? service.providerId);

  const calendarDays = useMemo(() => buildCalendarDays(service.timeSlots), [service.timeSlots]);
  const firstAvailableDay = calendarDays.find((day) => day.isAvailable);

  const [step, setStep] = useState<Step>('calendar');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(firstAvailableDay?.key ?? '');
  const [selectedTime, setSelectedTime] = useState<string>(firstAvailableDay?.slots[0] ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateTitle}>Booking unavailable</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/bookings' as never)}>
            <Text style={styles.primaryButtonText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDay = calendarDays.find((day) => day.key === selectedDateKey && day.isAvailable);
  const selectedTimeValid = selectedDay?.slots.includes(selectedTime) ?? false;

  const pricingAdjustment = selectedTimeValid && selectedTime ? (isPeakTime(selectedTime) ? 15 : 0) : 0;

  const handleSelectDate = (dateKey: string) => {
    const date = calendarDays.find((day) => day.key === dateKey && day.isAvailable);
    if (!date) return;

    setSelectedDateKey(date.key);
    setSelectedTime(date.slots[0] ?? '');
    setErrorMessage(null);
  };

  const handleContinue = () => {
    if (!selectedDay || !selectedTimeValid) {
      setErrorMessage('Please choose an available date and time to continue.');
      return;
    }

    setErrorMessage(null);
    setStep('confirm');
  };

  const handleConfirmRequest = () => {
    if (!selectedDay || !selectedTimeValid) {
      setStep('calendar');
      setErrorMessage('Please choose an available date and time to continue.');
      return;
    }

    submitRescheduleRequest({
      bookingId: booking.id,
      newDateLabel: selectedDay.fullLabel,
      newTimeLabel: selectedTime,
      pricingAdjustment,
    });

    setSuccessMessage('Reschedule request sent. Status is now Reschedule Pending.');

    setTimeout(() => {
      router.replace({ pathname: '/booking-details', params: { bookingId: booking.id } } as never);
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => (step === 'confirm' ? setStep('calendar') : router.back())}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reschedule</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryService}>{booking.serviceName}</Text>
          <Text style={styles.summaryMeta}>{provider?.businessName ?? booking.providerBusiness}</Text>
          <Text style={styles.summaryMeta}>Current: {booking.appointmentDateLabel} at {booking.appointmentTimeLabel}</Text>
        </View>

        {step === 'calendar' ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Provider availability calendar</Text>
              <Text style={styles.sectionSubtext}>Live availability updated moments ago</Text>
            </View>

            <View style={styles.calendarCard}>
              <Text style={styles.calendarMonthTitle}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>

              <View style={styles.weekdayRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label) => (
                  <Text key={label} style={styles.weekdayLabel}>{label}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((day) => {
                  const isSelected = selectedDateKey === day.key;
                  const disabled = day.dayNumber === 0 || !day.isAvailable;

                  return (
                    <TouchableOpacity
                      key={day.key}
                      disabled={disabled}
                      style={[
                        styles.dayCell,
                        disabled && styles.dayCellDisabled,
                        isSelected && styles.dayCellSelected,
                      ]}
                      onPress={() => handleSelectDate(day.key)}
                    >
                      <Text
                        style={[
                          styles.dayCellText,
                          disabled && styles.dayCellTextDisabled,
                          isSelected && styles.dayCellTextSelected,
                        ]}
                      >
                        {day.dayNumber || ''}
                      </Text>
                      {day.isToday ? <View style={styles.todayDot} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.calendarLegend}>Only provider-available dates are selectable.</Text>
            </View>

            <Text style={styles.sectionTitle}>Available times</Text>
            <View style={styles.timeGrid}>
              {(selectedDay?.slots ?? []).map((timeLabel) => {
                const selected = selectedTime === timeLabel;
                return (
                  <TouchableOpacity
                    key={timeLabel}
                    style={[styles.timeChip, selected && styles.timeChipActive]}
                    onPress={() => {
                      setSelectedTime(timeLabel);
                      setErrorMessage(null);
                    }}
                  >
                    <Text style={[styles.timeChipText, selected && styles.timeChipTextActive]}>{timeLabel}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
              <Text style={styles.primaryButtonText}>Review Reschedule Request</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Confirm reschedule request</Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Old appointment</Text>
                <Text style={styles.confirmValue}>{booking.appointmentDateLabel} • {booking.appointmentTimeLabel}</Text>
              </View>

              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>New appointment</Text>
                <Text style={styles.confirmValue}>{selectedDay?.fullLabel} • {selectedTime}</Text>
              </View>

              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Pricing adjustment</Text>
                <Text style={styles.confirmPrice}>{formatCurrency(pricingAdjustment)}</Text>
              </View>

              <Text style={styles.confirmHint}>
                After you confirm, status updates to Reschedule Pending until provider accepts or declines.
              </Text>
            </View>

            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmRequest}>
              <Text style={styles.primaryButtonText}>Confirm Reschedule</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('calendar')}>
              <Text style={styles.secondaryButtonText}>Choose Different Time</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 26,
  },
  emptyStateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: colors.background,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E0D8F3',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  summaryService: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionSubtext: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  calendarMonthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECE8F7',
    backgroundColor: '#FBFAFF',
    marginBottom: 6,
  },
  dayCellDisabled: {
    borderColor: '#F0ECFA',
    backgroundColor: '#F8F8FC',
  },
  dayCellSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dayCellText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  dayCellTextDisabled: {
    color: '#C8C6DC',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    marginTop: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  calendarLegend: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCCFF7',
    backgroundColor: '#FAF8FF',
    minWidth: 90,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  timeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  confirmCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  confirmRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAF8',
  },
  confirmLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  confirmValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confirmPrice: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  confirmHint: {
    marginTop: 10,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: '#F9F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    marginTop: 10,
    fontSize: 12.5,
    color: '#C93C3C',
  },
  successText: {
    marginTop: 10,
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
