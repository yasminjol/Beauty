import React from 'react';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function NotificationSettingsScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Notifications" withBack subtitle="Control what alerts you receive" />

      <SectionLabel label="PREFERENCES" />
      <SectionCard>
        <SectionRow title="Booking requests" description="Instant alerts for new requests" showChevron={false} />
        <SectionRow title="Appointment updates" description="Reschedules, approvals and declines" showChevron={false} />
        <SectionRow title="Reviews" description="When clients leave a new review" showChevron={false} />
        <SectionRow title="Promotions" description="Product updates and promotions" showChevron={false} isLast />
      </SectionCard>
    </PageScaffold>
  );
}
