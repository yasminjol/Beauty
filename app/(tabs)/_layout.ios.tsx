
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
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
      <NativeTabs.Trigger key="notifications" name="notifications">
        <Icon sf="bell.fill" drawable="notifications" />
        <Label>Alerts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" drawable="person" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
