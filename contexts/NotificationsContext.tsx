import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type NotificationType =
  | 'booking'
  | 'reminder'
  | 'payment'
  | 'cancellation'
  | 'promotion'
  | 'review'
  | 'system'
  | 'message';

export type NotificationDeepLink = {
  pathname: string;
  params?: Record<string, string>;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deepLink?: NotificationDeepLink;
};

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  createdAt?: string;
  read?: boolean;
  deepLink?: NotificationDeepLink;
};

type NotificationsContextValue = {
  notifications: AppNotification[];
  todayNotifications: AppNotification[];
  earlierNotifications: AppNotification[];
  unreadCount: number;
  addNotification: (input: CreateNotificationInput) => AppNotification;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const nowMs = Date.now();
const minutesAgo = (minutes: number) => new Date(nowMs - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(nowMs - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(nowMs - days * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-booking-confirmed',
    type: 'booking',
    title: 'Booking confirmed',
    body: 'Glow House Studio confirmed your Boho Knotless Braids appointment.',
    createdAt: hoursAgo(2),
    read: false,
    deepLink: { pathname: '/booking-details', params: { bookingId: 'booking-101' } },
  },
  {
    id: 'notif-booking-reminder',
    type: 'reminder',
    title: 'Booking reminder',
    body: 'Your appointment starts tomorrow at 10:00 AM.',
    createdAt: hoursAgo(5),
    read: false,
    deepLink: { pathname: '/booking-details', params: { bookingId: 'booking-101' } },
  },
  {
    id: 'notif-payment',
    type: 'payment',
    title: 'Payment confirmed',
    body: 'Deposit payment of $90.00 was received successfully.',
    createdAt: hoursAgo(8),
    read: true,
    deepLink: { pathname: '/booking-details', params: { bookingId: 'booking-101' } },
  },
  {
    id: 'notif-message-seed',
    type: 'message',
    title: 'New message from Glow House Studio',
    body: 'Can you arrive 10 minutes early if possible?',
    createdAt: minutesAgo(24),
    read: false,
    deepLink: { pathname: '/chat-thread', params: { conversationId: 'conversation-1' } },
  },
  {
    id: 'notif-provider-cancel',
    type: 'cancellation',
    title: 'Provider cancellation',
    body: 'A previous Loc Retwist booking was cancelled by the provider.',
    createdAt: daysAgo(1),
    read: true,
    deepLink: { pathname: '/booking-details', params: { bookingId: 'booking-104' } },
  },
  {
    id: 'notif-promo',
    type: 'promotion',
    title: 'Limited-time offer',
    body: '20% off Luxury Gel-X Set this week only.',
    createdAt: daysAgo(2),
    read: true,
    deepLink: { pathname: '/search-service-details', params: { serviceId: 'service-luxury-gelx' } },
  },
  {
    id: 'notif-review-request',
    type: 'review',
    title: 'Leave a review',
    body: 'Tell others how your Hybrid Lash Fill appointment went.',
    createdAt: daysAgo(3),
    read: true,
    deepLink: { pathname: '/booking-details', params: { bookingId: 'booking-103' } },
  },
  {
    id: 'notif-system-update',
    type: 'system',
    title: 'System update',
    body: 'We improved booking reliability and refreshed appointment tracking.',
    createdAt: daysAgo(4),
    read: true,
  },
];

const sortByDateDesc = (a: AppNotification, b: AppNotification) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    [...INITIAL_NOTIFICATIONS].sort(sortByDateDesc),
  );

  const addNotification = useCallback((input: CreateNotificationInput) => {
    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: input.createdAt ?? new Date().toISOString(),
      read: input.read ?? false,
      deepLink: input.deepLink,
    };

    setNotifications((current) => [notification, ...current].sort(sortByDateDesc));
    return notification;
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }, []);

  const { todayNotifications, earlierNotifications, unreadCount } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const today: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    notifications.forEach((notification) => {
      const createdAt = new Date(notification.createdAt);
      if (createdAt.getTime() >= startOfToday.getTime()) {
        today.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return {
      todayNotifications: today,
      earlierNotifications: earlier,
      unreadCount: notifications.filter((notification) => !notification.read).length,
    };
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      todayNotifications,
      earlierNotifications,
      unreadCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      notifications,
      todayNotifications,
      earlierNotifications,
      unreadCount,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }

  return context;
}
