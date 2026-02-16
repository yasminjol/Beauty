import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { ConversationMessage, useMessages } from '@/contexts/MessagesContext';

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const formatMessageTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const getInitials = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getMessageReceipt = (
  message: ConversationMessage,
  messages: ConversationMessage[],
  viewerRole: 'client' | 'provider',
) => {
  if (message.sender !== viewerRole) return null;

  const hasReplyAfter = messages.some(
    (item) =>
      item.sender !== viewerRole &&
      new Date(item.createdAt).getTime() > new Date(message.createdAt).getTime(),
  );

  return hasReplyAfter ? 'Read' : 'Sent';
};

export default function ChatThreadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = getParam(params.conversationId);

  const {
    viewerRole,
    getConversationById,
    getMessages,
    typingByConversation,
    markConversationRead,
    setActiveConversation,
    sendMessage,
  } = useMessages();

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const conversation = getConversationById(conversationId);
  const messages = getMessages(conversationId);
  const isTyping = conversationId ? Boolean(typingByConversation[conversationId]) : false;

  useEffect(() => {
    if (!conversationId) return;

    setActiveConversation(conversationId);
    markConversationRead(conversationId);

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, markConversationRead, setActiveConversation]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 60);

    return () => clearTimeout(timeout);
  }, [messages, isTyping]);

  const headerLabel = useMemo(() => {
    if (!conversation) return 'Chat';
    return viewerRole === 'provider'
      ? conversation.clientName || 'Client'
      : conversation.providerBusiness;
  }, [conversation, viewerRole]);

  const headerSubtitle = useMemo(() => {
    if (!conversation) return '';
    if (viewerRole === 'provider') {
      return `${conversation.providerBusiness} • ${conversation.clientLocation || conversation.providerLocation}`;
    }
    return `${conversation.providerName} • ${conversation.providerLocation}`;
  }, [conversation, viewerRole]);

  const handleSend = () => {
    if (!conversationId) return;
    const sent = sendMessage(conversationId, draft);
    if (sent) {
      setDraft('');
    }
  };

  if (!conversation || !conversationId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Conversation not found</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              router.replace(
                (viewerRole === 'provider' ? '/(provider-tabs)/messages' : '/(tabs)/messages') as never,
              )
            }
          >
            <Text style={styles.emptyButtonText}>Back to Messages</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="chevron-left"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerMetaWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {headerLabel}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          </View>

          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{getInitials(headerLabel) || 'EW'}</Text>
          </View>
        </View>

        <ScrollView ref={scrollRef} style={styles.messagesList} contentContainerStyle={styles.messagesListContent}>
          {messages.map((message) => {
            const isOwnMessage = message.sender === viewerRole;
            const receipt = getMessageReceipt(message, messages, viewerRole);

            return (
              <View
                key={message.id}
                style={[
                  styles.messageBubbleWrap,
                  isOwnMessage ? styles.messageBubbleWrapClient : styles.messageBubbleWrapProvider,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.messageBubbleClient : styles.messageBubbleProvider,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isOwnMessage ? styles.messageTextClient : styles.messageTextProvider,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>

                <View
                  style={[
                    styles.messageMetaRow,
                    isOwnMessage ? styles.messageMetaRowClient : styles.messageMetaRowProvider,
                  ]}
                >
                  <Text style={styles.messageTimeText}>{formatMessageTime(message.createdAt)}</Text>
                  {receipt ? <Text style={styles.messageReceiptText}>{receipt}</Text> : null}
                </View>
              </View>
            );
          })}

          {isTyping ? (
            <View style={[styles.messageBubbleWrap, styles.messageBubbleWrapProvider]}>
              <View style={[styles.messageBubble, styles.messageBubbleTyping]}>
                <Text style={styles.typingText}>Typing...</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim()}
          >
            <IconSymbol
              ios_icon_name="arrow.up"
              android_material_icon_name="north"
              size={16}
              color={draft.trim() ? '#FFFFFF' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE4F7',
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4DCF3',
    backgroundColor: '#FBFAFF',
  },
  headerMetaWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    marginTop: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFE8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  messageBubbleWrap: {
    maxWidth: '84%',
    marginBottom: 2,
  },
  messageBubbleWrapClient: {
    alignSelf: 'flex-end',
  },
  messageBubbleWrapProvider: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageBubbleClient: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  messageBubbleProvider: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E7E1F5',
    borderBottomLeftRadius: 6,
  },
  messageBubbleTyping: {
    backgroundColor: '#F1ECFF',
    borderColor: '#E2D8FA',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextClient: {
    color: '#FFFFFF',
  },
  messageTextProvider: {
    color: colors.text,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  messageMetaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageMetaRowClient: {
    justifyContent: 'flex-end',
  },
  messageMetaRowProvider: {
    justifyContent: 'flex-start',
  },
  messageTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  messageReceiptText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  inputBar: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAE4F7',
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#DCD1F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FCFBFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E4DDF3',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
