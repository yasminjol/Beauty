import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getProviderById, MARKETPLACE_PROVIDERS } from '@/constants/marketplace';

export type ProviderReview = {
  id: string;
  providerId: string;
  bookingId?: string;
  serviceName: string;
  reviewerName: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAtLabel: string;
};

type SubmitReviewInput = {
  providerId: string;
  bookingId?: string;
  serviceName: string;
  rating: number;
  comment: string;
  photos: string[];
};

type ProviderRatingStats = {
  averageRating: number;
  totalReviews: number;
};

type ReviewsContextType = {
  reviews: ProviderReview[];
  submitReview: (input: SubmitReviewInput) => ProviderReview;
  getProviderReviews: (providerId: string) => ProviderReview[];
  getProviderRatingStats: (providerId: string) => ProviderRatingStats;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const INITIAL_REVIEWS: ProviderReview[] = [
  {
    id: 'seed-review-1',
    providerId: 'provider-glow-house',
    serviceName: 'Boho Knotless Braids',
    reviewerName: 'Amber J.',
    rating: 5,
    comment: 'Clean parts, lightweight finish, and amazing professionalism.',
    photos: [],
    createdAtLabel: '2 weeks ago',
  },
  {
    id: 'seed-review-2',
    providerId: 'provider-nailed-by-tori',
    serviceName: 'Luxury Gel-X Set',
    reviewerName: 'Kiara W.',
    rating: 5,
    comment: 'Nail shape is perfect and the set lasted over three weeks.',
    photos: [],
    createdAtLabel: '1 week ago',
  },
  {
    id: 'seed-review-3',
    providerId: 'provider-blink-atelier',
    serviceName: 'Hybrid Lash Fill',
    reviewerName: 'Sasha R.',
    rating: 4,
    comment: 'Retention is great and the style looked natural.',
    photos: [],
    createdAtLabel: '5 days ago',
  },
];

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ProviderReview[]>(INITIAL_REVIEWS);

  const submitReview = useCallback((input: SubmitReviewInput) => {
    const review: ProviderReview = {
      id: `review-${Date.now()}`,
      providerId: input.providerId,
      bookingId: input.bookingId,
      serviceName: input.serviceName,
      reviewerName: 'You',
      rating: input.rating,
      comment: input.comment,
      photos: input.photos,
      createdAtLabel: 'Just now',
    };

    setReviews((current) => [review, ...current]);
    return review;
  }, []);

  const getProviderReviews = useCallback(
    (providerId: string) => reviews.filter((review) => review.providerId === providerId),
    [reviews],
  );

  const getProviderRatingStats = useCallback(
    (providerId: string) => {
      const provider = getProviderById(providerId) ?? MARKETPLACE_PROVIDERS[0];
      const providerReviews = reviews.filter((review) => review.providerId === providerId);

      const initialRatingTotal = provider.rating * provider.reviewCount;
      const reviewRatingTotal = providerReviews.reduce((sum, review) => sum + review.rating, 0);
      const totalReviews = provider.reviewCount + providerReviews.length;
      const averageRating = totalReviews
        ? Number(((initialRatingTotal + reviewRatingTotal) / totalReviews).toFixed(1))
        : 0;

      return {
        averageRating,
        totalReviews,
      };
    },
    [reviews],
  );

  const value = useMemo(
    () => ({
      reviews,
      submitReview,
      getProviderReviews,
      getProviderRatingStats,
    }),
    [reviews, submitReview, getProviderReviews, getProviderRatingStats],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);

  if (!context) {
    throw new Error('useReviews must be used within ReviewsProvider');
  }

  return context;
}
