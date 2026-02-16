import React from 'react';
import { Text, View } from 'react-native';
import {
  PageHeader,
  PageScaffold,
  SectionCard,
  SectionLabel,
  SectionRow,
  meUiStyles,
} from './_ui';

export default function PlanBillingScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Plan & Billing" withBack subtitle="Manage plan limits and billing details" />

      <View style={meUiStyles.summaryCard}>
        <Text style={meUiStyles.summaryText}>Current plan: Free plan</Text>
        <View style={meUiStyles.planPill}>
          <Text style={meUiStyles.planPillText}>Free</Text>
        </View>
      </View>

      <SectionLabel label="LIMITS" />
      <SectionCard>
        <SectionRow title="Active categories" description="1 of 2 categories used" showChevron={false} />
        <SectionRow title="Featured placement" description="Available on Pro and above" showChevron={false} />
        <SectionRow title="Priority support" description="Available on Pro and above" showChevron={false} isLast />
      </SectionCard>

      <SectionLabel label="BILLING" />
      <SectionCard>
        <SectionRow title="Upgrade plan" description="Unlock additional tools and limits" />
        <SectionRow title="Payment methods" description="Manage cards and billing info" />
        <SectionRow title="Billing history" description="View invoices and receipts" isLast />
      </SectionCard>
    </PageScaffold>
  );
}
