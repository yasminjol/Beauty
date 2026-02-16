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
  getServicesForProvider,
  MARKETPLACE_PROVIDERS,
} from '@/constants/marketplace';
import { colors } from '@/styles/commonStyles';
import { useReviews } from '@/contexts/ReviewsContext';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatCurrency = (value: number) => `$${value.toFixed(0)}`;

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export default function SearchProviderProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getProviderRatingStats, getProviderReviews } = useReviews();

  const providerId = getParam(params.providerId);
  const provider = getProviderById(providerId) ?? MARKETPLACE_PROVIDERS[0];
  const services = getServicesForProvider(provider.id);
  const ratingStats = getProviderRatingStats(provider.id);
  const providerReviews = getProviderReviews(provider.id).slice(0, 4);

  const initials = provider.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

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
          <Text style={styles.headerTitle}>Provider Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.providerCard}>
          <View style={styles.providerTopRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials || 'EW'}</Text>
            </View>
            <View style={styles.providerInfoWrap}>
              <Text style={styles.businessName}>{provider.businessName}</Text>
              <Text style={styles.ownerName}>{provider.providerName}</Text>
              <Text style={styles.metaText}>
                ★ {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalReviews}) • {provider.distanceMiles.toFixed(1)} mi
              </Text>
            </View>
          </View>

          <View style={styles.metaItemRow}>
            <IconSymbol
              ios_icon_name="location"
              android_material_icon_name="location-on"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaItemText}>
              {provider.location} • Service area: {provider.serviceArea}
            </Text>
          </View>

          <View style={styles.metaItemRow}>
            <IconSymbol
              ios_icon_name="clock"
              android_material_icon_name="schedule"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.metaItemText}>Availability: {provider.availabilitySummary}</Text>
          </View>

          <View style={styles.tagRow}>
            {provider.categories.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Photos & Posts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.postsRow}>
          {provider.posts.map((post) => (
            <View key={post} style={styles.postCard}>
              <View style={styles.postImagePlaceholder}>
                <IconSymbol
                  ios_icon_name="photo"
                  android_material_icon_name="image"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.postTitle} numberOfLines={2}>
                {post}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Bookable Services</Text>
        <View style={styles.servicesWrap}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/search-service-details',
                  params: { serviceId: service.id },
                } as never)
              }
            >
              <View style={styles.serviceHeaderRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceRating}>★ {service.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.serviceMeta}>
                {formatCurrency(service.startingPrice)} • {formatDuration(service.durationMinutes)}
              </Text>

              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() =>
                  router.push({
                    pathname: '/search-service-details',
                    params: { serviceId: service.id },
                  } as never)
                }
              >
                <Text style={styles.bookNowText}>View & Book</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Client Reviews</Text>
        <View style={styles.reviewsWrap}>
          {providerReviews.length ? (
            providerReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.reviewName}>{review.reviewerName}</Text>
                  <Text style={styles.reviewRating}>★ {review.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewMeta}>{review.serviceName} • {review.createdAtLabel}</Text>
                {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                {review.photos.length ? (
                  <Text style={styles.reviewPhotosMeta}>{review.photos.length} photo(s) attached</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewMeta}>No written reviews yet.</Text>
            </View>
          )}
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
    paddingBottom: 24,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 14,
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
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  providerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 16,
  },
  providerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  providerInfoWrap: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  ownerName: {
    marginTop: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaText: {
    marginTop: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  metaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItemText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFE9FF',
  },
  tagText: {
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
  postsRow: {
    paddingBottom: 4,
    gap: 10,
  },
  postCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  postImagePlaceholder: {
    height: 92,
    backgroundColor: '#F2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTitle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: colors.text,
    minHeight: 48,
  },
  servicesWrap: {
    gap: 10,
  },
  serviceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  serviceRating: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
  },
  serviceMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bookNowButton: {
    marginTop: 10,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 24,
  },
  reviewsWrap: {
    gap: 10,
  },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 12,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  reviewRating: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
  reviewMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  reviewComment: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  reviewPhotosMeta: {
    marginTop: 4,
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '600',
  },
});
