import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    service?: string;
    provider?: string;
    location?: string;
  }>();

  const serviceName = typeof params.service === 'string' ? params.service : 'Service';
  const providerName = typeof params.provider === 'string' ? params.provider : 'Provider';
  const location = typeof params.location === 'string' ? params.location : 'Location unavailable';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={18}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Service</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.providerText}>by {providerName}</Text>
          <View style={styles.locationRow}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>From $95</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>Approx. 90 min</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={() => router.push('/(tabs)/bookings' as never)}>
          <Text style={styles.bookButtonText}>Continue to book</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  providerText: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFEAFB',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  bookButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '700',
  },
});
