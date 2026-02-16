import React from 'react';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function ProfileScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Profile" withBack subtitle="Edit account and business details" />

      <SectionLabel label="PROFILE DETAILS" />
      <SectionCard>
        <SectionRow title="Display name" description="Update your public profile name" />
        <SectionRow title="Business name" description="Shown to clients in bookings" />
        <SectionRow title="Profile photo" description="Upload and crop your profile image" />
        <SectionRow title="Location" description="City, region and service area" isLast />
      </SectionCard>
    </PageScaffold>
  );
}
