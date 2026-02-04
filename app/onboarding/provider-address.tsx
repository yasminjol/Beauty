
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

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceType, setServiceType] = useState<'location' | 'travel' | 'both' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!street.trim() || !city.trim() || !postalCode.trim() || !serviceType) {
      return;
    }

    const address = `${street}, ${city} ${postalCode}`;
    console.log('Provider entered address:', { street, city, postalCode, serviceType });
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/onboarding/provider-categories',
        params: { name: providerName, businessName, address, serviceType },
      });
    }, 300);
  };

  const isValid = street.trim().length > 0 && city.trim().length > 0 && postalCode.trim().length > 0 && serviceType !== '';

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

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1.5 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>ZIP / Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                placeholderTextColor={colors.textSecondary}
                value={postalCode}
                onChangeText={setPostalCode}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.serviceTypeContainer}>
            <Text style={styles.inputLabel}>How do you provide services?</Text>
            <View style={styles.serviceTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  serviceType === 'location' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType('location')}
              >
                <View style={[
                  styles.radioButton,
                  serviceType === 'location' && styles.radioButtonActive,
                ]} />
                <Text style={[
                  styles.serviceTypeText,
                  serviceType === 'location' && styles.serviceTypeTextActive,
                ]}>At my location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.serviceTypeButton,
                  serviceType === 'travel' && styles.serviceTypeButtonActive,
                ]}
                onPress={() => setServiceType('travel')}
              >
                <View style={[
                  styles.radioButton,
                  serviceType === 'travel' && styles.radioButtonActive,
                ]} />
                <Text style={[
                  styles.serviceTypeText,
                  serviceType === 'travel' && styles.serviceTypeTextActive,
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
