
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function ProviderTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="dashboard" name="dashboard">
        <Icon sf="square.grid.2x2.fill" drawable="dashboard" />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="bookings" name="bookings">
        <Icon sf="calendar" drawable="event" />
        <Label>Bookings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="post" name="post">
        <Icon sf="plus.circle.fill" drawable="add-circle" />
        <Label>Post</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="services" name="services">
        <Icon sf="briefcase.fill" drawable="work" />
        <Label>Services</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="subscription" name="subscription">
        <Icon sf="creditcard.fill" drawable="card-membership" />
        <Label>Plan</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="provider-profile" name="provider-profile">
        <Icon sf="person.fill" drawable="person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
