import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  getProviderById,
  getServicesForProvider,
  MARKETPLACE_PROVIDERS,
  MarketplaceProvider,
  MARKETPLACE_SERVICES,
  MarketplaceService,
  searchMarketplace,
  SEARCH_CATEGORIES,
} from '@/constants/marketplace';

const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

function ServiceResultRow({
  service,
  onPress,
}: {
  service: MarketplaceService;
  onPress: () => void;
}) {
  const provider = getProviderById(service.providerId);

  return (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.resultHeaderRow}>
        <Text style={styles.resultTitle}>{service.name}</Text>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={18}
          color={colors.textSecondary}
        />
      </View>

      <Text style={styles.resultSubText}>
        {provider?.businessName ?? 'Provider'} • {service.category}
      </Text>

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
    </TouchableOpacity>
  );
}

function ProviderResultRow({
  provider,
  onPress,
}: {
  provider: MarketplaceProvider;
  onPress: () => void;
}) {
  const servicePreview = getServicesForProvider(provider.id)
    .slice(0, 3)
    .map((service) => service.name)
    .join(' • ');

  const initials = provider.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.providerCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.providerHeaderRow}>
        <View style={styles.providerAvatar}>
          <Text style={styles.providerAvatarText}>{initials || 'EW'}</Text>
        </View>
        <View style={styles.providerHeaderInfo}>
          <Text style={styles.providerName}>{provider.businessName}</Text>
          <Text style={styles.providerMeta}>
            ★ {provider.rating.toFixed(1)} ({provider.reviewCount}) • {provider.distanceMiles.toFixed(1)} mi
          </Text>
          <Text style={styles.providerMeta}>{provider.location}</Text>
        </View>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={18}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.tagRow}>
        {provider.categories.slice(0, 2).map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.servicePreviewLabel}>Services: {servicePreview}</Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchMarketplace(query), [query]);
  const trimmedQuery = query.trim();
  const showSearchResults = trimmedQuery.length > 0;

  const serviceResults = showSearchResults ? results.services : MARKETPLACE_SERVICES.slice(0, 4);
  const providerResults = showSearchResults ? results.providers : MARKETPLACE_PROVIDERS.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>Discover providers and book instantly</Text>
        </View>

        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search service or provider"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/search-category-results',
                params: { categoryId: SEARCH_CATEGORIES[0].id },
              } as never)
            }
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {SEARCH_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/search-category-results',
                  params: { categoryId: category.id },
                } as never)
              }
            >
              <View style={styles.categoryIconWrap}>
                <IconSymbol
                  ios_icon_name="square.grid.2x2"
                  android_material_icon_name={category.icon}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.categoryTitle}>{category.label}</Text>
              <Text style={styles.categorySubtitle}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {showSearchResults ? (
          <View style={styles.resultsSummaryCard}>
            <Text style={styles.resultsSummaryText}>
              {serviceResults.length} services • {providerResults.length} providers for “{trimmedQuery}”
            </Text>
          </View>
        ) : (
          <View style={styles.resultsSummaryCard}>
            <Text style={styles.resultsSummaryText}>
              Popular picks based on nearby availability
            </Text>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Services</Text>
        </View>

        {serviceResults.length ? (
          serviceResults.map((service) => (
            <ServiceResultRow
              key={service.id}
              service={service}
              onPress={() =>
                router.push({
                  pathname: '/search-service-details',
                  params: { serviceId: service.id },
                } as never)
              }
            />
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No services found</Text>
            <Text style={styles.emptyStateText}>Try a different service name or category.</Text>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Providers</Text>
        </View>

        {providerResults.length ? (
          providerResults.map((provider) => (
            <ProviderResultRow
              key={provider.id}
              provider={provider}
              onPress={() =>
                router.push({
                  pathname: '/search-provider-profile',
                  params: { providerId: provider.id },
                } as never)
              }
            />
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No providers found</Text>
            <Text style={styles.emptyStateText}>Try searching by business name, category, or location.</Text>
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
    paddingTop: Platform.OS === 'android' ? 18 : 6,
  },
  headerWrap: {
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFD7F3',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  categoryGrid: {
    marginBottom: 14,
    gap: 10,
  },
  categoryCard: {
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E7E0F5',
    padding: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  categorySubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  resultsSummaryCard: {
    marginBottom: 14,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2D8F8',
    backgroundColor: '#F4EFFF',
  },
  resultsSummaryText: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E3F5',
    marginBottom: 10,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingRight: 8,
  },
  resultSubText: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  metaRow: {
    marginTop: 10,
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
    color: colors.primary,
    fontWeight: '600',
  },
  providerCard: {
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E8E3F5',
    padding: 14,
    marginBottom: 10,
  },
  providerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  providerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  providerHeaderInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  providerMeta: {
    marginTop: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  tagRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DDD2F5',
    backgroundColor: '#FBF9FF',
  },
  tagText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '600',
  },
  servicePreviewLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyStateCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5DEF4',
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  emptyStateText: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 102,
  },
});
