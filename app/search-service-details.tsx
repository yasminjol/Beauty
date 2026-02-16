import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import {
  getProviderById,
  getServiceById,
  MARKETPLACE_SERVICES,
} from '@/constants/marketplace';
import { colors } from '@/styles/commonStyles';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export default function SearchServiceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const serviceId = getParam(params.serviceId);
  const service = getServiceById(serviceId) ?? MARKETPLACE_SERVICES[0];
  const provider = getProviderById(service.providerId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.primaryCard}>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>From {formatCurrency(service.startingPrice)}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{formatDuration(service.durationMinutes)}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>★ {service.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Provider</Text>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: '/search-provider-profile',
              params: { providerId: provider?.id },
            } as never)
          }
        >
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.providerTextWrap}>
              <Text style={styles.providerName}>{provider?.businessName ?? 'Provider'}</Text>
              <Text style={styles.providerMeta}>
                {provider?.providerName} • {provider?.location}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Available Add-ons</Text>
        <View style={styles.card}>
          {service.addOns.length ? (
            service.addOns.map((addOn) => (
              <View key={addOn.id} style={styles.addOnRow}>
                <Text style={styles.addOnName}>{addOn.name}</Text>
                <Text style={styles.addOnPrice}>+ {formatCurrency(addOn.price)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyCopy}>No add-ons for this service.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Booking Cost Preview</Text>
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base price</Text>
            <Text style={styles.priceValue}>{formatCurrency(service.startingPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Deposit required</Text>
            <Text style={styles.priceDeposit}>{formatCurrency(service.depositAmount)}</Text>
          </View>
          <Text style={styles.depositHint}>
            Deposit is charged at booking. Remaining balance is paid after service completion.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: '/search-booking',
              params: { serviceId: service.id },
            } as never)
          }
        >
          <Text style={styles.primaryButtonText}>Book Now</Text>
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
    paddingBottom: 24,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E0D8F3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  primaryCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E6E0F4',
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  serviceDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFE9FF',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    padding: 14,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  providerTextWrap: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  providerMeta: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  addOnRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEAF7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addOnName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  addOnPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCopy: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  priceDeposit: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  depositHint: {
    marginTop: 6,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginTop: 18,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 24,
  },
});
