
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

// Mock data for booking requests
const mockBookingRequests = [
  {
    id: '1',
    clientName: 'Jessica Martinez',
    service: 'Bridal Makeup Package',
    date: 'Tomorrow',
    time: '3:00 PM',
  },
  {
    id: '2',
    clientName: 'David Kim',
    service: 'Hair Styling',
    date: 'Dec 28',
    time: '11:00 AM',
  },
];

// Mock data for upcoming bookings
const mockUpcomingBookings = [
  {
    id: '1',
    clientName: 'Emma Wilson',
    service: 'Hair Styling & Color',
    date: 'Today',
    time: '10:00 AM',
    status: 'confirmed',
  },
  {
    id: '2',
    clientName: 'Michael Chen',
    service: 'Premium Haircut',
    date: 'Today',
    time: '11:30 AM',
    status: 'confirmed',
  },
  {
    id: '3',
    clientName: 'Sofia Rodriguez',
    service: 'Bridal Makeup',
    date: 'Tomorrow',
    time: '2:00 PM',
    status: 'confirmed',
  },
  {
    id: '4',
    clientName: 'James Anderson',
    service: 'Spa Treatment',
    date: 'Dec 27',
    time: '4:00 PM',
    status: 'confirmed',
  },
];

export default function ProviderCalendarScreen() {
  console.log('Provider viewing Calendar/Bookings screen');

  const bookingRequestsTitle = 'Booking Requests';
  const upcomingBookingsTitle = 'Upcoming Bookings';
  const calendarHeaderTitle = 'December 2024';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol 
              ios_icon_name="calendar" 
              android_material_icon_name="calendar-today" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Calendar Header Placeholder */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity>
            <IconSymbol 
              ios_icon_name="chevron.left" 
              android_material_icon_name="chevron-left" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
          <Text style={styles.calendarHeaderText}>{calendarHeaderTitle}</Text>
          <TouchableOpacity>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Booking Requests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{bookingRequestsTitle}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{mockBookingRequests.length}</Text>
            </View>
          </View>
          
          {mockBookingRequests.map((request, index) => (
            <React.Fragment key={index}>
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.clientAvatar}>
                    <IconSymbol 
                      ios_icon_name="person.fill" 
                      android_material_icon_name="person" 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.clientName}>{request.clientName}</Text>
                    <Text style={styles.serviceName}>{request.service}</Text>
                    <View style={styles.requestDateTime}>
                      <IconSymbol 
                        ios_icon_name="calendar" 
                        android_material_icon_name="calendar-today" 
                        size={14} 
                        color={colors.textSecondary} 
                      />
                      <Text style={styles.dateTimeText}>{request.date}</Text>
                      <Text style={styles.dateTimeText}>•</Text>
                      <Text style={styles.dateTimeText}>{request.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.declineButton}>
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Upcoming Bookings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{upcomingBookingsTitle}</Text>
          
          {mockUpcomingBookings.map((booking, index) => {
            const statusText = booking.status === 'confirmed' ? 'Confirmed' : booking.status;
            return (
              <React.Fragment key={index}>
                <View style={styles.bookingCard}>
                  <View style={styles.bookingTime}>
                    <Text style={styles.bookingDate}>{booking.date}</Text>
                    <Text style={styles.bookingTimeText}>{booking.time}</Text>
                  </View>
                  <View style={styles.bookingContent}>
                    <Text style={styles.bookingClientName}>{booking.clientName}</Text>
                    <Text style={styles.bookingService}>{booking.service}</Text>
                    <View style={styles.bookingStatusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.bookingStatusText}>{statusText}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.bookingArrow}>
                    <IconSymbol 
                      ios_icon_name="chevron.right" 
                      android_material_icon_name="chevron-right" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            );
          })}
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  requestHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  requestDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingTime: {
    marginRight: 16,
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bookingTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  bookingContent: {
    flex: 1,
  },
  bookingClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  bookingService: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  bookingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  bookingStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  bookingArrow: {
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
