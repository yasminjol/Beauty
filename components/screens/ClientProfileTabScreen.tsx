import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { useClientProfile } from '@/contexts/ClientProfileContext';
import {
  ProfileHeader,
  ProfileScaffold,
  SectionCard,
  SectionLabel,
  SectionRow,
  profileUiStyles,
} from '@/app/profile/_ui';

const initialsFromName = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { profile, bumpAvatarVersion } = useClientProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const open = (path: string) => router.push(path as never);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of your account?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          if (isLoggingOut) return;
          setIsLoggingOut(true);
          try {
            await signOut();
            router.replace('/auth/role-selection');
          } catch (error) {
            console.error('[Profile] Logout error', error);
            setIsLoggingOut(false);
            Alert.alert('Unable to log out', 'Please try again.');
          }
        },
      },
    ]);
  };

  const handleAvatarTap = () => {
    bumpAvatarVersion();
    Alert.alert('Profile photo updated', 'Photo upload is mocked for now.');
  };

  return (
    <ProfileScaffold withTabBarInset>
      <ProfileHeader title="Profile" />

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initialsFromName(profile.displayName) || 'CL'}</Text>
          </View>

          <TouchableOpacity style={styles.avatarCameraButton} onPress={handleAvatarTap}>
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="camera-alt"
              size={14}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.emailText}>{profile.email}</Text>
        <Text style={styles.locationText}>{profile.location}</Text>

        <TouchableOpacity style={[profileUiStyles.primaryButton, styles.editProfileButton]} onPress={() => open('/profile/edit')}>
          <Text style={profileUiStyles.primaryButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <SectionLabel label="ACCOUNT" />
      <SectionCard>
        <SectionRow
          title="Favorites"
          description="Saved providers and services"
          icon="favorite"
          onPress={() => open('/profile/favorites')}
        />
        <SectionRow
          title="Payment Methods"
          description="Add cards and set default method"
          icon="payment"
          onPress={() => open('/profile/payment-methods')}
        />
        <SectionRow
          title="Booking History"
          description="Past bookings and completed services"
          icon="history"
          onPress={() => open('/profile/booking-history')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="PREFERENCES" />
      <SectionCard>
        <SectionRow
          title="Notifications"
          description="Choose alerts and delivery channels"
          icon="notifications"
          onPress={() => open('/profile/notification-preferences')}
        />
        <SectionRow
          title="Location"
          description="Default discovery and booking region"
          icon="location-on"
          onPress={() => open('/profile/location-preferences')}
        />
        <SectionRow
          title="Language"
          description="Language and locale formatting"
          icon="language"
          onPress={() => open('/profile/language-preferences')}
          isLast
        />
      </SectionCard>

      <SectionLabel label="SUPPORT" />
      <SectionCard>
        <SectionRow
          title="Help Center"
          description="FAQ and contact support"
          icon="help-outline"
          onPress={() => open('/profile/help-center')}
        />
        <SectionRow
          title="Terms & Privacy"
          description="Terms of Service and Privacy Policy"
          icon="description"
          onPress={() => open('/profile/terms-privacy')}
          isLast
        />
      </SectionCard>

      <View style={styles.logoutWrap}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          <Text style={styles.logoutButtonText}>{isLoggingOut ? 'Logging out...' : 'Log Out'}</Text>
        </TouchableOpacity>
      </View>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#EFE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCCFFD',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarCameraButton: {
    position: 'absolute',
    right: -3,
    bottom: -1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  displayName: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emailText: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },
  locationText: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  editProfileButton: {
    marginTop: 16,
    width: '100%',
  },
  logoutWrap: {
    marginTop: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3CBCB',
    backgroundColor: '#FFF5F5',
    padding: 10,
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#F04B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
