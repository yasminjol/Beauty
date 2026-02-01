
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function BookingsScreen() {
  console.log('User viewing Bookings screen');

  const upcomingTitle = 'Upcoming Appointments';
  const pastTitle = 'Past Appointments';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol 
              ios_icon_name="plus" 
              android_material_icon_name="add" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{upcomingTitle}</Text>
          
          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.serviceIcon}>
                <IconSymbol 
                  ios_icon_name="scissors" 
                  android_material_icon_name="content-cut" 
                  size={24} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.serviceName}>Hair Styling</Text>
                <Text style={styles.providerName}>Elite Salon</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="calendar-today" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>Tomorrow, Jan 15</Text>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="clock" 
                  android_material_icon_name="access-time" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>10:00 AM</Text>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="location" 
                  android_material_icon_name="location-on" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>123 Main St</Text>
              </View>
            </View>
            <View style={styles.bookingActions}>
              <TouchableOpacity style={styles.actionButtonSecondary}>
                <Text style={styles.actionButtonSecondaryText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonPrimary}>
                <Text style={styles.actionButtonPrimaryText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.serviceIcon}>
                <IconSymbol 
                  ios_icon_name="sparkles" 
                  android_material_icon_name="auto-awesome" 
                  size={24} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.serviceName}>Manicure</Text>
                <Text style={styles.providerName}>Nail Studio</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="calendar-today" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>Jan 18, 2024</Text>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="clock" 
                  android_material_icon_name="access-time" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>2:30 PM</Text>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="location" 
                  android_material_icon_name="location-on" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>456 Oak Ave</Text>
              </View>
            </View>
            <View style={styles.bookingActions}>
              <TouchableOpacity style={styles.actionButtonSecondary}>
                <Text style={styles.actionButtonSecondaryText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonPrimary}>
                <Text style={styles.actionButtonPrimaryText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Past Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{pastTitle}</Text>
          
          <View style={styles.bookingCardPast}>
            <View style={styles.bookingHeader}>
              <View style={styles.serviceIcon}>
                <IconSymbol 
                  ios_icon_name="face.smiling" 
                  android_material_icon_name="face" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.serviceName}>Facial Treatment</Text>
                <Text style={styles.providerName}>Beauty Spa</Text>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="calendar-today" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>Jan 5, 2024</Text>
              </View>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle" 
                  android_material_icon_name="check-circle" 
                  size={16} 
                  color={colors.success} 
                />
                <Text style={styles.detailTextSuccess}>Completed</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Leave a Review</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingCardPast: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    opacity: 0.8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailTextSuccess: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  reviewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  bottomSpacer: {
    height: 100,
  },
});
