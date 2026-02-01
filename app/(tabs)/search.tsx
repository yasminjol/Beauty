
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function SearchScreen() {
  console.log('User viewing Search screen');

  const popularTitle = 'Popular Searches';
  const categoriesTitle = 'Browse by Category';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search" 
            size={20} 
            color={colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Popular Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{popularTitle}</Text>
          <View style={styles.tagsContainer}>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Hair Styling</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Manicure</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Facial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Massage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Makeup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{categoriesTitle}</Text>
          
          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <IconSymbol 
                ios_icon_name="scissors" 
                android_material_icon_name="content-cut" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>Hair Services</Text>
              <Text style={styles.categoryCount}>120 providers</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <IconSymbol 
                ios_icon_name="sparkles" 
                android_material_icon_name="auto-awesome" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>Nail Services</Text>
              <Text style={styles.categoryCount}>85 providers</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <IconSymbol 
                ios_icon_name="face.smiling" 
                android_material_icon_name="face" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>Makeup & Beauty</Text>
              <Text style={styles.categoryCount}>95 providers</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.categoryIconContainer}>
              <IconSymbol 
                ios_icon_name="leaf" 
                android_material_icon_name="spa" 
                size={24} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>Spa & Wellness</Text>
              <Text style={styles.categoryCount}>60 providers</Text>
            </View>
            <IconSymbol 
              ios_icon_name="chevron.right" 
              android_material_icon_name="chevron-right" 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: colors.text,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
});
