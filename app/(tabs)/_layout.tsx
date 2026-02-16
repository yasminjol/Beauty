
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useMessages } from '@/contexts/MessagesContext';

export default function TabLayout() {
  const { totalUnreadCount } = useMessages();

  // Client tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'search',
      route: '/(tabs)/search',
      icon: 'search',
      label: 'Search',
    },
    {
      name: 'bookings',
      route: '/(tabs)/bookings',
      icon: 'calendar-today',
      label: 'Bookings',
    },
    {
      name: 'messages',
      route: '/(tabs)/messages',
      icon: 'chat',
      label: 'Messages',
      badgeCount: totalUnreadCount,
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
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
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="search" name="search" />
        <Stack.Screen key="bookings" name="bookings" />
        <Stack.Screen key="messages" name="messages" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
