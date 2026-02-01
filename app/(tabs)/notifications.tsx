
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function NotificationsScreen() {
  console.log('User viewing Notifications screen');

  const todayTitle = 'Today';
  const earlierTitle = 'Earlier';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{todayTitle}</Text>
          
          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check-circle" 
                size={24} 
                color={colors.success} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Booking Confirmed</Text>
              <Text style={styles.notificationMessage}>Your appointment with Elite Salon has been confirmed for tomorrow at 10:00 AM</Text>
              <Text style={styles.notificationTime}>2 hours ago</Text>
            </View>
            <View style={styles.unreadDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={24} 
                color={colors.warning} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>New Service Available</Text>
              <Text style={styles.notificationMessage}>Beauty Studio just added a new premium facial treatment. Book now!</Text>
              <Text style={styles.notificationTime}>5 hours ago</Text>
            </View>
            <View style={styles.unreadDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="percent" 
                android_material_icon_name="local-offer" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Special Offer</Text>
              <Text style={styles.notificationMessage}>Get 20% off your next manicure at Nail Studio. Valid until Jan 20</Text>
              <Text style={styles.notificationTime}>8 hours ago</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Earlier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{earlierTitle}</Text>
          
          <TouchableOpacity style={styles.notificationCardRead}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="bell.fill" 
                android_material_icon_name="notifications" 
                size={24} 
                color={colors.textSecondary} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Reminder</Text>
              <Text style={styles.notificationMessage}>Your appointment is tomorrow at 10:00 AM. Don&apos;t forget!</Text>
              <Text style={styles.notificationTime}>Yesterday</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationCardRead}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="heart.fill" 
                android_material_icon_name="favorite" 
                size={24} 
                color={colors.error} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Review Request</Text>
              <Text style={styles.notificationMessage}>How was your experience at Beauty Spa? Leave a review</Text>
              <Text style={styles.notificationTime}>2 days ago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationCardRead}>
            <View style={styles.notificationIcon}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="calendar-today" 
                size={24} 
                color={colors.textSecondary} 
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>Booking Completed</Text>
              <Text style={styles.notificationMessage}>Thank you for visiting Beauty Spa. We hope to see you again soon!</Text>
              <Text style={styles.notificationTime}>5 days ago</Text>
            </View>
          </TouchableOpacity>
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
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationCard: {
    flexDirection: 'row',
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
  notificationCardRead: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    opacity: 0.7,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
