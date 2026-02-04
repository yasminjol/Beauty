
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { apiGet } from '@/utils/api';

const DEFAULT_CATEGORIES = [
  { id: 'braids', name: 'Braids', icon: 'content-cut' },
  { id: 'locs', name: 'Locs', icon: 'content-cut' },
  { id: 'barber', name: 'Barber', icon: 'content-cut' },
  { id: 'wigs', name: 'Wigs', icon: 'brush' },
  { id: 'nails', name: 'Nails', icon: 'brush' },
  { id: 'lashes', name: 'Lashes', icon: 'visibility' },
];

const MAX_FREE_CATEGORIES = 2;

export default function ProviderCategoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const providerName = params.name as string;
  const businessName = params.businessName as string;
  const address = params.address as string;

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      console.error('[ProviderCategories] Error fetching categories:', error);
      // Use default categories if fetch fails
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      if (selectedCategories.length < MAX_FREE_CATEGORIES) {
        setSelectedCategories([...selectedCategories, categoryId]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      return;
    }

    console.log('Provider selected categories:', selectedCategories);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push({
        pathname: '/onboarding/provider-verification',
        params: { 
          name: providerName, 
          businessName, 
          address,
          categories: JSON.stringify(selectedCategories),
        },
      });
    }, 300);
  };

  const isValid = selectedCategories.length > 0;
  const remainingSlots = MAX_FREE_CATEGORIES - selectedCategories.length;

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
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={styles.progressSegment} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Select Your Categories</Text>
          <Text style={styles.subtitle}>Choose up to {MAX_FREE_CATEGORIES} categories for your Free plan. Upgrade to Pro or Premium to unlock unlimited service categories and more features!


          </Text>
        </View>

        <View style={styles.planBadge}>
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.planBadgeText}>
            Free Plan: {selectedCategories.length}/{MAX_FREE_CATEGORIES} categories selected
          </Text>
        </View>


        <View style={styles.categoriesGrid}>
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            const isDisabled = !isSelected && selectedCategories.length >= MAX_FREE_CATEGORIES;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                  isDisabled && styles.categoryCardDisabled,
                ]}
                onPress={() => toggleCategory(category.id)}
                disabled={isDisabled}
              >
                <IconSymbol
                  ios_icon_name="scissors"
                  android_material_icon_name={category.icon}
                  size={32}
                  color={isSelected ? colors.card : isDisabled ? colors.textSecondary : colors.primary}
                />
                <Text style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                  isDisabled && styles.categoryTextDisabled,
                ]}>
                  {category.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={24}
                      color={colors.card}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
    marginBottom: 20,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 40, 
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  planBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    marginBottom: -8,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  categoryCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryCardDisabled: {
    opacity: 0.4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.card,
  },
  categoryTextDisabled: {
    color: colors.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  upgradeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  upgradeText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
    marginTop: 4,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
