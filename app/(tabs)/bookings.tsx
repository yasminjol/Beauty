import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { ClientBooking } from '@/constants/clientBookings';
import { useClientBookings } from '@/contexts/ClientBookingsContext';
import { useMessages } from '@/contexts/MessagesContext';

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
    return {
      backgroundColor: '#FFF5E4',
      color: '#A26900',
      icon: 'hourglass-empty' as const,
    };
  }

  if (status === 'Completed') {
    return {
      backgroundColor: '#EAF8F0',
      color: '#2E7D32',
      icon: 'check-circle' as const,
    };
  }

  if (status === 'Cancelled') {
    return {
      backgroundColor: '#FFF2F2',
      color: '#D14343',
      icon: 'cancel' as const,
    };
  }

  if (status === 'In Progress') {
    return {
      backgroundColor: '#EFE9FF',
      color: colors.primary,
      icon: 'schedule' as const,
    };
  }

  return {
    backgroundColor: '#EEE7FF',
    color: colors.primary,
    icon: 'verified' as const,
  };
};

function BookingCard({
  booking,
  onPress,
  onMessagePress,
}: {
  booking: ClientBooking;
  onPress: () => void;
  onMessagePress?: () => void;
}) {
  const statusTheme = getStatusTheme(booking.status);
  const addOnsTotal = booking.addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const total = booking.basePrice + addOnsTotal + booking.taxes;
  const remaining = Math.max(total - booking.depositPaid, 0);
  const showMessageAction = booking.status === 'Confirmed' && Boolean(onMessagePress);

  const initials = booking.providerBusiness
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.bookingCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.bookingHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials || 'EW'}</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.serviceName}>{booking.serviceName}</Text>
          <Text style={styles.providerBusiness}>{booking.providerBusiness}</Text>
        </View>

        <View style={styles.headerRightActions}>
          {showMessageAction ? (
            <TouchableOpacity
              style={styles.messageQuickButton}
              onPress={(event) => {
                event.stopPropagation();
                onMessagePress?.();
              }}
            >
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="chat"
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          ) : null}

          <View style={[styles.statusPill, { backgroundColor: statusTheme.backgroundColor }]}>
            <IconSymbol
              ios_icon_name="circle.fill"
              android_material_icon_name={statusTheme.icon}
              size={13}
              color={statusTheme.color}
            />
            <Text style={[styles.statusPillText, { color: statusTheme.color }]}>{booking.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailRow}>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.detailText}>
            {booking.appointmentDateLabel} • {booking.appointmentTimeLabel}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol
            ios_icon_name="clock"
            android_material_icon_name="schedule"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.detailText}>{formatDuration(booking.durationMinutes)}</Text>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol
            ios_icon_name="location"
            android_material_icon_name="location-on"
            size={15}
            color={colors.textSecondary}
          />
          <Text style={styles.detailText} numberOfLines={1}>
            {booking.serviceLocation}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.footerPrimary}>Deposit paid {formatCurrency(booking.depositPaid)}</Text>
          <Text style={styles.footerSecondary}>Remaining balance {formatCurrency(remaining)}</Text>
        </View>

        <View style={styles.footerAction}>
          <Text style={styles.footerActionText}>View details</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={18}
            color={colors.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { upcomingBookings, pastBookings } = useClientBookings();
  const { ensureConversation } = useMessages();

  const openDetails = (bookingId: string) => {
    router.push({ pathname: '/booking-details', params: { bookingId } } as never);
  };

  const openMessages = (booking: ClientBooking) => {
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
      params: {
        conversationId,
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Bookings</Text>
          <Text style={styles.subtitle}>Tap any appointment to view full booking details.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>

          {upcomingBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => openDetails(booking.id)}
              onMessagePress={() => openMessages(booking)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Appointments</Text>

          {pastBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onPress={() => openDetails(booking.id)} />
          ))}
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
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 4,
    paddingBottom: 16,
  },
  headerWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECE8F7',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  headerTextWrap: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  providerBusiness: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageQuickButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D7C8F7',
    backgroundColor: '#F5EFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13.5,
    color: colors.text,
    flex: 1,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEAF8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerPrimary: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerSecondary: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomSpacer: {
    height: 96,
  },
});
