import React from 'react';
import { Text, View } from 'react-native';
import { PageHeader, PageScaffold, meUiStyles } from './_ui';

export default function TermsScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Terms of Service" withBack subtitle="Service terms and provider responsibilities" />

      <View style={meUiStyles.paragraphCard}>
        <Text style={meUiStyles.paragraphTitle}>Provider Terms</Text>
        <Text style={meUiStyles.paragraphText}>
          By using EWAJI as a provider, you agree to keep service details accurate, fulfill bookings
          in good faith, communicate clearly with clients, and follow local regulations.
        </Text>
      </View>

      <View style={[meUiStyles.paragraphCard, { marginTop: 12 }]}>
        <Text style={meUiStyles.paragraphTitle}>Payments and Cancellations</Text>
        <Text style={meUiStyles.paragraphText}>
          Plan limits, cancellations, and dispute handling follow your current subscription level and
          platform policy. Keep your availability and policies updated to avoid booking conflicts.
        </Text>
      </View>
    </PageScaffold>
  );
}
