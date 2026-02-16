import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useClientBookings } from '@/contexts/ClientBookingsContext';
import { EmptyStateCard, ProfileHeader, ProfileScaffold } from './_ui';

const statusTheme = (status: string) => {
  if (status === 'Completed') {
    return { backgroundColor: '#E9F8EF', textColor: '#2E7D32' };
  }

  if (status === 'Cancelled') {
    return { backgroundColor: '#FFF1F1', textColor: '#D14343' };
  }

  return { backgroundColor: '#F1ECFF', textColor: colors.primary };
};

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { pastBookings } = useClientBookings();

  return (
    <ProfileScaffold>
      <ProfileHeader title="Booking History" withBack />

      {pastBookings.length === 0 ? (
        <EmptyStateCard
          title="No past bookings"
          description="Completed and cancelled appointments will appear here."
          icon="history"
        />
      ) : (
        pastBookings.map((booking) => {
          const theme = statusTheme(booking.status);

          return (
            <TouchableOpacity
              key={booking.id}
              style={styles.historyCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/booking-details',
                  params: { bookingId: booking.id },
                } as never)
              }
            >
              <View style={styles.historyMain}>
                <Text style={styles.serviceName}>{booking.serviceName}</Text>
                <Text style={styles.providerName}>{booking.providerBusiness}</Text>
                <Text style={styles.metaText}>
                  {booking.appointmentDateLabel} • {booking.appointmentTimeLabel}
                </Text>
              </View>

              <View style={styles.rightMeta}>
                <View style={[styles.statusChip, { backgroundColor: theme.backgroundColor }]}>
                  <Text style={[styles.statusChipText, { color: theme.textColor }]}>{booking.status}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  historyMain: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  providerName: {
    marginTop: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  metaText: {
    marginTop: 3,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  rightMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
