import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { ProfileHeader, ProfileScaffold, SectionCard, SectionLabel } from './_ui';

type DocType = 'terms' | 'privacy';

const DOC_COPY: Record<DocType, { title: string; body: string }> = {
  terms: {
    title: 'Terms of Service',
    body:
      'Review the usage agreement, booking responsibilities, cancellation policy, and marketplace rules that apply when using EWAJI.',
  },
  privacy: {
    title: 'Privacy Policy',
    body:
      'Review how EWAJI collects, uses, and protects account, booking, and payment information in this mock build stage.',
  },
};

export default function TermsPrivacyScreen() {
  const [activeDoc, setActiveDoc] = useState<DocType>('terms');

  return (
    <ProfileScaffold>
      <ProfileHeader title="Terms & Privacy" withBack />

      <SectionLabel label="LEGAL DOCUMENTS" />
      <SectionCard>
        <TouchableOpacity style={styles.docRow} onPress={() => setActiveDoc('terms')}>
          <View>
            <Text style={styles.docTitle}>Terms of Service</Text>
            <Text style={styles.docDescription}>Marketplace usage terms and booking conditions</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.docRow, styles.docRowLast]} onPress={() => setActiveDoc('privacy')}>
          <View>
            <Text style={styles.docTitle}>Privacy Policy</Text>
            <Text style={styles.docDescription}>How your data is collected and protected</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </SectionCard>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{DOC_COPY[activeDoc].title}</Text>
        <Text style={styles.previewBody}>{DOC_COPY[activeDoc].body}</Text>
        <Text style={styles.previewMeta}>Last updated: Feb 2026</Text>
      </View>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  docRow: {
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE9F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  docRowLast: {
    borderBottomWidth: 0,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  docDescription: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  previewCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2F6',
    backgroundColor: colors.card,
    padding: 14,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  previewBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  previewMeta: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
