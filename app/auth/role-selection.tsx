
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setSelectedRole } = useAuth();

  const handleRoleSelect = (role: 'client' | 'provider') => {
    console.log('User selected role:', role);
    setSelectedRole(role);
    router.push('/auth/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/LOGO_2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.slogan}>BOOK THE LOOK, ELEVATE THE CULTURE.</Text>
        </View>

        <Text style={styles.heading}>Choose how you'll use EWAJI</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.clientButton}
            onPress={() => handleRoleSelect('client')}
            activeOpacity={0.8}
          >
            <Text style={styles.clientButtonText}>Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.providerButton}
            onPress={() => handleRoleSelect('provider')}
            activeOpacity={0.8}
          >
            <Text style={styles.providerButtonText}>Provider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 44,
  },
  logo: {
    width: '100%',
    maxWidth: 320,     // try 300–340 depending on how bold you want it
    height: undefined,
    aspectRatio: 599 / 356, // ~1.68 (matches your cropped image)
  },
  slogan: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
    color: '#A6A5D0',       // or '#C8B7F2' if you prefer it more “brand”
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  buttonsContainer: {
    gap: 16,
  },
  clientButton: {
    backgroundColor: '#5A3E9C',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  providerButton: {
    backgroundColor: '#C8B7F2',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.95,
  },
  providerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A3E9C',
  },
});