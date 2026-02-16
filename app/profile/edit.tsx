import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useClientProfile } from '@/contexts/ClientProfileContext';
import { ProfileHeader, ProfileScaffold, profileUiStyles } from './_ui';
import { useRouter } from 'expo-router';

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, bumpAvatarVersion } = useClientProfile();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [location, setLocation] = useState(profile.location);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => displayName.trim().length > 1 && location.trim().length > 1,
    [displayName, location],
  );

  const handleAvatarUpdate = () => {
    bumpAvatarVersion();
    Alert.alert('Photo updated', 'Profile photo upload is mocked in this phase.');
  };

  const handleSave = () => {
    if (!canSave) {
      Alert.alert('Missing details', 'Please provide your name and location.');
      return;
    }

    setSaving(true);
    updateProfile({
      displayName,
      location,
    });

    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 280);
  };

  return (
    <ProfileScaffold>
      <ProfileHeader title="Edit Profile" withBack />

      <View style={styles.sectionCard}>
        <Text style={profileUiStyles.fieldLabel}>Profile photo</Text>

        <View style={styles.avatarRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initialsFromName(displayName) || 'CL'}</Text>
          </View>

          <TouchableOpacity style={styles.avatarActionButton} onPress={handleAvatarUpdate}>
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="camera-alt"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.avatarActionText}>Update photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.sectionCard, styles.formCard]}>
        <Text style={profileUiStyles.fieldLabel}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={[profileUiStyles.fieldLabel, styles.fieldLabelSpacing]}>Email</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyText}>{profile.email}</Text>
        </View>

        <Text style={[profileUiStyles.fieldLabel, styles.fieldLabelSpacing]}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="City, State"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <TouchableOpacity
        style={[profileUiStyles.primaryButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave || saving}
      >
        <Text style={profileUiStyles.primaryButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    backgroundColor: colors.card,
    padding: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  formCard: {
    marginTop: 12,
    marginBottom: 16,
  },
  avatarRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFE8FF',
    borderWidth: 1,
    borderColor: '#DACCF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DACCF9',
    backgroundColor: '#F6F1FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
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
  readOnlyField: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E3F2',
    backgroundColor: '#F4F3F8',
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fieldLabelSpacing: {
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
});
