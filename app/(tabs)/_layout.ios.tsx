
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/contexts/MessagesContext';

export default function TabLayout() {
  const { totalUnreadCount } = useMessages();
  const messageLabel = totalUnreadCount > 0 ? `Messages (${Math.min(totalUnreadCount, 9)}${totalUnreadCount > 9 ? '+' : ''})` : 'Messages';

  return (
    <NativeTabs
      tintColor={colors.primary}
      backgroundColor={colors.card}
      iconColor={{ default: '#9FA3AF', selected: colors.primary }}
      labelStyle={{
        default: { color: '#9FA3AF', fontSize: 11 },
        selected: { color: colors.primary, fontSize: 11, fontWeight: '600' },
      }}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" drawable="home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="search" name="search">
        <Icon sf="magnifyingglass" drawable="search" />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="bookings" name="bookings">
        <Icon sf="calendar" drawable="calendar-today" />
        <Label>Bookings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="messages" name="messages">
        <Icon sf="message.fill" drawable="chat" />
        <Label>{messageLabel}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" drawable="person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
