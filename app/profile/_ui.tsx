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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export function ProfileScaffold({
  children,
  withTabBarInset = false,
}: {
  children: ReactNode;
  withTabBarInset?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, withTabBarInset && styles.contentWithTabInset]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileHeader({
  title,
  withBack = false,
}: {
  title: string;
  withBack?: boolean;
}) {
  const router = useRouter();

  return (
    <View style={styles.headerRow}>
      {withBack ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="chevron-left"
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.backButtonPlaceholder} />
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
  icon,
  onPress,
  destructive = false,
  isLast = false,
}: {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon ? (
        <View style={[styles.rowIconWrap, destructive && styles.rowIconWrapDestructive]}>
          <IconSymbol
            ios_icon_name="circle.fill"
            android_material_icon_name={icon}
            size={16}
            color={destructive ? colors.error : colors.primary}
          />
        </View>
      ) : null}

      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, destructive && styles.rowTitleDestructive]}>{title}</Text>
        {description ? (
          <Text
            numberOfLines={1}
            style={[styles.rowDescription, destructive && styles.rowDescriptionDestructive]}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <IconSymbol
        ios_icon_name="chevron.right"
        android_material_icon_name="chevron-right"
        size={20}
        color={destructive ? colors.error : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

export function EmptyStateCard({
  title,
  description,
  icon = 'inbox',
}: {
  title: string;
  description: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <IconSymbol
          ios_icon_name="tray"
          android_material_icon_name={icon}
          size={20}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export const profileUiStyles = StyleSheet.create({
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlinedButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8CBF7',
    backgroundColor: '#F7F3FF',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 18 : 8,
    paddingBottom: 32,
  },
  contentWithTabInset: {
    paddingBottom: 120,
  },
  headerRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E3DDF4',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    minHeight: 66,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE9F8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconWrapDestructive: {
    backgroundColor: '#FFEDED',
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
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  rowDescriptionDestructive: {
    color: '#D97979',
  },
  emptyCard: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

export default function ProfileUiHelperRoute() {
  return null;
}
