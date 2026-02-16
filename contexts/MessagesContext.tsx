import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useClientBookings } from '@/contexts/ClientBookingsContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';

export type ConversationSender = 'client' | 'provider';

export type ConversationMessage = {
  id: string;
  conversationId: string;
  sender: ConversationSender;
  text: string;
  createdAt: string;
  read: boolean;
};

export type ConversationThread = {
  id: string;
  providerId: string;
  providerName: string;
  providerBusiness: string;
  providerLocation: string;
  clientName?: string;
  clientLocation?: string;
  bookingIds: string[];
};

export type ConversationSummary = ConversationThread & {
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  hasActiveBooking: boolean;
};

type EnsureConversationInput = {
  providerId: string;
  providerName: string;
  providerBusiness: string;
  providerLocation: string;
  clientName?: string;
  clientLocation?: string;
  bookingId?: string;
};

type MessagesContextValue = {
  viewerRole: 'client' | 'provider';
  conversations: ConversationSummary[];
  totalUnreadCount: number;
  typingByConversation: Record<string, boolean>;
  getConversationById: (conversationId?: string | null) => ConversationSummary | undefined;
  getMessages: (conversationId?: string | null) => ConversationMessage[];
  ensureConversation: (input: EnsureConversationInput) => string;
  markConversationRead: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, text: string) => boolean;
};

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

const nowMs = Date.now();
const minutesAgo = (minutes: number) => new Date(nowMs - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(nowMs - hours * 60 * 60 * 1000).toISOString();

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conversation-1',
    providerId: 'provider-glow-house',
    providerName: 'Yasmine N.',
    providerBusiness: 'Glow House Studio',
    providerLocation: 'Oakland, CA',
    clientName: 'Jade Carter',
    clientLocation: 'Oakland, CA',
    bookingIds: ['booking-101'],
  },
  {
    id: 'conversation-2',
    providerId: 'provider-nailed-by-tori',
    providerName: 'Tori M.',
    providerBusiness: 'Nailed by Tori',
    providerLocation: 'Brooklyn, NY',
    clientName: 'Marcus Lee',
    clientLocation: 'Brooklyn, NY',
    bookingIds: ['booking-102'],
  },
  {
    id: 'conversation-3',
    providerId: 'provider-blink-atelier',
    providerName: 'Chloe R.',
    providerBusiness: 'Blink Atelier',
    providerLocation: 'Atlanta, GA',
    clientName: 'Ava Monroe',
    clientLocation: 'Atlanta, GA',
    bookingIds: ['booking-103'],
  },
];

const INITIAL_MESSAGES: Record<string, ConversationMessage[]> = {
  'conversation-1': [
    {
      id: 'msg-101',
      conversationId: 'conversation-1',
      sender: 'client',
      text: 'Hi! Looking forward to tomorrow. Should I come with my hair stretched?',
      createdAt: hoursAgo(8),
      read: true,
    },
    {
      id: 'msg-102',
      conversationId: 'conversation-1',
      sender: 'provider',
      text: 'Yes please, come with hair stretched and detangled.',
      createdAt: hoursAgo(7),
      read: true,
    },
    {
      id: 'msg-103',
      conversationId: 'conversation-1',
      sender: 'provider',
      text: 'Can you arrive 10 minutes early if possible?',
      createdAt: minutesAgo(24),
      read: false,
    },
  ],
  'conversation-2': [
    {
      id: 'msg-201',
      conversationId: 'conversation-2',
      sender: 'provider',
      text: 'Your Gel-X set is still on for 2:30 PM today.',
      createdAt: hoursAgo(3),
      read: true,
    },
    {
      id: 'msg-202',
      conversationId: 'conversation-2',
      sender: 'client',
      text: 'Perfect, thank you. I will be there on time.',
      createdAt: hoursAgo(2),
      read: false,
    },
  ],
  'conversation-3': [
    {
      id: 'msg-301',
      conversationId: 'conversation-3',
      sender: 'client',
      text: 'Thanks again for the lash fill, retention has been great.',
      createdAt: hoursAgo(30),
      read: true,
    },
    {
      id: 'msg-302',
      conversationId: 'conversation-3',
      sender: 'provider',
      text: 'Glad to hear that. Reach out anytime you want to rebook.',
      createdAt: hoursAgo(29),
      read: true,
    },
  ],
};

const AUTO_RESPONSE_TEXT = [
  'Thanks for the update. I got your message.',
  'Perfect. I noted this on your appointment details.',
  'Great, see you then. I will keep you posted if anything changes.',
];

const sortMessagesAsc = (a: ConversationMessage, b: ConversationMessage) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const sortSummaryDesc = (a: ConversationSummary, b: ConversationSummary) =>
  new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { upcomingBookings } = useClientBookings();
  const { addNotification } = useNotifications();
  const viewerRole: 'client' | 'provider' = user?.role === 'provider' ? 'provider' : 'client';

  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [messagesByConversation, setMessagesByConversation] =
    useState<Record<string, ConversationMessage[]>>(INITIAL_MESSAGES);
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const threadsRef = useRef(threads);
  const activeConversationIdRef = useRef(activeConversationId);
  const responseTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const activeBookingIds = useMemo(() => {
    return new Set(upcomingBookings.map((booking) => booking.id));
  }, [upcomingBookings]);

  const conversations = useMemo(() => {
    const summaries = threads.map<ConversationSummary>((thread) => {
      const conversationMessages = [...(messagesByConversation[thread.id] ?? [])].sort(sortMessagesAsc);
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const unreadCount = conversationMessages.filter(
        (message) => message.sender !== viewerRole && !message.read,
      ).length;

      return {
        ...thread,
        lastMessagePreview: lastMessage?.text ?? 'Start a conversation',
        lastMessageAt: lastMessage?.createdAt ?? new Date(0).toISOString(),
        unreadCount,
        hasActiveBooking: thread.bookingIds.some((bookingId) => activeBookingIds.has(bookingId)),
      };
    });

    return summaries.sort(sortSummaryDesc);
  }, [activeBookingIds, messagesByConversation, threads, viewerRole]);

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    [conversations],
  );

  const getConversationById = useCallback(
    (conversationId?: string | null) => {
      if (!conversationId) return undefined;
      return conversations.find((conversation) => conversation.id === conversationId);
    },
    [conversations],
  );

  const getMessages = useCallback(
    (conversationId?: string | null) => {
      if (!conversationId) return [];
      return [...(messagesByConversation[conversationId] ?? [])].sort(sortMessagesAsc);
    },
    [messagesByConversation],
  );

  const markConversationRead = useCallback((conversationId: string) => {
    setMessagesByConversation((current) => {
      const existing = current[conversationId] ?? [];
      if (!existing.some((message) => message.sender !== viewerRole && !message.read)) {
        return current;
      }

      return {
        ...current,
        [conversationId]: existing.map((message) =>
          message.sender !== viewerRole ? { ...message, read: true } : message,
        ),
      };
    });
  }, [viewerRole]);

  const setActiveConversation = useCallback(
    (conversationId: string | null) => {
      setActiveConversationId(conversationId);
      if (conversationId) {
        markConversationRead(conversationId);
      }
    },
    [markConversationRead],
  );

  const ensureConversation = useCallback((input: EnsureConversationInput) => {
    const existing = threadsRef.current.find((thread) => {
      if (viewerRole === 'provider') {
        if (input.bookingId && thread.bookingIds.includes(input.bookingId)) return true;
        if (input.clientName && thread.clientName === input.clientName) return true;
      }
      return thread.providerId === input.providerId;
    });

    if (existing) {
      if (
        (input.bookingId && !existing.bookingIds.includes(input.bookingId)) ||
        (input.clientName && input.clientName !== existing.clientName) ||
        (input.clientLocation && input.clientLocation !== existing.clientLocation)
      ) {
        const nextThreads = threadsRef.current.map((thread) =>
          thread.id === existing.id
            ? {
                ...thread,
                bookingIds:
                  input.bookingId && !thread.bookingIds.includes(input.bookingId)
                    ? [...thread.bookingIds, input.bookingId]
                    : thread.bookingIds,
                clientName: input.clientName ?? thread.clientName,
                clientLocation: input.clientLocation ?? thread.clientLocation,
              }
            : thread,
        );

        threadsRef.current = nextThreads;
        setThreads(nextThreads);
      }

      return existing.id;
    }

    const newId = `conversation-${Date.now()}`;
    const newThread: ConversationThread = {
      id: newId,
      providerId: input.providerId,
      providerName: input.providerName,
      providerBusiness: input.providerBusiness,
      providerLocation: input.providerLocation,
      clientName: input.clientName,
      clientLocation: input.clientLocation,
      bookingIds: input.bookingId ? [input.bookingId] : [],
    };

    const nextThreads = [newThread, ...threadsRef.current];
    threadsRef.current = nextThreads;
    setThreads(nextThreads);

    setMessagesByConversation((current) => ({
      ...current,
      [newId]: [],
    }));

    return newId;
  }, [viewerRole]);

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const thread = threadsRef.current.find((item) => item.id === conversationId);
      if (!thread) return false;
      const receiverRole: ConversationSender = viewerRole === 'client' ? 'provider' : 'client';
      const senderLabel = viewerRole === 'client'
        ? thread.providerBusiness
        : thread.clientName || 'Client';

      const clientMessage: ConversationMessage = {
        id: `msg-client-${Date.now()}`,
        conversationId,
        sender: viewerRole,
        text: trimmed,
        createdAt: new Date().toISOString(),
        read: true,
      };

      setMessagesByConversation((current) => {
        const next = [...(current[conversationId] ?? []), clientMessage].sort(sortMessagesAsc);
        return {
          ...current,
          [conversationId]: next,
        };
      });

      setTypingByConversation((current) => ({
        ...current,
        [conversationId]: true,
      }));

      if (responseTimersRef.current[conversationId]) {
        clearTimeout(responseTimersRef.current[conversationId]);
      }

      responseTimersRef.current[conversationId] = setTimeout(() => {
        const autoReply = AUTO_RESPONSE_TEXT[Math.floor(Math.random() * AUTO_RESPONSE_TEXT.length)];
        const isActiveConversation = activeConversationIdRef.current === conversationId;

        const providerMessage: ConversationMessage = {
          id: `msg-provider-${Date.now()}`,
          conversationId,
          sender: receiverRole,
          text: autoReply,
          createdAt: new Date().toISOString(),
          read: isActiveConversation,
        };

        setMessagesByConversation((current) => {
          const next = [...(current[conversationId] ?? []), providerMessage].sort(sortMessagesAsc);
          return {
            ...current,
            [conversationId]: next,
          };
        });

        setTypingByConversation((current) => ({
          ...current,
          [conversationId]: false,
        }));

        if (!isActiveConversation) {
          addNotification({
            type: 'message',
            title: `New message from ${senderLabel}`,
            body: autoReply,
            deepLink: {
              pathname: '/chat-thread',
              params: { conversationId },
            },
          });
        }

        delete responseTimersRef.current[conversationId];
      }, 1200);

      return true;
    },
    [addNotification, viewerRole],
  );

  useEffect(() => {
    return () => {
      Object.values(responseTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      responseTimersRef.current = {};
    };
  }, []);

  const value = useMemo(
    () => ({
      viewerRole,
      conversations,
      totalUnreadCount,
      typingByConversation,
      getConversationById,
      getMessages,
      ensureConversation,
      markConversationRead,
      setActiveConversation,
      sendMessage,
    }),
    [
      viewerRole,
      conversations,
      totalUnreadCount,
      typingByConversation,
      getConversationById,
      getMessages,
      ensureConversation,
      markConversationRead,
      setActiveConversation,
      sendMessage,
    ],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }

  return context;
}
