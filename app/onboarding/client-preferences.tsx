
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import Slider from '@react-native-community/slider';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedPost, apiGet } from '@/utils/api';

const DEFAULT_CATEGORIES = [
  { id: 'braids', name: 'Braids', icon: 'content-cut' },
  { id: 'locs', name: 'Locs', icon: 'content-cut' },
  { id: 'barber', name: 'Barber', icon: 'content-cut' },
  { id: 'wigs', name: 'Wigs', icon: 'brush' },
  { id: 'nails', name: 'Nails', icon: 'brush' },
  { id: 'lashes', name: 'Lashes', icon: 'visibility' },
];

export default function ClientPreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { completeOnboarding, refreshUser } = useAuth();
  
  const clientName = params.name as string;
  const phoneNumber = params.phoneNumber as string;
  const locationEnabled = params.locationEnabled === 'true';

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState([0, 25]);
  const [priceRange, setPriceRange] = useState([0, 150]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Fetch categories from backend on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiGet<{ categories: string[] }>('/api/categories');
      if (response && response.categories && response.categories.length > 0) {
        // Map backend categories to include icons
        const mappedCategories = response.categories.map((catId: string) => {
          const defaultCat = DEFAULT_CATEGORIES.find(dc => dc.id === catId);
          return {
            id: catId,
            name: defaultCat?.name || catId,
            icon: defaultCat?.icon || 'category',
          };
        });
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error('[ClientPreferences] Error fetching categories:', error);
      // Use default categories if fetch fails
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleComplete = async () => {
    console.log('[ClientOnboarding] Completing with preferences:', {
      name: clientName,
      phoneNumber,
      locationEnabled,
      categories: selectedCategories,
      distance: distanceRange,
      price: priceRange,
    });

    setIsLoading(true);

    try {
      // Submit client onboarding data to backend
      const payload: any = {
        name: clientName,
        phoneNumber,
        locationEnabled,
      };

      // Only include preferences if categories are selected
      if (selectedCategories.length > 0) {
        payload.preferredCategories = selectedCategories;
        payload.preferredDistanceMin = distanceRange[0];
        payload.preferredDistanceMax = distanceRange[1];
        payload.preferredPriceMin = priceRange[0];
        payload.preferredPriceMax = priceRange[1];
      }

      await authenticatedPost('/api/onboarding/client', payload);

      console.log('[ClientOnboarding] ✅ Onboarding complete! Redirecting to dashboard...');
      
      // Refresh user to update onboarding status
      await refreshUser();
      await completeOnboarding();
      
      setIsLoading(false);
      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      setIsLoading(false);
      console.error('[ClientOnboarding] Error:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to complete onboarding. Please try again.',
      });
    }
  };

  const handleSkip = async () => {
    console.log('[ClientOnboarding] Skipping preferences');
    setIsLoading(true);

    try {
      // Submit client onboarding data without preferences
      await authenticatedPost('/api/onboarding/client', {
        name: clientName,
        phoneNumber,
        locationEnabled,
      });

      console.log('[ClientOnboarding] Onboarding complete (skipped preferences)');
      
      // Refresh user to update onboarding status
      await refreshUser();
      await completeOnboarding();
      
      setIsLoading(false);
      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      setIsLoading(false);
      console.error('[ClientOnboarding] Error:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to complete onboarding. Please try again.',
      });
    }
  };

  const isValid = true; // Always valid since preferences are optional
  const distanceText = `${distanceRange[0]} - ${distanceRange[1]} miles`;
  const priceText = `$${priceRange[0]} - $${priceRange[1]}`;

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={48}
              color={colors.error}
            />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, message: '' })}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        </View>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step 2 of 2 (Optional)</Text>
          <Text style={styles.title}>Set Your Preferences</Text>
          <Text style={styles.subtitle}>
            Help us personalize your service discovery, or skip to explore
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Services</Text>
          <Text style={styles.sectionSubtitle}>Select the services you&apos;re interested in</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <IconSymbol
                    ios_icon_name="scissors"
                    android_material_icon_name={category.icon}
                    size={28}
                    color={isSelected ? colors.card : colors.primary}
                  />
                  <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Distance</Text>
          <Text style={styles.sectionSubtitle}>How far are you willing to travel?</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{distanceText}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={50}
              step={5}
              value={distanceRange[1]}
              onValueChange={value => setDistanceRange([0, value])}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Price Range</Text>
          <Text style={styles.sectionSubtitle}>What&apos;s your budget per service?</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>{priceText}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={300}
              step={10}
              value={priceRange[1]}
              onValueChange={value => setPriceRange([0, value])}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <Text style={styles.completeButtonText}>
                {selectedCategories.length > 0 ? 'Complete Setup' : 'Complete Without Preferences'}
              </Text>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.card}
              />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
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
  header: {
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.card,
  },
  sliderContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
  },
});
