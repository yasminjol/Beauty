import React, { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export function PageScaffold({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

export function PageHeader({
  title,
  subtitle,
  withBack = false,
}: {
  title: string;
  subtitle?: string;
  withBack?: boolean;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {withBack ? (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={18}
              color={colors.text}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export function SectionCard({ children }: { children: ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export function SectionRow({
  title,
  description,
  onPress,
  destructive = false,
  isLast = false,
  showChevron = true,
}: {
  title: string;
  description?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>{title}</Text>
        {description ? (
          <Text numberOfLines={1} style={[styles.rowDescription, destructive && styles.rowDescriptionDestructive]}>
            {description}
          </Text>
        ) : null}
      </View>
      {showChevron ? (
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={20}
          color={destructive ? colors.error : colors.textSecondary}
        />
      ) : null}
    </TouchableOpacity>
  );
}

export const meUiStyles = StyleSheet.create({
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  planPill: {
    borderRadius: 999,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  paragraphCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  paragraphTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  paragraphText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
    paddingBottom: 34,
  },
  header: {
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 34,
    height: 34,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowTitleDestructive: {
    color: colors.error,
  },
  rowDescription: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  rowDescriptionDestructive: {
    color: colors.error,
    opacity: 0.8,
  },
});

export default function MeHomeUiHelperRoute() {
  return null;
}
