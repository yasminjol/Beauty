
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function ProviderAddressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const providerName = params.name as string;
  const businessName = params.businessName as string;
  const country = params.country as string;
  const stateProvince = params.stateProvince as string;
  const phoneNumber = params.phoneNumber as string;

  const [street, setStreet] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [serviceType, setServiceType] = useState<'at_my_location' | 'travel_to_clients' | 'both' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!street.trim() || !zipCode.trim() || !serviceType) {
      return;
    }

    console.log('Provider entered address:', { street, zipCode, serviceType });
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/onboarding/provider-categories',
        params: { 
          name: providerName, 
          businessName, 
          country,
          stateProvince,
          phoneNumber,
          streetAddress: street,
          zipCode,
          serviceProvisionMethod: serviceType,
        },
      });
    }, 300);
  };

  const isValid = street.trim().length > 0 && zipCode.trim().length > 0 && serviceType !== '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Where do you provide services?</Text>
          <Text style={styles.subtitle}> This helps clients find and navigate to your location.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address and number"
              placeholderTextColor={colors.textSecondary}
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ZIP / Postal Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ZIP or postal code"
              placeholderTextColor={colors.textSecondary}
              value={zipCode}
              onChangeText={setZipCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.serviceTypeContainer}>
            <Text style={styles.inputLabel}>How do you provide services?</Text>
            <View style={styles.serviceTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  serviceType === 'at_my_location' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType('at_my_location')}
              >
                <View style={[
                  styles.radioButton,
                  serviceType === 'at_my_location' && styles.radioButtonActive,
                ]} />
                <Text style={[
                  styles.serviceTypeText,
                  serviceType === 'at_my_location' && styles.serviceTypeTextActive,
                ]}>At my location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  serviceType === 'travel_to_clients' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType('travel_to_clients')}
              >
                <View style={[
                  styles.radioButton,
                  serviceType === 'travel_to_clients' && styles.radioButtonActive,
                ]} />
                <Text style={[
                  styles.serviceTypeText,
                  serviceType === 'travel_to_clients' && styles.serviceTypeTextActive,
                ]}>I travel to clients</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  serviceType === 'both' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType('both')}
              >
                <View style={[
                  styles.radioButton,
                  serviceType === 'both' && styles.radioButtonActive,
                ]} />
                <Text style={[
                  styles.serviceTypeText,
                  serviceType === 'both' && styles.serviceTypeTextActive,
                ]}>Both</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceTypeContainer: {
    gap: 12,
  },
  serviceTypeOptions: {
    gap: 12,
  },
  serviceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceTypeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  radioButtonActive: {
    backgroundColor: colors.primary,
  },
  serviceTypeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  serviceTypeTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
