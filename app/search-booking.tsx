import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { getProviderById, getServiceById, MARKETPLACE_SERVICES } from '@/constants/marketplace';
import { useClientBookings } from '@/contexts/ClientBookingsContext';

const TAX_RATE = 0.08;

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

type DateOption = {
  key: string;
  shortLabel: string;
  longLabel: string;
};

function createDateOptions(count = 6): DateOption[] {
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    return {
      key: date.toISOString().slice(0, 10),
      shortLabel: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      longLabel: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  });
}

export default function SearchBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addBooking, getBookingById } = useClientBookings();

  const bookingId = getParam(params.bookingId);
  const existingBooking = getBookingById(bookingId);

  const serviceIdFromParams = getParam(params.serviceId);
  const serviceId = serviceIdFromParams ?? existingBooking?.serviceId;

  const service = getServiceById(serviceId) ?? MARKETPLACE_SERVICES[0];
  const provider = getProviderById(service.providerId);

  const dateOptions = useMemo(() => createDateOptions(), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(dateOptions[0]?.key ?? '');
  const [selectedTime, setSelectedTime] = useState<string>(service.timeSlots[0] ?? '');
  const [locationMode, setLocationMode] = useState<'provider' | 'client'>('provider');
  const [locationValue, setLocationValue] = useState(provider?.location ?? '');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedDate = dateOptions.find((date) => date.key === selectedDateKey) ?? dateOptions[0];

  const selectedAddOns = service.addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id));
  const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const subtotal = service.startingPrice + addOnsTotal;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + taxes;
  const depositPaid = Math.min(service.depositAmount, total);
  const remainingBalance = Math.max(total - depositPaid, 0);

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId],
    );
  };

  const onConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please select a date and time.');
      return;
    }

    const finalLocation = locationMode === 'provider' ? provider?.location ?? '' : locationValue.trim();

    if (!finalLocation) {
      setErrorMessage('Please confirm service location before continuing.');
      return;
    }

    setErrorMessage(null);

    if (existingBooking) {
      router.replace({
        pathname: '/reschedule-booking',
        params: { bookingId: existingBooking.id },
      } as never);
      return;
    }

    addBooking({
      serviceId: service.id,
      providerId: provider?.id,
      serviceName: service.name,
      providerName: provider?.providerName ?? 'Provider',
      providerBusiness: provider?.businessName ?? 'Provider Business',
      providerLocation: provider?.location ?? '',
      appointmentDateLabel: selectedDate.longLabel,
      appointmentTimeLabel: selectedTime,
      durationMinutes: service.durationMinutes,
      serviceLocation: finalLocation,
      basePrice: service.startingPrice,
      addOns: selectedAddOns,
      taxes,
      depositPaid,
      cancellationNotice:
        'Free cancellation up to 24 hours before appointment. Late cancellations may incur a fee.',
      hasMapPreview: true,
    });

    setSuccessMessage('Booking confirmed. Redirecting to bookings...');
    setTimeout(() => {
      router.replace('/(tabs)/bookings' as never);
    }, 650);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existingBooking ? 'Reschedule Booking' : 'Book Service'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.providerMeta}>
            {provider?.businessName} • {provider?.location}
          </Text>
          <Text style={styles.providerMeta}>
            {formatCurrency(service.startingPrice)} • {formatDuration(service.durationMinutes)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {dateOptions.map((date) => {
            const isActive = selectedDateKey === date.key;
            return (
              <TouchableOpacity
                key={date.key}
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setSelectedDateKey(date.key)}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>{date.shortLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Select time</Text>
        <View style={styles.timeGrid}>
          {service.timeSlots.map((time) => {
            const isActive = selectedTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeChip, isActive && styles.timeChipActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Confirm location</Text>
        <View style={styles.card}>
          <View style={styles.segmentedRow}>
            <TouchableOpacity
              style={[styles.segmentedButton, locationMode === 'provider' && styles.segmentedButtonActive]}
              onPress={() => {
                setLocationMode('provider');
                setLocationValue(provider?.location ?? '');
              }}
            >
              <Text
                style={[
                  styles.segmentedButtonText,
                  locationMode === 'provider' && styles.segmentedButtonTextActive,
                ]}
              >
                Provider location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentedButton, locationMode === 'client' && styles.segmentedButtonActive]}
              onPress={() => {
                setLocationMode('client');
                setLocationValue('');
              }}
            >
              <Text
                style={[
                  styles.segmentedButtonText,
                  locationMode === 'client' && styles.segmentedButtonTextActive,
                ]}
              >
                My location
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.locationInput}
            value={locationValue}
            onChangeText={setLocationValue}
            editable={locationMode === 'client'}
            placeholder={locationMode === 'client' ? 'Enter address' : provider?.location}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <Text style={styles.sectionTitle}>Add-ons (optional)</Text>
        <View style={styles.card}>
          {service.addOns.length ? (
            service.addOns.map((addOn) => {
              const selected = selectedAddOnIds.includes(addOn.id);
              return (
                <TouchableOpacity key={addOn.id} style={styles.addOnRow} onPress={() => toggleAddOn(addOn.id)}>
                  <View style={styles.addOnNameRow}>
                    <IconSymbol
                      ios_icon_name={selected ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={selected ? 'check-circle' : 'radio-button-unchecked'}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <Text style={styles.addOnName}>{addOn.name}</Text>
                  </View>
                  <Text style={styles.addOnPrice}>+ {formatCurrency(addOn.price)}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyCopy}>No add-ons available for this service.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base service</Text>
            <Text style={styles.priceValue}>{formatCurrency(service.startingPrice)}</Text>
          </View>

          {selectedAddOns.map((addOn) => (
            <View key={addOn.id} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{addOn.name}</Text>
              <Text style={styles.priceValue}>+ {formatCurrency(addOn.price)}</Text>
            </View>
          ))}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes</Text>
            <Text style={styles.priceValue}>{formatCurrency(taxes)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceTotal}>Total</Text>
            <Text style={styles.priceTotal}>{formatCurrency(total)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceDeposit}>Deposit due now</Text>
            <Text style={styles.priceDeposit}>{formatCurrency(depositPaid)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceRemaining}>Remaining balance</Text>
            <Text style={styles.priceRemaining}>{formatCurrency(remainingBalance)}</Text>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <TouchableOpacity style={styles.confirmButton} onPress={onConfirmBooking}>
          <Text style={styles.confirmButtonText}>
            {existingBooking ? 'Continue to Reschedule' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>

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
    paddingBottom: 24,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
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
    padding: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  providerMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dateRow: {
    gap: 8,
  },
  dateChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DCCFF7',
    backgroundColor: '#FAF8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
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
    minWidth: 88,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentedButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DCCFF7',
    backgroundColor: '#FAF8FF',
    alignItems: 'center',
  },
  segmentedButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  segmentedButtonTextActive: {
    color: '#FFFFFF',
  },
  locationInput: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DCF2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFFFFF',
  },
  addOnRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addOnNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  addOnName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  addOnPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCopy: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#ECE8F7',
  },
  priceTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  priceDeposit: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  priceRemaining: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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
  confirmButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 24,
  },
});
