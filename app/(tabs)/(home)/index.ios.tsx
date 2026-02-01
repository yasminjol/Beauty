
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function HomeScreen() {
  console.log('User viewing Home Feed screen (iOS)');

  const featuredTitle = 'Featured Services';
  const nearbyTitle = 'Nearby Providers';
  const categoriesTitle = 'Categories';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.brandName}>EWAJI</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol 
              ios_icon_name="bell.fill" 
              android_material_icon_name="notifications" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search" 
            size={20} 
            color={colors.textSecondary} 
          />
          <Text style={styles.searchPlaceholder}>Search for beauty services...</Text>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{categoriesTitle}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <IconSymbol 
                  ios_icon_name="scissors" 
                  android_material_icon_name="content-cut" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.categoryText}>Hair</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <IconSymbol 
                  ios_icon_name="sparkles" 
                  android_material_icon_name="auto-awesome" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.categoryText}>Nails</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <IconSymbol 
                  ios_icon_name="face.smiling" 
                  android_material_icon_name="face" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.categoryText}>Makeup</Text>
            </View>
            <View style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <IconSymbol 
                  ios_icon_name="leaf" 
                  android_material_icon_name="spa" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.categoryText}>Spa</Text>
            </View>
          </ScrollView>
        </View>

        {/* Featured Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{featuredTitle}</Text>
          <View style={styles.serviceCard}>
            <View style={styles.serviceImage}>
              <IconSymbol 
                ios_icon_name="star.fill" 
                android_material_icon_name="star" 
                size={32} 
                color={colors.secondary} 
              />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Premium Hair Styling</Text>
              <Text style={styles.serviceProvider}>By Elite Salon</Text>
              <View style={styles.serviceFooter}>
                <Text style={styles.servicePrice}>$45</Text>
                <View style={styles.ratingContainer}>
                  <IconSymbol 
                    ios_icon_name="star.fill" 
                    android_material_icon_name="star" 
                    size={14} 
                    color={colors.warning} 
                  />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <View style={styles.serviceImage}>
              <IconSymbol 
                ios_icon_name="sparkles" 
                android_material_icon_name="auto-awesome" 
                size={32} 
                color={colors.secondary} 
              />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Luxury Manicure</Text>
              <Text style={styles.serviceProvider}>By Nail Studio</Text>
              <View style={styles.serviceFooter}>
                <Text style={styles.servicePrice}>$35</Text>
                <View style={styles.ratingContainer}>
                  <IconSymbol 
                    ios_icon_name="star.fill" 
                    android_material_icon_name="star" 
                    size={14} 
                    color={colors.warning} 
                  />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Nearby Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{nearbyTitle}</Text>
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={28} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Beauty Studio</Text>
              <Text style={styles.providerDistance}>0.5 miles away</Text>
            </View>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={28} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Glam Lounge</Text>
              <Text style={styles.providerDistance}>1.2 miles away</Text>
            </View>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 15,
    color: colors.textSecondary,
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
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  serviceCard: {
    flexDirection: 'row',
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
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  serviceProvider: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  providerCard: {
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
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  providerDistance: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  bottomSpacer: {
    height: 100,
  },
});
