import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useClientBookings } from '@/contexts/ClientBookingsContext';
import { useReviews } from '@/contexts/ReviewsContext';

const PHOTO_LIBRARY = [
  'Service result angle',
  'Close-up detail',
  'Final look',
  'Salon setup',
  'Before/after',
];

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function LeaveReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const bookingId = getParam(params.bookingId);

  const { getBookingById, markBookingReviewed } = useClientBookings();
  const { submitReview } = useReviews();

  const booking = getBookingById(bookingId);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const nextPhotoLabel = useMemo(
    () => PHOTO_LIBRARY[photos.length % PHOTO_LIBRARY.length],
    [photos.length],
  );

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateTitle}>Booking not found</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => router.replace('/(tabs)/bookings' as never)}>
            <Text style={styles.submitButtonText}>Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const addPhoto = () => {
    setPhotos((current) => [...current, `${nextPhotoLabel} ${current.length + 1}`]);
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = () => {
    if (rating < 1) {
      setErrorMessage('Please select a star rating before submitting.');
      return;
    }

    setErrorMessage(null);

    submitReview({
      providerId: booking.providerId ?? 'provider-glow-house',
      bookingId: booking.id,
      serviceName: booking.serviceName,
      rating,
      comment: reviewText.trim(),
      photos,
    });

    markBookingReviewed(booking.id);
    setSuccessMessage('Review submitted. Updating provider profile...');

    setTimeout(() => {
      router.replace({
        pathname: '/search-provider-profile',
        params: { providerId: booking.providerId ?? 'provider-glow-house' },
      } as never);
    }, 700);
  };

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
          <Text style={styles.headerTitle}>Leave Review</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
          <Text style={styles.summaryMeta}>{booking.providerBusiness}</Text>
          <Text style={styles.summaryMeta}>{booking.appointmentDateLabel} • {booking.appointmentTimeLabel}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= rating;
            return (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <IconSymbol
                  ios_icon_name={active ? 'star.fill' : 'star'}
                  android_material_icon_name={active ? 'star' : 'star-border'}
                  size={34}
                  color={active ? colors.primary : '#C7BDE3'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.ratingHint}>{rating ? `${rating} out of 5 stars` : 'Tap to rate this service'}</Text>

        <Text style={styles.sectionTitle}>Write a review</Text>
        <View style={styles.reviewInputWrap}>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience (optional)"
            placeholderTextColor={colors.textSecondary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{reviewText.length}/500</Text>
        </View>

        <Text style={styles.sectionTitle}>Upload photos (optional)</Text>
        <View style={styles.photosCard}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={addPhoto}>
            <IconSymbol
              ios_icon_name="camera.fill"
              android_material_icon_name="add-a-photo"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.addPhotoText}>Add photo</Text>
          </TouchableOpacity>

          {photos.length ? (
            <View style={styles.photoGrid}>
              {photos.map((label, index) => (
                <View key={`${label}-${index}`} style={styles.photoPreviewCard}>
                  <View style={styles.photoPreviewMedia}>
                    <IconSymbol
                      ios_icon_name="photo"
                      android_material_icon_name="image"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={styles.photoPreviewLabel} numberOfLines={2}>{label}</Text>
                  <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
                    <IconSymbol
                      ios_icon_name="xmark"
                      android_material_icon_name="close"
                      size={14}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.photoEmptyText}>No photos selected yet.</Text>
          )}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
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
    paddingBottom: 26,
  },
  emptyStateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 12,
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
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
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
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 14,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  summaryMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingHint: {
    marginTop: 4,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  reviewInputWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 12,
  },
  reviewInput: {
    minHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
  },
  photosCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: colors.card,
    padding: 12,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9CEF5',
    backgroundColor: '#F8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addPhotoText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
  },
  photoGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoPreviewCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E0F4',
    backgroundColor: '#FBFAFF',
    padding: 8,
    position: 'relative',
  },
  photoPreviewMedia: {
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F0E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreviewLabel: {
    marginTop: 6,
    fontSize: 11.5,
    color: colors.text,
    minHeight: 30,
  },
  removePhotoButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFD8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyText: {
    marginTop: 8,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 10,
    fontSize: 12.5,
    color: '#C93C3C',
  },
  successText: {
    marginTop: 10,
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 20,
  },
});
