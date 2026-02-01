
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
  { id: 'hair', name: 'Hair', icon: 'content-cut' },
  { id: 'nails', name: 'Nails', icon: 'brush' },
  { id: 'makeup', name: 'Makeup', icon: 'face' },
  { id: 'skincare', name: 'Skincare', icon: 'spa' },
  { id: 'massage', name: 'Massage', icon: 'self-improvement' },
  { id: 'waxing', name: 'Waxing', icon: 'healing' },
];

export default function ClientPreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { completeOnboarding, refreshUser } = useAuth();
  
  const clientName = params.name as string;

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
      const response = await apiGet<{ id: string; name: string }[]>('/api/categories');
      if (response && response.length > 0) {
        // Map backend categories to include icons
        const mappedCategories = response.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: DEFAULT_CATEGORIES.find(dc => dc.id === cat.id)?.icon || 'category',
        }));
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
      categories: selectedCategories,
      distance: distanceRange,
      price: priceRange,
    });

    setIsLoading(true);

    try {
      // Submit client onboarding data to backend
      await authenticatedPost('/api/onboarding/client', {
        name: clientName,
        preferredCategories: selectedCategories,
        preferredDistanceMin: distanceRange[0],
        preferredDistanceMax: distanceRange[1],
        preferredPriceMin: priceRange[0],
        preferredPriceMax: priceRange[1],
      });

      console.log('[ClientOnboarding] Onboarding complete');
      
      // Refresh user to update onboarding status
      await refreshUser();
      completeOnboarding();
      
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

  const isValid = selectedCategories.length > 0;
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
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step 2 of 2</Text>
          <Text style={styles.title}>Set Your Preferences</Text>
          <Text style={styles.subtitle}>
            Help us personalize your service discovery
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
          style={[styles.completeButton, !isValid && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <Text style={styles.completeButtonText}>Complete Setup</Text>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.card}
              />
            </>
          )}
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
  completeButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
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
