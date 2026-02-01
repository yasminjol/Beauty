
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

// Mock data for today's appointments
const mockAppointments = [
  {
    id: '1',
    clientName: 'Emma Wilson',
    service: 'Hair Styling & Color',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: '2',
    clientName: 'Michael Chen',
    service: 'Premium Haircut',
    time: '11:30 AM',
    status: 'upcoming',
  },
  {
    id: '3',
    clientName: 'Sofia Rodriguez',
    service: 'Bridal Makeup',
    time: '2:00 PM',
    status: 'upcoming',
  },
];

const currentAppointment = {
  clientName: 'Emma Wilson',
  service: 'Hair Styling & Color',
  time: '10:00 AM - 11:00 AM',
  status: 'In Progress',
};

export default function ProviderDashboardScreen() {
  console.log('Provider viewing Dashboard screen');

  const welcomeText = 'Welcome back,';
  const providerName = 'Sarah';
  const currentAppointmentTitle = 'Current Appointment';
  const todayAppointmentsTitle = "Today's Appointments";
  const liveTrackerTitle = 'Live Client Tracker';
  const statusText = currentAppointment.status;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{welcomeText}</Text>
            <Text style={styles.providerName}>{providerName}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol 
              ios_icon_name="bell.fill" 
              android_material_icon_name="notifications" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$2.4k</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* Current Appointment Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{currentAppointmentTitle}</Text>
          <View style={styles.currentAppointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.clientAvatar}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.clientName}>{currentAppointment.clientName}</Text>
                <Text style={styles.serviceName}>{currentAppointment.service}</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <IconSymbol 
                  ios_icon_name="clock.fill" 
                  android_material_icon_name="access-time" 
                  size={16} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.detailText}>{currentAppointment.time}</Text>
              </View>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.actionButtonSecondary}>
                <Text style={styles.actionButtonSecondaryText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonPrimary}>
                <Text style={styles.actionButtonPrimaryText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Live Tracker Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{liveTrackerTitle}</Text>
          <View style={styles.trackerPlaceholder}>
            <IconSymbol 
              ios_icon_name="location.fill" 
              android_material_icon_name="location-on" 
              size={48} 
              color={colors.secondary} 
            />
            <Text style={styles.trackerPlaceholderTitle}>Real-Time Tracking</Text>
            <Text style={styles.trackerPlaceholderText}>
              Client location will appear here once they start moving toward your location
            </Text>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{todayAppointmentsTitle}</Text>
          {mockAppointments.map((appointment, index) => {
            const appointmentStatus = appointment.status === 'upcoming' ? 'Upcoming' : appointment.status;
            return (
              <React.Fragment key={index}>
                <View style={styles.appointmentCard}>
                  <View style={styles.appointmentTime}>
                    <Text style={styles.timeText}>{appointment.time}</Text>
                  </View>
                  <View style={styles.appointmentContent}>
                    <Text style={styles.appointmentClientName}>{appointment.clientName}</Text>
                    <Text style={styles.appointmentService}>{appointment.service}</Text>
                    <View style={styles.appointmentStatusBadge}>
                      <Text style={styles.appointmentStatusText}>{appointmentStatus}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.appointmentArrow}>
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
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  providerName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
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
  currentAppointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
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
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  trackerPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  trackerPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  trackerPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  appointmentCard: {
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
  appointmentTime: {
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentClientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  appointmentStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appointmentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  appointmentArrow: {
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
