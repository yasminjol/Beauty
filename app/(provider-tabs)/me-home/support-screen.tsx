import React from 'react';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function SupportScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Support" withBack subtitle="Help center and contact options" />

      <SectionLabel label="HELP" />
      <SectionCard>
        <SectionRow title="Help center" description="Browse common questions and guides" />
        <SectionRow title="Contact us" description="Reach support by chat or email" />
        <SectionRow title="Report an issue" description="Share bugs or account issues" isLast />
      </SectionCard>
    </PageScaffold>
  );
}
