
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

// Mock services data grouped by category
const mockServices = {
  Hair: [
    { id: '1', name: 'Premium Haircut', price: 45, duration: '45 min' },
    { id: '2', name: 'Hair Styling & Color', price: 120, duration: '2 hrs' },
    { id: '3', name: 'Blowout', price: 35, duration: '30 min' },
  ],
  Nails: [
    { id: '4', name: 'Luxury Manicure', price: 35, duration: '45 min' },
    { id: '5', name: 'Gel Nails', price: 55, duration: '1 hr' },
  ],
  Makeup: [
    { id: '6', name: 'Bridal Makeup', price: 150, duration: '2 hrs' },
    { id: '7', name: 'Evening Makeup', price: 75, duration: '1 hr' },
  ],
};

export default function ProviderServicesScreen() {
  console.log('Provider viewing Services screen');

  const titleText = 'My Services';
  const addServiceText = 'Add Service';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{titleText}</Text>
          <TouchableOpacity style={styles.addButton}>
            <IconSymbol 
              ios_icon_name="plus" 
              android_material_icon_name="add" 
              size={24} 
              color={colors.card} 
            />
          </TouchableOpacity>
        </View>

        {/* Services by Category */}
        {Object.entries(mockServices).map(([category, services], categoryIndex) => (
          <React.Fragment key={categoryIndex}>
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{services.length}</Text>
                </View>
              </View>

              {services.map((service, serviceIndex) => {
                const priceText = `$${service.price}`;
                return (
                  <React.Fragment key={serviceIndex}>
                    <View style={styles.serviceCard}>
                      <View style={styles.serviceIcon}>
                        <IconSymbol 
                          ios_icon_name="scissors" 
                          android_material_icon_name="content-cut" 
                          size={24} 
                          color={colors.primary} 
                        />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <View style={styles.serviceDetails}>
                          <View style={styles.serviceDetailItem}>
                            <IconSymbol 
                              ios_icon_name="dollarsign.circle" 
                              android_material_icon_name="attach-money" 
                              size={14} 
                              color={colors.textSecondary} 
                            />
                            <Text style={styles.serviceDetailText}>{priceText}</Text>
                          </View>
                          <View style={styles.serviceDetailItem}>
                            <IconSymbol 
                              ios_icon_name="clock" 
                              android_material_icon_name="access-time" 
                              size={14} 
                              color={colors.textSecondary} 
                            />
                            <Text style={styles.serviceDetailText}>{service.duration}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.editButton}>
                        <IconSymbol 
                          ios_icon_name="pencil" 
                          android_material_icon_name="edit" 
                          size={18} 
                          color={colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </React.Fragment>
        ))}

        {/* Add Service CTA */}
        <TouchableOpacity style={styles.addServiceCard}>
          <IconSymbol 
            ios_icon_name="plus.circle.fill" 
            android_material_icon_name="add-circle" 
            size={48} 
            color={colors.secondary} 
          />
          <Text style={styles.addServiceText}>{addServiceText}</Text>
          <Text style={styles.addServiceSubtext}>Expand your service offerings</Text>
        </TouchableOpacity>

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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  categoryBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  serviceCard: {
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
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceDetailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addServiceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addServiceText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  addServiceSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
});
