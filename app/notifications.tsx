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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  AppNotification,
  NotificationType,
  useNotifications,
} from '@/contexts/NotificationsContext';

const formatNotificationTime = (createdAt: string) => {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(now - created, 0);

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.round(diffMs / minuteMs));
    return `${minutes}m ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.round(diffMs / hourMs));
    return `${hours}h ago`;
  }

  const days = Math.max(1, Math.round(diffMs / dayMs));
  if (days === 1) return 'Yesterday';

  return `${days}d ago`;
};

const notificationIconMap: Record<
  NotificationType,
  { icon: keyof typeof MaterialIcons.glyphMap; color: string }
> = {
  booking: { icon: 'check-circle', color: '#2E7D32' },
  reminder: { icon: 'schedule', color: colors.primary },
  payment: { icon: 'payments', color: '#1F7A4F' },
  cancellation: { icon: 'cancel', color: '#D14343' },
  promotion: { icon: 'local-offer', color: '#9C6A00' },
  review: { icon: 'star', color: '#A26900' },
  system: { icon: 'info', color: colors.textSecondary },
  message: { icon: 'mark-chat-unread', color: colors.primary },
};

function NotificationCard({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const iconTheme = notificationIconMap[notification.type];

  return (
    <TouchableOpacity style={styles.notificationCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.iconWrap}>
        <IconSymbol
          ios_icon_name="bell.fill"
          android_material_icon_name={iconTheme.icon}
          size={20}
          color={iconTheme.color}
        />
      </View>

      <View style={styles.notificationMain}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>{formatNotificationTime(notification.createdAt)}</Text>
        </View>

        <Text style={styles.notificationBody} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      {!notification.read ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    todayNotifications,
    earlierNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useNotifications();

  const openNotification = (notification: AppNotification) => {
    markNotificationRead(notification.id);

    if (!notification.deepLink) return;

    router.push({
      pathname: notification.deepLink.pathname as never,
      params: notification.deepLink.params,
    } as never);
  };

  const hasNotifications = todayNotifications.length > 0 || earlierNotifications.length > 0;

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

          <Text style={styles.title}>Notifications</Text>

          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {!hasNotifications ? (
          <View style={styles.emptyCard}>
            <IconSymbol
              ios_icon_name="bell"
              android_material_icon_name="notifications-none"
              size={24}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              Booking updates, reminders, and system events will show here.
            </Text>
          </View>
        ) : null}

        {todayNotifications.length > 0 ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => openNotification(notification)}
              />
            ))}
          </View>
        ) : null}

        {earlierNotifications.length > 0 ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {earlierNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => openNotification(notification)}
              />
            ))}
          </View>
        ) : null}

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
    paddingBottom: 18,
  },
  headerRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3DDF4',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionWrap: {
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE8F7',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMain: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  notificationTime: {
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  notificationBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyCard: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAE4F7',
    backgroundColor: colors.card,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 16,
  },
});
