import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useNotifications } from '@/contexts/NotificationsContext';

type CategoryItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type FeaturedService = {
  id: string;
  service: string;
  provider: string;
  location: string;
  price: string;
  rating: string;
};

type ProviderPost = {
  id: string;
  businessName: string;
  providerName: string;
  location: string;
  timestamp: string;
  mediaType: 'photo' | 'video';
  mediaLabel: string;
  caption: string;
  serviceLabel: string;
};

type TrackerStage = 'onTheWay' | 'arrived' | 'serviceStarted';

const HOME_CATEGORIES: CategoryItem[] = [
  { id: 'braids', label: 'Braids', icon: 'content-cut' },
  { id: 'nails', label: 'Nails', icon: 'brush' },
  { id: 'lashes', label: 'Lashes', icon: 'visibility' },
  { id: 'makeup', label: 'Makeup', icon: 'face' },
  { id: 'spa', label: 'Spa', icon: 'spa' },
];

const FEATURED_SERVICES: FeaturedService[] = [
  {
    id: 'feature-1',
    service: 'Boho Knotless Braids',
    provider: 'Glow House Studio',
    location: 'Downtown, Oakland',
    price: '$210',
    rating: '4.9',
  },
  {
    id: 'feature-2',
    service: 'Luxury Gel-X Set',
    provider: 'Nailed by Tori',
    location: 'Brooklyn, New York',
    price: '$95',
    rating: '4.8',
  },
  {
    id: 'feature-3',
    service: 'Hybrid Lash Fill',
    provider: 'Blink Atelier',
    location: 'Midtown, Atlanta',
    price: '$78',
    rating: '4.7',
  },
];

const INITIAL_POSTS: ProviderPost[] = [
  {
    id: 'post-1',
    businessName: 'Glow House Studio',
    providerName: 'Yasmine N.',
    location: 'Oakland, CA',
    timestamp: '14m ago',
    mediaType: 'photo',
    mediaLabel: 'Knotless transformation',
    caption:
      'Fresh knotless set with soft edges and lightweight finish. Perfect for long wear and easy styling.',
    serviceLabel: 'Boho Knotless Braids',
  },
  {
    id: 'post-2',
    businessName: 'Nailed by Tori',
    providerName: 'Tori M.',
    location: 'Brooklyn, NY',
    timestamp: '39m ago',
    mediaType: 'video',
    mediaLabel: 'Gel-X reveal',
    caption:
      'Short almond Gel-X with minimal chrome detail. Booking slots open for Friday and Saturday.',
    serviceLabel: 'Gel-X Extensions',
  },
  {
    id: 'post-3',
    businessName: 'Blink Atelier',
    providerName: 'Chloe R.',
    location: 'Atlanta, GA',
    timestamp: '1h ago',
    mediaType: 'photo',
    mediaLabel: 'Hybrid lashes set',
    caption:
      'Hybrid volume map with clean separation. Lightweight retention-focused set for everyday wear.',
    serviceLabel: 'Hybrid Lash Extensions',
  },
];

const MORE_POST_TEMPLATES: Omit<ProviderPost, 'id' | 'timestamp'>[] = [
  {
    businessName: 'Studio Lush',
    providerName: 'Ari K.',
    location: 'Houston, TX',
    mediaType: 'photo',
    mediaLabel: 'Silk press finish',
    caption: 'Silk press with trim and heat protection treatment. Soft movement and natural shine.',
    serviceLabel: 'Silk Press + Trim',
  },
  {
    businessName: 'Crown & Coils',
    providerName: 'Naya P.',
    location: 'Dallas, TX',
    mediaType: 'video',
    mediaLabel: 'Starter loc session',
    caption: 'Starter loc install with parting consultation and maintenance tips for first month.',
    serviceLabel: 'Starter Locs',
  },
  {
    businessName: 'The Brow Loft',
    providerName: 'Mia L.',
    location: 'Miami, FL',
    mediaType: 'photo',
    mediaLabel: 'Brow shape + tint',
    caption: 'Natural brow shape and tint tuned to skin tone and face symmetry.',
    serviceLabel: 'Brow Shape + Tint',
  },
];

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createGeneratedPosts(startIndex: number, count: number): ProviderPost[] {
  return Array.from({ length: count }).map((_, offset) => {
    const template = MORE_POST_TEMPLATES[(startIndex + offset) % MORE_POST_TEMPLATES.length];
    return {
      ...template,
      id: `post-more-${startIndex + offset}`,
      timestamp: `${12 + offset}m ago`,
    };
  });
}

function FeedSkeletonCard() {
  return (
    <View style={styles.feedCard}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonHeaderTextWrap}>
          <View style={[styles.skeletonLine, { width: '62%' }]} />
          <View style={[styles.skeletonLine, { width: '42%', marginTop: 6 }]} />
        </View>
      </View>
      <View style={styles.skeletonMedia} />
      <View style={[styles.skeletonLine, { width: '90%', marginTop: 10 }]} />
      <View style={[styles.skeletonLine, { width: '64%', marginTop: 6 }]} />
      <View style={[styles.skeletonActions, { marginTop: 10 }]} />
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { unreadCount: unreadNotificationCount } = useNotifications();
  const push = (path: string, params?: Record<string, string>) => {
    if (params) {
      router.push({ pathname: path as never, params } as never);
      return;
    }
    router.push(path as never);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [posts, setPosts] = useState<ProviderPost[]>(INITIAL_POSTS);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [hasUpcomingAppointment, setHasUpcomingAppointment] = useState(true);
  const [trackerStage, setTrackerStage] = useState<TrackerStage>('onTheWay');
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      await delay(700);
      if (mounted) {
        setIsInitialLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const trackerTitle = useMemo(() => {
    if (trackerStage === 'onTheWay') return 'Provider is on the way';
    if (trackerStage === 'arrived') return 'Provider has arrived';
    return 'Service in progress';
  }, [trackerStage]);

  const trackerSubtitle = useMemo(() => {
    if (trackerStage === 'onTheWay') return 'ETA 12 min • Route live';
    if (trackerStage === 'arrived') return 'Outside your location • Confirm arrival';
    return 'Timer running • Confirm when service ends';
  }, [trackerStage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await delay(800);
    setPosts(INITIAL_POSTS);
    setHasMorePosts(true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (isInitialLoading || refreshing || isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);
    await delay(850);

    setPosts((current) => {
      const next = [...current, ...createGeneratedPosts(current.length, 3)];
      if (next.length >= 15) {
        setHasMorePosts(false);
      }
      return next;
    });

    setIsLoadingMore(false);
  };

  const handleOnMyWay = () => {
    setTrackingEnabled(true);
    setTrackerStage('onTheWay');
  };

  const handleConfirmArrival = () => {
    setTrackerStage('arrived');
  };

  const handleConfirmStart = () => {
    setTrackerStage('serviceStarted');
  };

  const handleConfirmEnd = () => {
    setHasUpcomingAppointment(false);
    setTrackingEnabled(false);
  };

  const showUpcomingCard = hasUpcomingAppointment && !trackingEnabled;
  const showLiveTracker = hasUpcomingAppointment && trackingEnabled;

  const renderFeedPost = ({ item }: { item: ProviderPost }) => (
    <View style={styles.feedCard}>
      <View style={styles.feedHeaderRow}>
        <View style={styles.feedAvatar}>
          <IconSymbol
            ios_icon_name="person.fill"
            android_material_icon_name="person"
            size={18}
            color={colors.primary}
          />
        </View>
        <View style={styles.feedHeaderInfo}>
          <Text style={styles.feedBusinessName}>{item.businessName}</Text>
          <Text style={styles.feedMetaText}>
            {item.location} • {item.timestamp}
          </Text>
        </View>
      </View>

      <View style={styles.mediaPreview}>
        <Text style={styles.mediaBadge}>{item.mediaType === 'video' ? 'Video' : 'Photo'}</Text>
        <Text style={styles.mediaLabel}>{item.mediaLabel}</Text>
        {item.mediaType === 'video' ? (
          <View style={styles.mediaPlayIconWrap}>
            <IconSymbol
              ios_icon_name="play.fill"
              android_material_icon_name="play-circle-filled"
              size={34}
              color={colors.card}
            />
          </View>
        ) : null}
      </View>

      <Text style={styles.feedCaption} numberOfLines={3}>
        {item.caption}
      </Text>

      <View style={styles.feedActionBar}>
        <View style={styles.feedLightActions}>
          <TouchableOpacity style={styles.lightActionButton}>
            <IconSymbol
              ios_icon_name="bookmark"
              android_material_icon_name="bookmark-border"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.lightActionText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightActionButton}>
            <IconSymbol
              ios_icon_name="square.and.arrow.up"
              android_material_icon_name="share"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.lightActionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedBookingActions}>
          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() =>
              push('/(tabs)/(home)/provider-profile', {
                provider: item.businessName,
                owner: item.providerName,
                location: item.location,
              })
            }
          >
            <Text style={styles.viewProfileText}>View profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={() =>
              push('/(tabs)/(home)/service-detail', {
                service: item.serviceLabel,
                provider: item.businessName,
                location: item.location,
              })
            }
          >
            <Text style={styles.bookNowText}>Book now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const listHeader = (
    <View style={styles.headerContentWrap}>
      <View style={styles.welcomeHeaderRow}>
        <View>
          <Text style={styles.welcomeLabel}>Welcome to</Text>
          <Text style={styles.wordmark}>EWAJI</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => push('/notifications')}>
          <IconSymbol
            ios_icon_name="bell.fill"
            android_material_icon_name="notifications"
            size={20}
            color={colors.primary}
          />
          {unreadNotificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
        <IconSymbol
          ios_icon_name="magnifyingglass"
          android_material_icon_name="search"
          size={18}
          color={searchFocused ? colors.primary : colors.textSecondary}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onSubmitEditing={() => push('/(tabs)/search')}
          placeholder="Search services, providers, locations"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.sectionRowHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => push('/(tabs)/search')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {HOME_CATEGORIES.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryItem} onPress={() => push('/(tabs)/search')}>
            <View style={styles.categoryIconWrap}>
              <IconSymbol
                ios_icon_name="sparkles"
                android_material_icon_name={category.icon}
                size={22}
                color={colors.primary}
              />
            </View>
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionRowHeader}>
        <Text style={styles.sectionTitle}>Featured Services</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
        {FEATURED_SERVICES.map((service) => (
          <View key={service.id} style={styles.featuredCard}>
            <Text style={styles.featuredService}>{service.service}</Text>
            <Text style={styles.featuredProvider}>{service.provider}</Text>
            <Text style={styles.featuredLocation}>{service.location}</Text>

            <View style={styles.featuredFooter}>
              <Text style={styles.featuredPrice}>{service.price}</Text>
              <View style={styles.featuredRatingWrap}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={13}
                  color={colors.warning}
                />
                <Text style={styles.featuredRating}>{service.rating}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.featuredBookButton}
              onPress={() =>
                push('/(tabs)/(home)/service-detail', {
                  service: service.service,
                  provider: service.provider,
                  location: service.location,
                })
              }
            >
              <Text style={styles.featuredBookText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {showUpcomingCard ? (
        <View style={styles.upcomingCard}>
          <View style={styles.sectionRowHeader}>
            <Text style={styles.upcomingTitle}>Upcoming appointment</Text>
            <Text style={styles.upcomingStatus}>Confirmed</Text>
          </View>

          <Text style={styles.upcomingLine}>Boho Knotless Braids • Today 2:30 PM</Text>
          <Text style={styles.upcomingLineSub}>Glow House Studio • 1.2 mi away</Text>

          <TouchableOpacity style={styles.onMyWayButton} onPress={handleOnMyWay}>
            <Text style={styles.onMyWayText}>I&apos;m on my way</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showLiveTracker ? (
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>{trackerTitle}</Text>
          <Text style={styles.trackerSubtitle}>{trackerSubtitle}</Text>

          <View style={styles.mapPreview}>
            <View style={styles.mapRouteLine} />
            <View style={styles.mapStartDot} />
            <View style={styles.mapEndDot} />
            <View style={styles.mapCarChip}>
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={14}
                color={colors.card}
              />
              <Text style={styles.mapCarText}>ETA 12m</Text>
            </View>
          </View>

          <View style={styles.trackerActions}>
            {trackerStage === 'onTheWay' ? (
              <TouchableOpacity style={styles.trackerActionPrimary} onPress={handleConfirmArrival}>
                <Text style={styles.trackerActionPrimaryText}>Confirm arrival</Text>
              </TouchableOpacity>
            ) : null}

            {trackerStage === 'arrived' ? (
              <TouchableOpacity style={styles.trackerActionPrimary} onPress={handleConfirmStart}>
                <Text style={styles.trackerActionPrimaryText}>Confirm start of service</Text>
              </TouchableOpacity>
            ) : null}

            {trackerStage === 'serviceStarted' ? (
              <TouchableOpacity style={styles.trackerActionPrimary} onPress={handleConfirmEnd}>
                <Text style={styles.trackerActionPrimaryText}>Confirm end of service</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.sectionRowHeader}>
        <Text style={styles.sectionTitle}>Provider portfolio feed</Text>
        <Text style={styles.feedHint}>Discover and book fast</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={isInitialLoading ? [] : posts}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedPost}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={isInitialLoading ? (
          <View>
            <FeedSkeletonCard />
            <FeedSkeletonCard />
            <FeedSkeletonCard />
          </View>
        ) : null}
        ListFooterComponent={
          isLoadingMore ? (
            <View>
              <FeedSkeletonCard />
              <FeedSkeletonCard />
            </View>
          ) : (
            <View style={styles.bottomSpacer} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.45}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 18 : 6,
    paddingBottom: 16,
  },
  headerContentWrap: {
    marginBottom: 8,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  welcomeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  wordmark: {
    marginTop: 1,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.6,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.card,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 16,
  },
  searchBarFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  sectionRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  categoriesRow: {
    paddingBottom: 6,
    gap: 10,
    marginBottom: 10,
  },
  categoryItem: {
    width: 76,
    alignItems: 'center',
  },
  categoryIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  featuredRow: {
    gap: 10,
    paddingBottom: 8,
    marginBottom: 12,
  },
  featuredCard: {
    width: 248,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  featuredService: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  featuredProvider: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },
  featuredLocation: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  featuredFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  featuredRatingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredRating: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  featuredBookButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
    paddingVertical: 9,
    alignItems: 'center',
  },
  featuredBookText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  upcomingCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  upcomingStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  upcomingLine: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  upcomingLineSub: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  onMyWayButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 10,
  },
  onMyWayText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  trackerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 12,
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  trackerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  mapPreview: {
    marginTop: 10,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#ECE9F7',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  mapRouteLine: {
    position: 'absolute',
    left: 36,
    top: 24,
    width: 160,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  mapStartDot: {
    position: 'absolute',
    left: 28,
    top: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  mapEndDot: {
    position: 'absolute',
    left: 194,
    top: 18,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  mapCarChip: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: colors.primary,
  },
  mapCarText: {
    color: colors.card,
    fontSize: 11,
    fontWeight: '700',
  },
  trackerActions: {
    marginTop: 10,
  },
  trackerActionPrimary: {
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackerActionPrimaryText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  feedHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  feedCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 12,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAFB',
    marginRight: 8,
  },
  feedHeaderInfo: {
    flex: 1,
  },
  feedBusinessName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  feedMetaText: {
    marginTop: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },
  mediaPreview: {
    height: 198,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#EAE6F7',
    padding: 10,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mediaBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.card,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  mediaPlayIconWrap: {
    alignSelf: 'center',
  },
  feedCaption: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  feedActionBar: {
    marginTop: 10,
    gap: 10,
  },
  feedLightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  lightActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  lightActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  feedBookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewProfileButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: colors.card,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  bookNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 9,
    backgroundColor: colors.primary,
  },
  bookNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8E5EE',
    marginRight: 8,
  },
  skeletonHeaderTextWrap: {
    flex: 1,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#E8E5EE',
  },
  skeletonMedia: {
    marginTop: 10,
    height: 198,
    borderRadius: 12,
    backgroundColor: '#E8E5EE',
  },
  skeletonActions: {
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8E5EE',
  },
  bottomSpacer: {
    height: 100,
  },
});
