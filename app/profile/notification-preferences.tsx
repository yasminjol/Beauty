import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { ProfileHeader, ProfileScaffold, SectionCard, SectionLabel, profileUiStyles } from './_ui';

type CategoryKey =
  | 'bookingUpdates'
  | 'bookingReminders'
  | 'payments'
  | 'promotions'
  | 'reviewRequests'
  | 'systemUpdates';

type ChannelKey = 'push' | 'email' | 'inApp';

const categoryLabels: Record<CategoryKey, { title: string; description: string }> = {
  bookingUpdates: {
    title: 'Booking confirmations',
    description: 'Confirmations, changes, and provider updates',
  },
  bookingReminders: {
    title: 'Booking reminders',
    description: 'Upcoming appointment reminders and schedule notices',
  },
  payments: {
    title: 'Payments',
    description: 'Deposit receipts and payment status alerts',
  },
  promotions: {
    title: 'Promotions',
    description: 'Deals, offers, and seasonal recommendations',
  },
  reviewRequests: {
    title: 'Review requests',
    description: 'Prompts to review completed services',
  },
  systemUpdates: {
    title: 'System updates',
    description: 'Important app and policy updates',
  },
};

export default function NotificationPreferencesScreen() {
  const [categories, setCategories] = useState<Record<CategoryKey, boolean>>({
    bookingUpdates: true,
    bookingReminders: true,
    payments: true,
    promotions: false,
    reviewRequests: true,
    systemUpdates: true,
  });

  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({
    push: true,
    email: false,
    inApp: true,
  });

  return (
    <ProfileScaffold>
      <ProfileHeader title="Notifications" withBack />

      <SectionLabel label="NOTIFICATION TYPES" />
      <SectionCard>
        {(Object.keys(categoryLabels) as CategoryKey[]).map((key, index, array) => {
          const item = categoryLabels[key];
          const isLast = index === array.length - 1;

          return (
            <View key={key} style={[styles.preferenceRow, isLast && styles.preferenceRowLast]}>
              <View style={styles.preferenceTextWrap}>
                <Text style={styles.preferenceTitle}>{item.title}</Text>
                <Text style={styles.preferenceDescription}>{item.description}</Text>
              </View>
              <Switch
                value={categories[key]}
                onValueChange={(value) =>
                  setCategories((current) => ({
                    ...current,
                    [key]: value,
                  }))
                }
                trackColor={{ false: '#D8D5E5', true: '#C8B7F2' }}
                thumbColor={categories[key] ? colors.primary : '#FFFFFF'}
              />
            </View>
          );
        })}
      </SectionCard>

      <SectionLabel label="DELIVERY CHANNELS" />
      <SectionCard>
        {([
          { key: 'push', label: 'Push notifications' },
          { key: 'email', label: 'Email notifications' },
          { key: 'inApp', label: 'In-app notifications' },
        ] as { key: ChannelKey; label: string }[]).map((channel, index, array) => {
          const isLast = index === array.length - 1;
          return (
            <View key={channel.key} style={[styles.preferenceRow, isLast && styles.preferenceRowLast]}>
              <Text style={styles.preferenceTitle}>{channel.label}</Text>
              <Switch
                value={channels[channel.key]}
                onValueChange={(value) =>
                  setChannels((current) => ({
                    ...current,
                    [channel.key]: value,
                  }))
                }
                trackColor={{ false: '#D8D5E5', true: '#C8B7F2' }}
                thumbColor={channels[channel.key] ? colors.primary : '#FFFFFF'}
              />
            </View>
          );
        })}
      </SectionCard>

      <TouchableOpacity style={[profileUiStyles.primaryButton, styles.saveButton]}>
        <Text style={profileUiStyles.primaryButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  preferenceRow: {
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE9F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  preferenceRowLast: {
    borderBottomWidth: 0,
  },
  preferenceTextWrap: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  preferenceDescription: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  saveButton: {
    marginTop: 16,
  },
});
