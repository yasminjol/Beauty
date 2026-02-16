import React from 'react';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function LocationRegionScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Location & region" withBack subtitle="Set service area and local preferences" />

      <SectionLabel label="REGION" />
      <SectionCard>
        <SectionRow title="Country / Region" description="United States" showChevron={false} />
        <SectionRow title="Timezone" description="America/New_York" showChevron={false} />
        <SectionRow title="Service area" description="Update radius and coverage zones" isLast />
      </SectionCard>
    </PageScaffold>
  );
}
