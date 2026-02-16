import React, { useMemo, useState } from 'react';
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
  getCategoryById,
  getProviderById,
  getProvidersForCategory,
  getServicesForCategory,
  MarketplaceProvider,
  MarketplaceService,
  SEARCH_CATEGORIES,
} from '@/constants/marketplace';
import { colors } from '@/styles/commonStyles';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type SortMode = 'recommended' | 'price' | 'rating' | 'distance' | 'availability';
type PriceMode = 'any' | 'under100' | '100to160' | '160plus';
type DistanceMode = 'any' | '5' | '10';

const SORT_OPTIONS: SortMode[] = ['recommended', 'price', 'rating', 'distance', 'availability'];
const PRICE_OPTIONS: PriceMode[] = ['any', 'under100', '100to160', '160plus'];
const DISTANCE_OPTIONS: DistanceMode[] = ['any', '5', '10'];

const SORT_LABELS: Record<SortMode, string> = {
  recommended: 'Recommended',
  price: 'Price',
  rating: 'Rating',
  distance: 'Distance',
  availability: 'Availability',
};

const PRICE_LABELS: Record<PriceMode, string> = {
  any: 'Price: Any',
  under100: 'Price: <$100',
  '100to160': 'Price: $100-$160',
  '160plus': 'Price: $160+',
};

const DISTANCE_LABELS: Record<DistanceMode, string> = {
  any: 'Distance: Any',
  '5': 'Distance: <=5 mi',
  '10': 'Distance: <=10 mi',
};

const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const nextOption = <T,>(values: T[], current: T) => {
  const index = values.indexOf(current);
  const nextIndex = (index + 1) % values.length;
  return values[nextIndex];
};

function providerDistance(provider?: MarketplaceProvider) {
  return provider?.distanceMiles ?? Number.MAX_SAFE_INTEGER;
}

function serviceMatchesPrice(service: MarketplaceService, mode: PriceMode) {
  if (mode === 'any') return true;
  if (mode === 'under100') return service.startingPrice < 100;
  if (mode === '100to160') return service.startingPrice >= 100 && service.startingPrice <= 160;
  return service.startingPrice >= 160;
}

function providerMeetsDistance(provider: MarketplaceProvider | undefined, mode: DistanceMode) {
  if (!provider || mode === 'any') return true;
  if (mode === '5') return provider.distanceMiles <= 5;
  return provider.distanceMiles <= 10;
}

export default function SearchCategoryResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const categoryId = getParam(params.categoryId);
  const category = getCategoryById(categoryId) ?? SEARCH_CATEGORIES[0];

  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [priceMode, setPriceMode] = useState<PriceMode>('any');
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('any');
  const [minRating45, setMinRating45] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);

  const filteredServices = useMemo(() => {
    const categoryServices = getServicesForCategory(category.label);

    const list = categoryServices.filter((service) => {
      const provider = getProviderById(service.providerId);

      if (!serviceMatchesPrice(service, priceMode)) return false;
      if (minRating45 && service.rating < 4.5) return false;
      if (!providerMeetsDistance(provider, distanceMode)) return false;
      if (todayOnly && service.nextAvailability !== 'Today') return false;

      return true;
    });

    const sorted = [...list];

    if (sortMode === 'price') {
      sorted.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortMode === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === 'distance') {
      sorted.sort((a, b) => providerDistance(getProviderById(a.providerId)) - providerDistance(getProviderById(b.providerId)));
    } else if (sortMode === 'availability') {
      sorted.sort((a, b) => (a.nextAvailability === 'Today' ? -1 : 1) - (b.nextAvailability === 'Today' ? -1 : 1));
    } else {
      sorted.sort((a, b) => b.rating * 100 + b.reviewCount - (a.rating * 100 + a.reviewCount));
    }

    return sorted;
  }, [category.label, distanceMode, minRating45, priceMode, sortMode, todayOnly]);

  const filteredProviders = useMemo(() => {
    const categoryProviders = getProvidersForCategory(category.label);

    const list = categoryProviders.filter((provider) => {
      if (minRating45 && provider.rating < 4.5) return false;
      if (!providerMeetsDistance(provider, distanceMode)) return false;
      if (todayOnly) {
        const hasTodayService = getServicesForCategory(category.label).some(
          (service) => service.providerId === provider.id && service.nextAvailability === 'Today',
        );

        if (!hasTodayService) return false;
      }

      return true;
    });

    const sorted = [...list];

    if (sortMode === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === 'distance') {
      sorted.sort((a, b) => a.distanceMiles - b.distanceMiles);
    } else {
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return sorted;
  }, [category.label, distanceMode, minRating45, sortMode, todayOnly]);

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
          <Text style={styles.headerTitle}>{category.label}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          <TouchableOpacity style={styles.filterChip} onPress={() => setSortMode(nextOption(SORT_OPTIONS, sortMode))}>
            <Text style={styles.filterChipText}>{SORT_LABELS[sortMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={() => setPriceMode(nextOption(PRICE_OPTIONS, priceMode))}>
            <Text style={styles.filterChipText}>{PRICE_LABELS[priceMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={() => setDistanceMode(nextOption(DISTANCE_OPTIONS, distanceMode))}>
            <Text style={styles.filterChipText}>{DISTANCE_LABELS[distanceMode]}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, minRating45 && styles.filterChipActive]}
            onPress={() => setMinRating45((current) => !current)}
          >
            <Text style={[styles.filterChipText, minRating45 && styles.filterChipTextActive]}>Rating: 4.5+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, todayOnly && styles.filterChipActive]}
            onPress={() => setTodayOnly((current) => !current)}
          >
            <Text style={[styles.filterChipText, todayOnly && styles.filterChipTextActive]}>Available today</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {filteredServices.length} services • {filteredProviders.length} providers
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Bookable Services</Text>
        {filteredServices.length ? (
          filteredServices.map((service) => {
            const provider = getProviderById(service.providerId);
            return (
              <TouchableOpacity
                key={service.id}
                style={styles.resultCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/search-service-details',
                    params: { serviceId: service.id },
                  } as never)
                }
              >
                <View style={styles.resultHeaderRow}>
                  <Text style={styles.resultTitle}>{service.name}</Text>
                  <Text style={styles.resultRating}>★ {service.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.resultSub}>{provider?.businessName} • {provider?.location}</Text>
                <Text style={styles.resultMeta}>
                  {formatCurrency(service.startingPrice)} • {formatDuration(service.durationMinutes)} • {service.nextAvailability}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No services match these filters</Text>
            <Text style={styles.emptyCopy}>Try adjusting price, distance, rating or availability.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Top Providers</Text>
        {filteredProviders.length ? (
          filteredProviders.map((provider) => {
            const serviceNames = getServicesForCategory(category.label)
              .filter((service) => service.providerId === provider.id)
              .slice(0, 3)
              .map((service) => service.name)
              .join(' • ');

            return (
              <TouchableOpacity
                key={provider.id}
                style={styles.providerCard}
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: '/search-provider-profile',
                    params: { providerId: provider.id },
                  } as never)
                }
              >
                <View style={styles.providerHeaderRow}>
                  <Text style={styles.providerName}>{provider.businessName}</Text>
                  <Text style={styles.resultRating}>★ {provider.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.providerMeta}>
                  {provider.location} • {provider.distanceMiles.toFixed(1)} mi
                </Text>
                <Text style={styles.providerServicePreview}>{serviceNames}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No providers match these filters</Text>
            <Text style={styles.emptyCopy}>Try broadening your filters to see more providers.</Text>
          </View>
        )}

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
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D9CEF5',
    backgroundColor: '#FAF8FF',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1D7F8',
    backgroundColor: '#F4EFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  resultCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  resultRating: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resultSub: {
    marginTop: 3,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  resultMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  providerCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  providerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  providerMeta: {
    marginTop: 3,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  providerServicePreview: {
    marginTop: 6,
    fontSize: 12.5,
    color: colors.text,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  emptyCopy: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 24,
  },
});
