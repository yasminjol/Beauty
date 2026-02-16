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
import {
  ClientBooking,
} from '@/constants/clientBookings';
import { colors } from '@/styles/commonStyles';
import { useClientBookings } from '@/contexts/ClientBookingsContext';
import { useMessages } from '@/contexts/MessagesContext';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (!hours) return `${mins} min`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const getStatusTheme = (status: ClientBooking['status']) => {
  if (status === 'Reschedule Pending') {
    return { backgroundColor: '#FFF6E5', color: '#A26900' };
  }

  if (status === 'Completed') {
    return { backgroundColor: '#EAF8F0', color: '#2E7D32' };
  }

  if (status === 'Cancelled') {
    return { backgroundColor: '#FFF1F1', color: '#CC3D3D' };
  }

  if (status === 'In Progress') {
    return { backgroundColor: '#EFE9FF', color: colors.primary };
  }

  return { backgroundColor: '#EDE6FF', color: colors.primary };
};

function PricingLine({
  label,
  value,
  emphasized,
  negative,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
  negative?: boolean;
}) {
  return (
    <View style={styles.pricingRow}>
      <Text
        style={[
          styles.pricingLabel,
          emphasized && styles.pricingLabelStrong,
          negative && styles.pricingLabelNegative,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.pricingValue,
          emphasized && styles.pricingValueStrong,
          negative && styles.pricingValueNegative,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function BookingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const { bookings, getBookingById, updateBookingStatus, clearRescheduleNotice } = useClientBookings();
  const { ensureConversation } = useMessages();

  const bookingId = getParam(params.bookingId);
  const booking = getBookingById(bookingId) ?? bookings[0];

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateTitle}>No booking details available</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.replace('/(tabs)/bookings' as never)}>
            <Text style={styles.emptyStateButtonText}>Back to bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusTheme = getStatusTheme(booking.status);

  const addOnsTotal = useMemo(
    () => booking.addOns.reduce((sum, addOn) => sum + addOn.price, 0),
    [booking.addOns],
  );
  const subtotal = booking.basePrice + addOnsTotal;
  const total = subtotal + booking.taxes;
  const remainingBalance = Math.max(total - booking.depositPaid, 0);

  const initials = booking.providerBusiness
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();

  const isUpcoming = booking.status === 'Confirmed';
  const isReschedulePending = booking.status === 'Reschedule Pending';
  const isCompleted = booking.status === 'Completed';
  const isInProgress = booking.status === 'In Progress';
  const canMessageProvider =
    Boolean(booking.providerId) &&
    (booking.status === 'Confirmed' ||
      booking.status === 'Reschedule Pending' ||
      booking.status === 'In Progress');

  const handleAction = (label: string) => {
    setMessage(`${label} (mock)`);
    setTimeout(() => setMessage(null), 2200);
  };

  const handleCancelBooking = () => {
    updateBookingStatus(booking.id, 'Cancelled');
    setMessage('Booking cancelled (mock)');
    setTimeout(() => setMessage(null), 2200);
  };

  const handleReschedule = () => {
    if (!booking.serviceId) {
      handleAction('Reschedule flow unavailable');
      return;
    }

    router.push({
      pathname: '/reschedule-booking',
      params: {
        bookingId: booking.id,
      },
    } as never);
  };

  const handleOpenMessage = () => {
    if (!booking.providerId) return;

    const conversationId = ensureConversation({
      providerId: booking.providerId,
      providerName: booking.providerName,
      providerBusiness: booking.providerBusiness,
      providerLocation: booking.providerLocation,
      bookingId: booking.id,
    });

    router.push({
      pathname: '/chat-thread',
      params: { conversationId },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {message ? (
          <View style={styles.messageBanner}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {booking.rescheduleNotice ? (
          <View style={styles.rescheduleNoticeBanner}>
            <View style={styles.rescheduleNoticeRow}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.rescheduleNoticeText}>{booking.rescheduleNotice}</Text>
            </View>
            <TouchableOpacity onPress={() => clearRescheduleNotice(booking.id)}>
              <Text style={styles.rescheduleNoticeDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <View style={styles.overviewTopRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials || 'EW'}</Text>
            </View>

            <View style={styles.providerMetaWrap}>
              <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
              <Text style={styles.providerName}>{booking.providerName}</Text>
              <Text style={styles.providerBusiness}>{booking.providerBusiness}</Text>
            </View>

            <View style={[styles.statusPill, { backgroundColor: statusTheme.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusTheme.color }]}>{booking.status}</Text>
            </View>
          </View>

          <View style={styles.overviewInfoRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.overviewInfoText}>
              {booking.appointmentDateLabel} at {booking.appointmentTimeLabel}
            </Text>
          </View>

          <View style={styles.overviewInfoRow}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="schedule"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.overviewInfoText}>{formatDuration(booking.durationMinutes)}</Text>
          </View>

          <View style={styles.overviewInfoRow}>
            <IconSymbol
              ios_icon_name="location"
              android_material_icon_name="location-on"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.overviewInfoText}>{booking.serviceLocation}</Text>
          </View>

          {booking.hasMapPreview ? (
            <View style={styles.mapCard}>
              <View style={styles.mapPreviewSurface}>
                <IconSymbol
                  ios_icon_name="map"
                  android_material_icon_name="map"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.mapPreviewText}>Map preview (mock)</Text>
              </View>
              <Text style={styles.mapMeta}>{booking.providerLocation}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
        <View style={styles.sectionCard}>
          <PricingLine label="Base service" value={formatCurrency(booking.basePrice)} />

          {booking.addOns.map((addOn) => (
            <PricingLine
              key={addOn.id}
              label={`Add-on: ${addOn.name}`}
              value={formatCurrency(addOn.price)}
            />
          ))}

          <View style={styles.rowDivider} />
          <PricingLine label="Subtotal" value={formatCurrency(subtotal)} />
          <PricingLine label="Taxes" value={formatCurrency(booking.taxes)} />
          <PricingLine
            label="Deposit paid"
            value={`- ${formatCurrency(booking.depositPaid)}`}
            negative
          />

          <View style={styles.rowDivider} />
          <PricingLine label="Total amount" value={formatCurrency(total)} emphasized />
          <PricingLine
            label="Remaining balance"
            value={formatCurrency(remainingBalance)}
            emphasized
          />
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.sectionCard}>
          {isUpcoming && booking.cancellationNotice ? (
            <View style={styles.noticeBanner}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.noticeText}>{booking.cancellationNotice}</Text>
            </View>
          ) : null}

          {isUpcoming ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleReschedule}
              >
                <Text style={styles.actionButtonPrimaryText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleCancelBooking}
              >
                <Text style={styles.actionButtonSecondaryText}>Cancel Booking</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isReschedulePending ? (
            <>
              <View style={styles.pendingRescheduleCard}>
                <Text style={styles.pendingRescheduleTitle}>Reschedule Pending</Text>
                <Text style={styles.pendingRescheduleText}>
                  Requested: {booking.pendingRescheduleRequest?.newDateLabel} at {booking.pendingRescheduleRequest?.newTimeLabel}
                </Text>
                <Text style={styles.pendingRescheduleText}>
                  Current slot remains {booking.pendingRescheduleRequest?.oldDateLabel} at {booking.pendingRescheduleRequest?.oldTimeLabel}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleReschedule}
              >
                <Text style={styles.actionButtonSecondaryText}>Choose Another Time</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isCompleted ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() =>
                  router.push({
                    pathname: '/search-booking',
                    params: { serviceId: booking.serviceId ?? 'service-boho-knotless' },
                  } as never)
                }
              >
                <Text style={styles.actionButtonPrimaryText}>Rebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.actionButtonSecondary,
                  booking.hasReview && styles.actionButtonDisabled,
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/leave-review',
                    params: { bookingId: booking.id },
                  } as never)
                }
                disabled={booking.hasReview}
              >
                <Text
                  style={[
                    styles.actionButtonSecondaryText,
                    booking.hasReview && styles.actionButtonDisabledText,
                  ]}
                >
                  {booking.hasReview ? 'Review Submitted' : 'Leave Review'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          {isInProgress ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleAction('Live tracker opened')}
              >
                <Text style={styles.actionButtonPrimaryText}>View Live Tracker</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {booking.status === 'Cancelled' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() =>
                router.push({
                  pathname: '/search-booking',
                  params: { serviceId: booking.serviceId ?? 'service-boho-knotless' },
                } as never)
              }
            >
              <Text style={styles.actionButtonPrimaryText}>Rebook</Text>
            </TouchableOpacity>
          ) : null}

          {canMessageProvider ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleOpenMessage}
            >
              <Text style={styles.actionButtonSecondaryText}>Message Provider</Text>
            </TouchableOpacity>
          ) : null}
        </View>

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
  emptyStateWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E3DDF4',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  messageBanner: {
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#EEE8FF',
    borderWidth: 1,
    borderColor: '#E2D7FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  rescheduleNoticeBanner: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD2FF',
    backgroundColor: '#F4EEFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rescheduleNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rescheduleNoticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.primary,
  },
  rescheduleNoticeDismiss: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE8F7',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  providerMetaWrap: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  providerName: {
    marginTop: 1,
    fontSize: 13,
    color: colors.text,
  },
  providerBusiness: {
    marginTop: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  overviewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  overviewInfoText: {
    marginLeft: 8,
    fontSize: 13.5,
    color: colors.text,
    flex: 1,
  },
  mapCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5DEF6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPreviewSurface: {
    height: 102,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreviewText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  mapMeta: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: colors.textSecondary,
    backgroundColor: '#FAF9FF',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  pricingLabel: {
    fontSize: 14,
    color: colors.text,
  },
  pricingLabelStrong: {
    fontWeight: '700',
    color: colors.primary,
  },
  pricingLabelNegative: {
    color: '#B04141',
  },
  pricingValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  pricingValueStrong: {
    color: colors.primary,
    fontWeight: '700',
  },
  pricingValueNegative: {
    color: '#B04141',
  },
  rowDivider: {
    marginTop: 4,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#ECE8F7',
  },
  noticeBanner: {
    backgroundColor: '#F2EDFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.primary,
  },
  pendingRescheduleCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1D6FA',
    backgroundColor: '#FAF7FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pendingRescheduleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  pendingRescheduleText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: '#C8B7F2',
    backgroundColor: '#F8F4FF',
  },
  actionButtonDisabled: {
    borderColor: '#E0D9EE',
    backgroundColor: '#F5F3FA',
  },
  actionButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  actionButtonDisabledText: {
    color: '#A6A5D0',
  },
  bottomSpacer: {
    height: 40,
  },
});
