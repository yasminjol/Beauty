
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';
import { useMessages } from '@/contexts/MessagesContext';

export default function ProviderTabLayout() {
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
      <NativeTabs.Trigger key="dashboard" name="dashboard">
        <Icon sf="square.grid.2x2.fill" drawable="dashboard" />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="bookings" name="bookings">
        <Icon sf="calendar" drawable="event" />
        <Label>Bookings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="messages" name="messages">
        <Icon sf="message.fill" drawable="chat" />
        <Label>{messageLabel}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="services" name="services">
        <Icon sf="briefcase.fill" drawable="work" />
        <Label>Services</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="me-home" name="me-home">
        <Icon sf="person.fill" drawable="person" />
        <Label>Me</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
