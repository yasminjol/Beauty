import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function ProviderProfilePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    provider?: string;
    owner?: string;
    location?: string;
  }>();

  const businessName = typeof params.provider === 'string' ? params.provider : 'Provider Profile';
  const ownerName = typeof params.owner === 'string' ? params.owner : 'Provider';
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
          <Text style={styles.title}>Provider</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <IconSymbol
              ios_icon_name="person.fill"
              android_material_icon_name="person"
              size={28}
              color={colors.primary}
            />
          </View>
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.ownerName}>{ownerName}</Text>
          <View style={styles.locationRow}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/search' as never)}>
          <Text style={styles.primaryButtonText}>View available services</Text>
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
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEAFB',
    marginBottom: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  ownerName: {
    marginTop: 2,
    fontSize: 13,
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
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '700',
  },
});
