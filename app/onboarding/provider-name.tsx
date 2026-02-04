
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderNameScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!name.trim() || !businessName.trim() || !country.trim() || !state.trim() || !phoneNumber.trim()) {
      return;
    }

    console.log('Provider entered:', { name, businessName, country, state, phoneNumber });
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/onboarding/provider-address',
        params: { 
          name, 
          businessName, 
          country, 
          stateProvince: state, 
          phoneNumber 
        },
      });
    }, 300);
  };

  const isValid = name.trim().length > 0 && businessName.trim().length > 0 && country.trim().length > 0 && state.trim().length > 0 && phoneNumber.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={async () => {
            await signOut();
            router.replace('/auth/role-selection');
          }}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Tell clients about your business</Text>
          <Text style={styles.subtitle}>Add the basics to get started.</Text>

        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Business Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your business name"
              placeholderTextColor={colors.textSecondary}
              value={businessName}
              onChangeText={setBusinessName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor={colors.textSecondary}
                value={country}
                onChangeText={setCountry}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State/Province</Text>
              <TextInput
                style={styles.input}
                placeholder="State/Province"
                placeholderTextColor={colors.textSecondary}
                value={state}
                onChangeText={setState}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={colors.card}
                />
              </>
            )}
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
    paddingVertical: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40, 
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
  },
  titleWrap: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,        // tweak: 320–380 depending on taste
    marginBottom: 28,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

});
