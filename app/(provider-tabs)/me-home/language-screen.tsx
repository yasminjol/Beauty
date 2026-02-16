import React from 'react';
import { PageHeader, PageScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function LanguageScreen() {
  return (
    <PageScaffold>
      <PageHeader title="Language" withBack subtitle="Choose app language and format" />

      <SectionLabel label="LANGUAGE" />
      <SectionCard>
        <SectionRow title="English" description="Current language" showChevron={false} />
        <SectionRow title="Spanish" description="Available" showChevron={false} />
        <SectionRow title="French" description="Available" showChevron={false} isLast />
      </SectionCard>
    </PageScaffold>
  );
}
