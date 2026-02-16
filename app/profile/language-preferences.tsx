import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { ProfileHeader, ProfileScaffold, SectionCard, SectionLabel, profileUiStyles } from './_ui';

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French'] as const;
const LOCALE_OPTIONS = ['en-US', 'en-GB', 'fr-FR', 'es-US'] as const;

export default function LanguagePreferencesScreen() {
  const [language, setLanguage] = useState<(typeof LANGUAGE_OPTIONS)[number]>('English');
  const [locale, setLocale] = useState<(typeof LOCALE_OPTIONS)[number]>('en-US');

  return (
    <ProfileScaffold>
      <ProfileHeader title="Language" withBack />

      <SectionLabel label="APP LANGUAGE" />
      <SectionCard>
        {LANGUAGE_OPTIONS.map((option, index) => {
          const selected = language === option;
          const isLast = index === LANGUAGE_OPTIONS.length - 1;

          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionRow, isLast && styles.optionRowLast]}
              onPress={() => setLanguage(option)}
            >
              <Text style={styles.optionLabel}>{option}</Text>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={18}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      <SectionLabel label="LOCALE FORMATTING" />
      <SectionCard>
        {LOCALE_OPTIONS.map((option, index) => {
          const selected = locale === option;
          const isLast = index === LOCALE_OPTIONS.length - 1;

          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionRow, isLast && styles.optionRowLast]}
              onPress={() => setLocale(option)}
            >
              <View>
                <Text style={styles.optionLabel}>{option}</Text>
                <Text style={styles.optionMeta}>Date & currency formatting</Text>
              </View>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={18}
                color={selected ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      <TouchableOpacity style={[profileUiStyles.primaryButton, styles.applyButton]}>
        <Text style={profileUiStyles.primaryButtonText}>Apply Language Settings</Text>
      </TouchableOpacity>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  optionRow: {
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE9F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  optionMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  applyButton: {
    marginTop: 16,
  },
});
