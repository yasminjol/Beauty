
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function ProviderSubscriptionScreen() {
  console.log('Provider viewing Subscription screen');

  const titleText = 'Subscription';
  const currentPlanText = 'Pro Plan';
  const viewPlansText = 'View Plans';
  const featuresTitle = 'Current Plan Features';

  const features = [
    'Unlimited service listings',
    'Priority booking placement',
    'Advanced analytics dashboard',
    'Custom branding options',
    'Direct client messaging',
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{titleText}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol 
              ios_icon_name="creditcard" 
              android_material_icon_name="payment" 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planBadge}>
            <IconSymbol 
              ios_icon_name="star.fill" 
              android_material_icon_name="star" 
              size={20} 
              color={colors.card} 
            />
            <Text style={styles.planBadgeText}>Active</Text>
          </View>
          <Text style={styles.planName}>{currentPlanText}</Text>
          <Text style={styles.planDescription}>
            Your subscription gives you access to premium features and priority support
          </Text>
          <View style={styles.planPricing}>
            <Text style={styles.planPrice}>$29</Text>
            <Text style={styles.planPeriod}>/month</Text>
          </View>
          <TouchableOpacity style={styles.viewPlansButton}>
            <Text style={styles.viewPlansButtonText}>{viewPlansText}</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{featuresTitle}</Text>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check-circle" 
                    size={24} 
                    color={colors.success} 
                  />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Information</Text>
          <View style={styles.billingCard}>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Next billing date</Text>
              <Text style={styles.billingValue}>Jan 15, 2025</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Payment method</Text>
              <Text style={styles.billingValue}>•••• 4242</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.infoText}>
            Manage your subscription, view billing history, and upgrade your plan here
          </Text>
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
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
  planCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    marginLeft: 6,
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.card,
  },
  planPeriod: {
    fontSize: 16,
    color: colors.card,
    opacity: 0.8,
    marginLeft: 4,
  },
  viewPlansButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewPlansButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  featureIconContainer: {
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  billingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billingLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  billingValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
