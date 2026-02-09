import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

const SERVICE_PRICE_MAP: Record<string, number> = {
  'Box Braids': 180,
  'Fade + Beard Trim': 55,
  'Silk Press': 90,
  'Loc Retwist': 140,
  'Gel Manicure': 65,
  'Brow Lamination': 75,
};

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const parsePrice = (value?: string) => {
  if (!value) return null;
  const numeric = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const getStatusTheme = (status: string) => {
  if (status === 'Completed') {
    return { backgroundColor: '#E8F5E9', color: colors.success };
  }
  if (status === 'Cancelled') {
    return { backgroundColor: '#FFF3CD', color: '#8A6D3B' };
  }
  if (status === 'Declined') {
    return { backgroundColor: '#FBE9E7', color: colors.error };
  }
  return { backgroundColor: colors.secondary, color: colors.primary };
};

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const id = getParam(params.id) ?? 'appt_001';
  const client = getParam(params.client) ?? 'Client Name';
  const service = getParam(params.service) ?? 'Service';
  const time = getParam(params.time) ?? 'Date • Time';
  const status = getParam(params.status) ?? 'Upcoming';
  const priceValue = parsePrice(getParam(params.price));

  const basePrice = useMemo(() => {
    if (priceValue !== null) return priceValue;
    if (SERVICE_PRICE_MAP[service]) return SERVICE_PRICE_MAP[service];
    return 120;
  }, [priceValue, service]);

  const fee = Math.round(basePrice * 0.06 * 100) / 100;
  const tax = Math.round(basePrice * 0.04 * 100) / 100;
  const total = basePrice + fee + tax;

  const statusTheme = getStatusTheme(status);
  const isUpcoming = ['Upcoming', 'Confirmed', 'Pending'].includes(status);
  const isCompleted = status === 'Completed';
  const isCancelled = ['Cancelled', 'Declined'].includes(status);

  const actionGroups = useMemo(() => {
    if (isUpcoming) {
      return [
        { label: 'Message Client', variant: 'secondary' as const },
        { label: 'Reschedule', variant: 'primary' as const },
        { label: 'Cancel Booking', variant: 'destructive' as const },
      ];
    }
    if (isCompleted) {
      return [
        { label: 'Message Client', variant: 'secondary' as const },
        { label: 'Send Receipt', variant: 'primary' as const },
      ];
    }
    if (isCancelled) {
      return [{ label: 'Contact Support', variant: 'secondary' as const }];
    }
    return [{ label: 'Message Client', variant: 'secondary' as const }];
  }, [isUpcoming, isCompleted, isCancelled]);

  const initials = client
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAction = (label: string) => {
    setActionMessage(`${label} (mock)`);
    setTimeout(() => setActionMessage(null), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Appointment Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {actionMessage ? (
          <View style={styles.banner}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={18}
              color={colors.success}
            />
            <Text style={styles.bannerText}>{actionMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.serviceName}>{service}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusTheme.backgroundColor }]}
            >
              <Text style={[styles.statusText, { color: statusTheme.color }]}>{status}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="calendar-today"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailText}>{time}</Text>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol
              ios_icon_name="tag"
              android_material_icon_name="tag"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailText}>Booking ID • {id}</Text>
          </View>
        </View>

        <View style={styles.section}> 
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.card}>
            <View style={styles.clientRow}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientInitials}>{initials || 'CL'}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client}</Text>
                <Text style={styles.clientMeta}>client@ewaji.co</Text>
                <Text style={styles.clientMeta}>(555) 010-2034</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}> 
          <Text style={styles.sectionTitle}>Pricing Summary</Text>
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service price</Text>
              <Text style={styles.priceValue}>{formatCurrency(basePrice)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform fee</Text>
              <Text style={styles.priceValue}>{formatCurrency(fee)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>{formatCurrency(tax)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}> 
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.card}>
            <View style={styles.actionsStack}>
              {actionGroups.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.actionButton,
                    action.variant === 'primary' && styles.actionButtonPrimary,
                    action.variant === 'secondary' && styles.actionButtonSecondary,
                    action.variant === 'destructive' && styles.actionButtonDestructive,
                  ]}
                  onPress={() => handleAction(action.label)}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      action.variant === 'primary' && styles.actionButtonTextPrimary,
                      action.variant === 'secondary' && styles.actionButtonTextSecondary,
                      action.variant === 'destructive' && styles.actionButtonTextDestructive,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  clientMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  priceTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  priceTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actionsStack: {
    gap: 10,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonDestructive: {
    backgroundColor: '#FBE9E7',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: colors.card,
  },
  actionButtonTextSecondary: {
    color: colors.text,
  },
  actionButtonTextDestructive: {
    color: colors.error,
  },
});
