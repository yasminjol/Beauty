import React from 'react';
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
import { useMessages } from '@/contexts/MessagesContext';

const formatConversationTime = (createdAt: string) => {
  const date = new Date(createdAt);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export default function MessagesScreen() {
  const router = useRouter();
  const { viewerRole, conversations, totalUnreadCount, markConversationRead } = useMessages();

  const openConversation = (conversationId: string) => {
    markConversationRead(conversationId);
    router.push({ pathname: '/chat-thread', params: { conversationId } } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {viewerRole === 'provider'
              ? 'Chat directly with clients linked to your bookings.'
              : 'Chat directly with providers linked to your bookings.'}
          </Text>
          {totalUnreadCount > 0 ? (
            <View style={styles.unreadSummaryPill}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="mark-chat-unread"
                size={14}
                color={colors.primary}
              />
              <Text style={styles.unreadSummaryText}>{totalUnreadCount} unread</Text>
            </View>
          ) : null}
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyCard}>
            <IconSymbol
              ios_icon_name="message"
              android_material_icon_name="forum"
              size={28}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              {viewerRole === 'provider'
                ? 'Client conversations tied to bookings will appear here.'
                : 'Provider conversations tied to bookings will appear here.'}
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => {
            const conversationTitle =
              viewerRole === 'provider'
                ? conversation.clientName || 'Client'
                : conversation.providerBusiness;

            const conversationMeta =
              viewerRole === 'provider'
                ? `${conversation.providerBusiness} • ${conversation.clientLocation || conversation.providerLocation}`
                : `${conversation.providerName} • ${conversation.providerLocation}`;

            return (
              <TouchableOpacity
                key={conversation.id}
                style={styles.threadCard}
                activeOpacity={0.9}
                onPress={() => openConversation(conversation.id)}
              >
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{getInitials(conversationTitle) || 'EW'}</Text>
                </View>

                <View style={styles.threadMain}>
                  <View style={styles.threadTopRow}>
                    <Text style={styles.businessName} numberOfLines={1}>
                      {conversationTitle}
                    </Text>
                    <Text style={styles.timeText}>{formatConversationTime(conversation.lastMessageAt)}</Text>
                  </View>

                  <View style={styles.threadMetaRow}>
                    <Text style={styles.providerMeta} numberOfLines={1}>
                      {conversationMeta}
                    </Text>
                  </View>

                  <View style={styles.threadBottomRow}>
                    <Text
                      style={[
                        styles.previewText,
                        conversation.unreadCount > 0 && styles.previewUnreadText,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessagePreview}
                    </Text>

                    <View style={styles.rightMetaWrap}>
                      <View
                        style={[
                          styles.bookingTag,
                          conversation.hasActiveBooking
                            ? styles.bookingTagActive
                            : styles.bookingTagPast,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bookingTagText,
                            conversation.hasActiveBooking
                              ? styles.bookingTagTextActive
                              : styles.bookingTagTextPast,
                          ]}
                        >
                          {conversation.hasActiveBooking ? 'Active' : 'Past'}
                        </Text>
                      </View>

                      {conversation.unreadCount > 0 ? (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

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
    paddingTop: Platform.OS === 'android' ? 20 : 4,
    paddingBottom: 16,
  },
  headerWrap: {
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  unreadSummaryPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9CCF9',
    backgroundColor: '#F3EDFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE8F7',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  threadCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE8F7',
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFE8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  threadMain: {
    flex: 1,
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  businessName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  threadMetaRow: {
    marginTop: 2,
  },
  providerMeta: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  threadBottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  previewUnreadText: {
    color: colors.text,
    fontWeight: '600',
  },
  rightMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingTag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bookingTagActive: {
    backgroundColor: '#EFE8FF',
  },
  bookingTagPast: {
    backgroundColor: '#F2F1F7',
  },
  bookingTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingTagTextActive: {
    color: colors.primary,
  },
  bookingTagTextPast: {
    color: '#8A8AA2',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 96,
  },
});
