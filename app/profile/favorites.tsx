import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { EmptyStateCard, ProfileHeader, ProfileScaffold } from './_ui';

type FavoriteType = 'service' | 'provider';

type FavoriteItem = {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle: string;
  details: string;
  serviceId?: string;
  providerId?: string;
};

const FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-service-1',
    type: 'service',
    title: 'Boho Knotless Braids',
    subtitle: 'Glow House Studio',
    details: '$210 • 4h',
    serviceId: 'service-boho-knotless',
  },
  {
    id: 'fav-provider-1',
    type: 'provider',
    title: 'Nailed by Tori',
    subtitle: 'Brooklyn, NY',
    details: 'Nail Services • 4.8★',
    providerId: 'provider-nailed-by-tori',
  },
  {
    id: 'fav-service-2',
    type: 'service',
    title: 'Hybrid Lash Fill',
    subtitle: 'Blink Atelier',
    details: '$78 • 75 min',
    serviceId: 'service-hybrid-lashes',
  },
];

export default function FavoritesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | FavoriteType>('all');

  const items = useMemo(() => {
    if (filter === 'all') return FAVORITES;
    return FAVORITES.filter((item) => item.type === filter);
  }, [filter]);

  const openFavorite = (item: FavoriteItem) => {
    if (item.type === 'provider' && item.providerId) {
      router.push({ pathname: '/search-provider-profile', params: { providerId: item.providerId } } as never);
      return;
    }

    if (item.type === 'service' && item.serviceId) {
      router.push({ pathname: '/search-service-details', params: { serviceId: item.serviceId } } as never);
    }
  };

  return (
    <ProfileScaffold>
      <ProfileHeader title="Favorites" withBack />

      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'service', label: 'Services' },
          { key: 'provider', label: 'Providers' },
        ].map((option) => {
          const isActive = filter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(option.key as 'all' | FavoriteType)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {items.length === 0 ? (
        <EmptyStateCard
          title="No favorites in this filter"
          description="Save providers and services to get back to booking faster."
          icon="favorite-border"
        />
      ) : (
        items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.favoriteCard}
            activeOpacity={0.9}
            onPress={() => openFavorite(item)}
          >
            <View style={styles.favoriteIconWrap}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name={item.type === 'service' ? 'content-cut' : 'store'}
                size={18}
                color={colors.primary}
              />
            </View>

            <View style={styles.favoriteTextWrap}>
              <Text style={styles.favoriteTitle}>{item.title}</Text>
              <Text style={styles.favoriteSubtitle}>{item.subtitle}</Text>
              <Text style={styles.favoriteDetails}>{item.details}</Text>
            </View>

            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ))
      )}
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0EDF8',
  },
  filterChipActive: {
    backgroundColor: '#EDE5FF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  favoriteCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  favoriteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteTextWrap: {
    flex: 1,
  },
  favoriteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  favoriteSubtitle: {
    marginTop: 1,
    fontSize: 13,
    color: colors.text,
  },
  favoriteDetails: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
});
