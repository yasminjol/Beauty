import React from 'react';
import { useRouter } from 'expo-router';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function SettingsHomeScreen() {
  const router = useRouter();
  const push = (path: string) => router.push(path as never);

  return (
    <PageScaffold>
      <PageHeader title="Settings" withBack subtitle="Notifications, privacy, language and security" />

      <SectionLabel label="GENERAL" />
      <SectionCard>
        <SectionRow
          title="Notifications"
          description="Push alerts and booking reminders"
          onPress={() => push('/(provider-tabs)/me-home/notification-settings-screen')}
        />
        <SectionRow
          title="Language"
          description="Set app language and region format"
          onPress={() => push('/(provider-tabs)/me-home/language-screen')}
        />
        <SectionRow
          title="Location & region"
          description="Timezone and service region"
          onPress={() => push('/(provider-tabs)/me-home/location-region-screen')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="SECURITY" />
      <SectionCard>
        <SectionRow title="Privacy controls" description="Manage visibility and privacy" />
        <SectionRow title="Password" description="Change sign-in credentials" isLast />
      </SectionCard>
    </PageScaffold>
  );
}
