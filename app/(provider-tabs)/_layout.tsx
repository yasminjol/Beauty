
import React from 'react';
import { Href, Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useMessages } from '@/contexts/MessagesContext';

export default function ProviderTabLayout() {
  const { totalUnreadCount } = useMessages();

  // Provider tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: 'dashboard',
      route: '/(provider-tabs)/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      name: 'bookings',
      route: '/(provider-tabs)/bookings',
      icon: 'event',
      label: 'Bookings',
    },
    {
      name: 'messages',
      route: '/(provider-tabs)/messages',
      icon: 'chat',
      label: 'Messages',
      badgeCount: totalUnreadCount,
    },
    {
      name: 'services',
      route: '/(provider-tabs)/services',
      icon: 'work',
      label: 'Services',
    },
    {
      name: 'me-home',
      route: '/(provider-tabs)/me-home' as Href,
      icon: 'person',
      label: 'Me',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="dashboard" name="dashboard" />
        <Stack.Screen key="bookings" name="bookings" />
        <Stack.Screen key="messages" name="messages" />
        <Stack.Screen key="post" name="post" />
        <Stack.Screen key="services" name="services" />
        <Stack.Screen key="me-home" name="me-home" />
        <Stack.Screen key="subscription" name="subscription" />
        <Stack.Screen key="provider-profile" name="provider-profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
