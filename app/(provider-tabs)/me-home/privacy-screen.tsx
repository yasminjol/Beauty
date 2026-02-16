import React from 'react';
import { Text, View } from 'react-native';
import { PageHeader, PageScaffold, meUiStyles } from './_ui';

export default function PrivacyScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Privacy Policy" withBack subtitle="How EWAJI handles your data" />

      <View style={meUiStyles.paragraphCard}>
        <Text style={meUiStyles.paragraphTitle}>Data Usage</Text>
        <Text style={meUiStyles.paragraphText}>
          EWAJI uses account, booking, and profile data to run appointments, communicate updates,
          and improve provider tools. Sensitive data is handled with access controls and auditing.
        </Text>
      </View>

      <View style={[meUiStyles.paragraphCard, { marginTop: 12 }]}>
        <Text style={meUiStyles.paragraphTitle}>Your Controls</Text>
        <Text style={meUiStyles.paragraphText}>
          You can manage profile visibility, notification preferences, and language settings from Me.
          Contact support for account-specific privacy requests.
        </Text>
      </View>
    </PageScaffold>
  );
}
