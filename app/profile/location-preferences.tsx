import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { ProfileHeader, ProfileScaffold, SectionCard, SectionLabel, profileUiStyles } from './_ui';
import { useClientProfile } from '@/contexts/ClientProfileContext';

const REGION_OPTIONS = ['Current city', 'Home area', 'Custom region'] as const;
const RADIUS_OPTIONS = ['5 mi', '10 mi', '20 mi', 'Any distance'] as const;

export default function LocationPreferencesScreen() {
  const { profile, updateProfile } = useClientProfile();
  const [regionSource, setRegionSource] = useState<(typeof REGION_OPTIONS)[number]>('Current city');
  const [radius, setRadius] = useState<(typeof RADIUS_OPTIONS)[number]>('10 mi');
  const [location, setLocation] = useState(profile.location);

  const saveLocationPreferences = () => {
    updateProfile({
      displayName: profile.displayName,
      location,
    });
  };

  return (
    <ProfileScaffold>
      <ProfileHeader title="Location" withBack />

      <SectionLabel label="DEFAULT LOCATION" />
      <SectionCard>
        <View style={styles.innerWrap}>
          <Text style={profileUiStyles.fieldLabel}>Location source</Text>
          <View style={styles.optionRow}>
            {REGION_OPTIONS.map((option) => {
              const active = regionSource === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => setRegionSource(option)}
                >
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[profileUiStyles.fieldLabel, styles.labelGap]}>Preferred location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
      </SectionCard>

      <SectionLabel label="DISCOVERY RANGE" />
      <SectionCard>
        <View style={styles.innerWrap}>
          <View style={styles.optionRow}>
            {RADIUS_OPTIONS.map((option) => {
              const active = radius === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionChip, active && styles.optionChipActive]}
                  onPress={() => setRadius(option)}
                >
                  <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.helperText}>
            These preferences are used to personalize provider discovery and booking suggestions.
          </Text>
        </View>
      </SectionCard>

      <TouchableOpacity style={[profileUiStyles.primaryButton, styles.saveButton]} onPress={saveLocationPreferences}>
        <Text style={profileUiStyles.primaryButtonText}>Save Location Preferences</Text>
      </TouchableOpacity>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  innerWrap: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: 999,
    backgroundColor: '#F3F0FA',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  optionChipActive: {
    backgroundColor: '#ECE4FF',
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  optionChipTextActive: {
    color: colors.primary,
  },
  labelGap: {
    marginTop: 12,
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCCFF7',
    backgroundColor: '#FCFBFF',
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  helperText: {
    marginTop: 10,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  saveButton: {
    marginTop: 16,
  },
});
