import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  PageHeader,
  PageScaffold,
  SectionCard,
  SectionLabel,
  SectionRow,
  meUiStyles,
} from './_ui';
import { View, Text } from 'react-native';

const FREE_PLAN_LIMIT = 2;
const ACTIVE_CATEGORIES = 1;
const PLAN_NAME = 'Free plan';

export default function MeHomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const push = (path: string) => router.push(path as never);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace('/auth/role-selection');
    } catch (error) {
      console.error('[MeHome] Logout error', error);
      Alert.alert('Unable to log out', 'Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <PageScaffold>
      <PageHeader title="Me" />

      <View style={meUiStyles.summaryCard}>
        <Text style={meUiStyles.summaryText}>
          Active categories ({ACTIVE_CATEGORIES}/{FREE_PLAN_LIMIT})
        </Text>
        <View style={meUiStyles.planPill}>
          <Text style={meUiStyles.planPillText}>{PLAN_NAME}</Text>
        </View>
      </View>

      <SectionLabel label="ACCOUNT" />
      <SectionCard>
        <SectionRow
          title="Profile"
          description="Edit name, business, photo, location"
          onPress={() => push('/(provider-tabs)/me-home/profile-screen')}
        />
        <SectionRow
          title="Plan & Billing"
          description="Upgrade, view plan limits"
          onPress={() => push('/(provider-tabs)/me-home/plan-billing-screen')}
        />
        <SectionRow
          title="Settings"
          description="Notifications, privacy, language, security"
          onPress={() => push('/(provider-tabs)/me-home/settings-home-screen')}
        />
        <SectionRow
          title="Support"
          description="Help center, contact us"
          onPress={() => push('/(provider-tabs)/me-home/support-screen')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="PREFERENCES" />
      <SectionCard>
        <SectionRow
          title="Notifications"
          description="Booking alerts and reminders"
          onPress={() => push('/(provider-tabs)/me-home/notification-settings-screen')}
        />
        <SectionRow
          title="Location & region"
          description="Service area and region"
          onPress={() => push('/(provider-tabs)/me-home/location-region-screen')}
        />
        <SectionRow
          title="Language"
          description="App language and locale"
          onPress={() => push('/(provider-tabs)/me-home/language-screen')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="LEGAL" />
      <SectionCard>
        <SectionRow
          title="Terms of Service"
          description="Review service terms"
          onPress={() => push('/(provider-tabs)/me-home/terms-screen')}
        />
        <SectionRow
          title="Privacy Policy"
          description="How your data is used"
          onPress={() => push('/(provider-tabs)/me-home/privacy-screen')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="ACCOUNT ACTIONS" />
      <SectionCard>
        <SectionRow
          title={isLoggingOut ? 'Logging out...' : 'Log out'}
          description="Clear session and return to role selection"
          onPress={handleLogout}
          destructive
          isLast
        />
      </SectionCard>
    </PageScaffold>
  );
}
