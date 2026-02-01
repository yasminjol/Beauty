
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function ProviderTabLayout() {
  // Provider tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: 'dashboard',
      route: '/(provider-tabs)/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
    },
    {
      name: 'calendar',
      route: '/(provider-tabs)/calendar',
      icon: 'calendar-today',
      label: 'Calendar',
    },
    {
      name: 'post',
      route: '/(provider-tabs)/post',
      icon: 'add-circle',
      label: 'Post',
    },
    {
      name: 'services',
      route: '/(provider-tabs)/services',
      icon: 'work',
      label: 'Services',
    },
    {
      name: 'subscription',
      route: '/(provider-tabs)/subscription',
      icon: 'card-membership',
      label: 'Plan',
    },
    {
      name: 'provider-profile',
      route: '/(provider-tabs)/provider-profile',
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
        <Stack.Screen key="dashboard" name="dashboard" />
        <Stack.Screen key="calendar" name="calendar" />
        <Stack.Screen key="post" name="post" />
        <Stack.Screen key="services" name="services" />
        <Stack.Screen key="subscription" name="subscription" />
        <Stack.Screen key="provider-profile" name="provider-profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
