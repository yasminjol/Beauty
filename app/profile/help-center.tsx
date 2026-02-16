import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { ProfileHeader, ProfileScaffold, SectionCard, SectionLabel, SectionRow } from './_ui';

export default function HelpCenterScreen() {
  const openFaq = (topic: string) => {
    Alert.alert(topic, 'FAQ content is mocked for this build phase.');
  };

  const contactSupport = (channel: 'chat' | 'email') => {
    const label = channel === 'chat' ? 'Support chat opened (mock).' : 'Support email draft opened (mock).';
    Alert.alert('Support', label);
  };

  return (
    <ProfileScaffold>
      <ProfileHeader title="Help Center" withBack />

      <SectionLabel label="FREQUENTLY ASKED QUESTIONS" />
      <SectionCard>
        <SectionRow
          title="How do I reschedule a booking?"
          description="Steps to request and confirm a new time"
          icon="help-outline"
          onPress={() => openFaq('How do I reschedule a booking?')}
        />
        <SectionRow
          title="How do deposits and balances work?"
          description="Understand what is paid now vs later"
          icon="help-outline"
          onPress={() => openFaq('How do deposits and balances work?')}
        />
        <SectionRow
          title="How do I update payment methods?"
          description="Manage your default card and billing"
          icon="help-outline"
          onPress={() => openFaq('How do I update payment methods?')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="CONTACT SUPPORT" />
      <View style={styles.contactCard}>
        <TouchableOpacity style={styles.contactButton} onPress={() => contactSupport('chat')}>
          <IconSymbol
            ios_icon_name="message.fill"
            android_material_icon_name="chat"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.contactButtonText}>Start Support Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton} onPress={() => contactSupport('email')}>
          <IconSymbol
            ios_icon_name="envelope.fill"
            android_material_icon_name="email"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.contactButtonText}>Email Support</Text>
        </TouchableOpacity>
      </View>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2F6',
    backgroundColor: colors.card,
    padding: 12,
    gap: 10,
  },
  contactButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8CBF7',
    backgroundColor: '#F7F3FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
