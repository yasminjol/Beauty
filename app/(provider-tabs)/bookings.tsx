import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const TABS = [
  'Overview',
  'Requests',
  'Availability',
  'Reviews',
  'History',
  'My Disputes',
] as const;

type ProviderBookingsTab = (typeof TABS)[number];

type SummaryIconName = keyof typeof MaterialIcons.glyphMap;

const SUMMARY_CARDS: Array<{
  id: string;
  title: string;
  value: string;
  caption: string;
  icon: SummaryIconName;
}> = [
  {
    id: 'total',
    title: 'Total Appointments',
    value: '128',
    caption: 'All time',
    icon: 'event',
  },
  {
    id: 'pending',
    title: 'Pending Requests',
    value: '6',
    caption: 'Awaiting response',
    icon: 'schedule',
  },
  {
    id: 'revenue',
    title: "This Week's Revenue",
    value: '$1.8k',
    caption: '+12% vs last week',
    icon: 'attach-money',
  },
];

const RECENT_APPOINTMENTS = [
  {
    id: 'appt_1',
    client: 'Jade Carter',
    service: 'Box Braids',
    time: 'Today • 2:30 PM',
    status: 'Upcoming',
    price: '$180',
  },
  {
    id: 'appt_2',
    client: 'Marcus Lee',
    service: 'Fade + Beard Trim',
    time: 'Tomorrow • 11:00 AM',
    status: 'Confirmed',
    price: '$55',
  },
  {
    id: 'appt_3',
    client: 'Nia Roberts',
    service: 'Silk Press',
    time: 'Fri • 5:15 PM',
    status: 'Pending',
    price: '$90',
  },
];

const HISTORY_APPOINTMENTS = [
  ...RECENT_APPOINTMENTS,
  {
    id: 'appt_4',
    client: 'Cory Daniels',
    service: 'Loc Retwist',
    time: 'Jan 27 • 10:00 AM',
    status: 'Completed',
    price: '$140',
  },
  {
    id: 'appt_5',
    client: 'Ava Monroe',
    service: 'Gel Manicure',
    time: 'Jan 25 • 3:00 PM',
    status: 'Completed',
    price: '$65',
  },
  {
    id: 'appt_6',
    client: 'Rae Nguyen',
    service: 'Brow Lamination',
    time: 'Jan 20 • 1:00 PM',
    status: 'Cancelled',
    price: '$75',
  },
];

const REVIEWS = [
  {
    id: 'rev_1',
    client: 'Jade Carter',
    service: 'Box Braids',
    date: 'Jan 28, 2026',
    rating: 5,
    feedback: 'Loved the results and the studio vibe. Will book again!',
  },
  {
    id: 'rev_2',
    client: 'Marcus Lee',
    service: 'Fade + Beard Trim',
    date: 'Jan 22, 2026',
    rating: 4,
    feedback: 'Great cut, slight wait time but overall solid.',
  },
  {
    id: 'rev_3',
    client: 'Ava Monroe',
    service: 'Gel Manicure',
    date: 'Jan 18, 2026',
    rating: 5,
    feedback: '',
  },
  {
    id: 'rev_4',
    client: 'Cory Daniels',
    service: 'Loc Retwist',
    date: 'Jan 10, 2026',
    rating: 3,
    feedback: 'Friendly service, I wanted a bit more shape definition.',
  },
];

const DISPUTES: Dispute[] = [
  {
    id: 'disp_1',
    client: 'Jade Carter',
    service: 'Box Braids',
    date: 'Jan 28, 2026',
    reason: 'Late arrival',
    status: 'Open',
    amount: '$180',
  },
  {
    id: 'disp_2',
    client: 'Marcus Lee',
    service: 'Fade + Beard Trim',
    date: 'Jan 22, 2026',
    reason: 'Service concern',
    status: 'Under Review',
    amount: '$55',
  },
  {
    id: 'disp_3',
    client: 'Ava Monroe',
    service: 'Gel Manicure',
    date: 'Jan 18, 2026',
    reason: 'Charge inquiry',
    status: 'Resolved',
    amount: '$65',
  },
];

type AppointmentStatus =
  | 'Upcoming'
  | 'Confirmed'
  | 'Pending'
  | 'Completed'
  | 'Cancelled'
  | 'Declined';

type Appointment = {
  id: string;
  client: string;
  service: string;
  time: string;
  status: AppointmentStatus | string;
  price?: string;
};

type RequestStatus = 'Pending Approval' | 'Reschedule Requested' | 'Pending Change';

type BookingRequest = {
  id: string;
  client: string;
  service: string;
  requestedDate: string;
  requestedTime: string;
  duration: string;
  price: string;
  status: RequestStatus;
  proposedDate?: string;
  proposedTime?: string;
};

type Review = {
  id: string;
  client: string;
  service: string;
  date: string;
  rating: number;
  feedback?: string;
};

type DisputeStatus = 'Open' | 'Under Review' | 'Resolved';

type Dispute = {
  id: string;
  client: string;
  service: string;
  date: string;
  reason: string;
  status: DisputeStatus;
  amount?: string;
};

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type DayAvailability = {
  open: boolean;
  start: Date;
  end: Date;
  breakEnabled: boolean;
  breakStart: Date;
  breakEnd: Date;
  startInput: string;
  endInput: string;
  breakStartInput: string;
  breakEndInput: string;
};

const HISTORY_FILTERS = ['Upcoming', 'Completed', 'Cancelled', 'Declined'] as const;
type HistoryFilter = (typeof HISTORY_FILTERS)[number];
const REVIEW_FILTERS = ['All', '5', '4', '3', '2', '1'] as const;
type ReviewFilter = (typeof REVIEW_FILTERS)[number];

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const formatTimeInputValue = (date: Date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const parseTimeInput = (value: string) => {
  if (value === '') {
    return { valid: true, complete: false };
  }

  if (!/^\d{0,2}(:\d{0,2})?$/.test(value) || value.startsWith(':')) {
    return { valid: false, complete: false };
  }

  const [rawHours, rawMinutes] = value.split(':');

  if (rawHours.length === 2 && Number(rawHours) > 23) {
    return { valid: false, complete: false };
  }

  if (rawMinutes && rawMinutes.length === 2 && Number(rawMinutes) > 59) {
    return { valid: false, complete: false };
  }

  if (rawMinutes && rawHours.length === 0) {
    return { valid: false, complete: false };
  }

  if (rawHours.length > 0 && rawMinutes?.length === 2) {
    const hour = Number(rawHours);
    const minute = Number(rawMinutes);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return { valid: false, complete: false };
    }
    return {
      valid: true,
      complete: true,
      hour,
      minute,
      normalized: `${hour.toString().padStart(2, '0')}:${rawMinutes.padStart(2, '0')}`,
    };
  }

  return { valid: true, complete: false };
};

const createTimeValue = (hour: number, minute: number) => {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  return next;
};

const createDayAvailability = (open: boolean): DayAvailability => {
  const start = createTimeValue(9, 0);
  const end = createTimeValue(18, 0);
  const breakStart = createTimeValue(13, 0);
  const breakEnd = createTimeValue(14, 0);
  return {
    open,
    start,
    end,
    breakEnabled: false,
    breakStart,
    breakEnd,
    startInput: formatTimeInputValue(start),
    endInput: formatTimeInputValue(end),
    breakStartInput: formatTimeInputValue(breakStart),
    breakEndInput: formatTimeInputValue(breakEnd),
  };
};

const buildWeeklyAvailability = (): Record<DayKey, DayAvailability> => ({
  monday: createDayAvailability(true),
  tuesday: createDayAvailability(true),
  wednesday: createDayAvailability(true),
  thursday: createDayAvailability(true),
  friday: createDayAvailability(true),
  saturday: createDayAvailability(false),
  sunday: createDayAvailability(false),
});

type DateOverride = {
  unavailable: boolean;
  start: Date;
  end: Date;
  breakEnabled: boolean;
  breakStart: Date;
  breakEnd: Date;
  startInput: string;
  endInput: string;
  breakStartInput: string;
  breakEndInput: string;
};

const createDateOverride = (base?: DayAvailability): DateOverride => {
  const source = base ?? createDayAvailability(true);
  return {
    unavailable: !source.open,
    start: new Date(source.start),
    end: new Date(source.end),
    breakEnabled: source.breakEnabled,
    breakStart: new Date(source.breakStart),
    breakEnd: new Date(source.breakEnd),
    startInput: source.startInput,
    endInput: source.endInput,
    breakStartInput: source.breakStartInput,
    breakEndInput: source.breakEndInput,
  };
};
const getRequestStatusTheme = (status: RequestStatus) => {
  switch (status) {
    case 'Reschedule Requested':
      return { backgroundColor: '#FFF3CD', color: '#8A6D3B' };
    case 'Pending Change':
      return { backgroundColor: '#E3F2FD', color: '#1E88E5' };
    default:
      return { backgroundColor: colors.secondary, color: colors.primary };
  }
};

const getHistoryStatusTheme = (status: string) => {
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

const getHistoryDisplayStatus = (status: string) => {
  if (['Upcoming', 'Confirmed', 'Pending'].includes(status)) {
    return 'Upcoming';
  }
  return status;
};

const getDisputeTheme = (status: DisputeStatus) => {
  if (status === 'Resolved') {
    return { backgroundColor: '#E8F5E9', color: colors.success };
  }
  if (status === 'Under Review') {
    return { backgroundColor: '#FFF3CD', color: '#8A6D3B' };
  }
  return { backgroundColor: colors.secondary, color: colors.primary };
};

export default function ProviderBookingsHub() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProviderBookingsTab>('Overview');
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(RECENT_APPOINTMENTS);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>(HISTORY_APPOINTMENTS);
  const [, setDeclinedRequests] = useState<BookingRequest[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([
    {
      id: 'req_1',
      client: 'Lana Park',
      service: 'Knotless Braids',
      requestedDate: 'Feb 12',
      requestedTime: '9:30 AM',
      duration: '3h 30m',
      price: '$220',
      status: 'Pending Approval',
    },
    {
      id: 'req_2',
      client: 'Miles Turner',
      service: 'Beard Sculpt + Line-Up',
      requestedDate: 'Feb 13',
      requestedTime: '1:00 PM',
      duration: '45m',
      price: '$55',
      status: 'Reschedule Requested',
    },
    {
      id: 'req_3',
      client: 'Ari Gomez',
      service: 'Soft Glam Makeup',
      requestedDate: 'Feb 15',
      requestedTime: '4:15 PM',
      duration: '1h 15m',
      price: '$120',
      status: 'Pending Approval',
    },
  ]);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [proposedDateValue, setProposedDateValue] = useState(new Date());
  const [proposedTimeValue, setProposedTimeValue] = useState(new Date());
  const [proposedDateInput, setProposedDateInput] = useState('');
  const [proposedTimeInput, setProposedTimeInput] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reviews] = useState<Review[]>(REVIEWS);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('All');
  const [reviewReplyDrafts, setReviewReplyDrafts] = useState<Record<string, string>>({});
  const [reviewReplyOpen, setReviewReplyOpen] = useState<Record<string, boolean>>({});
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({});
  const [disputes] = useState<Dispute[]>(DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState('');
  const [disputeActionNote, setDisputeActionNote] = useState<string | null>(null);
  const [availabilityMode, setAvailabilityMode] = useState<'weekly' | 'overrides'>('weekly');
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<DayKey, DayAvailability>>(
    buildWeeklyAvailability()
  );
  const [weeklySaved, setWeeklySaved] = useState(false);
  const [overrideSaved, setOverrideSaved] = useState(false);
  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>({});
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedOverrideDate, setSelectedOverrideDate] = useState<Date | null>(null);
  const [overrideDraft, setOverrideDraft] = useState<DateOverride | null>(null);
  const [overrideModalVisible, setOverrideModalVisible] = useState(false);
  const [availabilityPicker, setAvailabilityPicker] = useState<{
    scope: 'weekly' | 'override';
    dayKey?: DayKey;
    dateKey?: string;
    field: 'start' | 'end' | 'breakStart' | 'breakEnd';
  } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('Upcoming');
  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const closeRescheduleModal = () => {
    setRescheduleModalVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setSelectedRequest(null);
  };

  const closeDisputeModal = () => {
    setDisputeModalVisible(false);
    setSelectedDispute(null);
    setDisputeMessage('');
  };

  useEffect(() => {
    const layout = tabLayouts.current[activeTab];
    if (!layout) return;

    const targetX = Math.max(0, layout.x + layout.width / 2 - width / 2);
    tabScrollRef.current?.scrollTo({ x: targetX, animated: true });
  }, [activeTab, width]);

  const summaryCards = SUMMARY_CARDS.map((card) => {
    if (card.id === 'pending') {
      return { ...card, value: String(requests.length) };
    }
    return card;
  });

  const filteredHistoryAppointments = historyAppointments.filter((appointment) => {
    const statusMatches = (() => {
      if (historyFilter === 'Upcoming') {
        return ['Upcoming', 'Confirmed', 'Pending'].includes(appointment.status);
      }
      return appointment.status === historyFilter;
    })();

    return statusMatches;
  });

  const filteredReviews = reviews.filter((review) => {
    if (reviewFilter === 'All') return true;
    return review.rating === Number(reviewFilter);
  });

  const closeOverrideModal = () => {
    setOverrideModalVisible(false);
    setOverrideDraft(null);
    setSelectedOverrideDate(null);
    setAvailabilityPicker(null);
  };

  const updateWeeklyDay = (dayKey: DayKey, updater: (day: DayAvailability) => DayAvailability) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [dayKey]: updater(prev[dayKey]),
    }));
  };

  const updateWeeklyTimeInput = (
    dayKey: DayKey,
    field: 'start' | 'end' | 'breakStart' | 'breakEnd',
    value: string
  ) => {
    const parsed = parseTimeInput(value);
    if (!parsed.valid) return;

    updateWeeklyDay(dayKey, (current) => {
      const inputKey =
        field === 'start'
          ? 'startInput'
          : field === 'end'
          ? 'endInput'
          : field === 'breakStart'
          ? 'breakStartInput'
          : 'breakEndInput';
      const next = { ...current, [inputKey]: value };

      if (parsed.complete && parsed.hour !== undefined && parsed.minute !== undefined) {
        const updated = new Date(current[field]);
        updated.setHours(parsed.hour, parsed.minute, 0, 0);
        return {
          ...next,
          [field]: updated,
          [inputKey]: parsed.normalized ?? value,
        };
      }

      return next;
    });
  };

  const toggleWeeklyDay = (dayKey: DayKey) => {
    updateWeeklyDay(dayKey, (day) => ({
      ...day,
      open: !day.open,
    }));
  };

  const saveWeeklyAvailability = () => {
    setWeeklySaved(true);
    setTimeout(() => setWeeklySaved(false), 2000);
  };

  const openOverrideForDate = (date: Date) => {
    const dateKey = toDateKey(date);
    const dayIndex = (date.getDay() + 6) % 7;
    const baseDay = weeklyAvailability[DAYS[dayIndex].key];
    const existing = dateOverrides[dateKey];
    setSelectedOverrideDate(date);
    setOverrideDraft(existing ? { ...existing } : createDateOverride(baseDay));
    setOverrideModalVisible(true);
  };

  const saveDateOverride = () => {
    if (!selectedOverrideDate || !overrideDraft) return;
    const dateKey = toDateKey(selectedOverrideDate);
    setDateOverrides((prev) => ({
      ...prev,
      [dateKey]: overrideDraft,
    }));
    setOverrideSaved(true);
    setTimeout(() => setOverrideSaved(false), 2000);
    closeOverrideModal();
  };

  const removeDateOverride = () => {
    if (!selectedOverrideDate) return;
    const dateKey = toDateKey(selectedOverrideDate);
    setDateOverrides((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
    closeOverrideModal();
  };

  const updateOverrideDraft = (updater: (draft: DateOverride) => DateOverride) => {
    setOverrideDraft((prev) => (prev ? updater(prev) : prev));
  };

  const updateOverrideTimeInput = (
    field: 'start' | 'end' | 'breakStart' | 'breakEnd',
    value: string
  ) => {
    const parsed = parseTimeInput(value);
    if (!parsed.valid) return;

    updateOverrideDraft((current) => {
      const inputKey =
        field === 'start'
          ? 'startInput'
          : field === 'end'
          ? 'endInput'
          : field === 'breakStart'
          ? 'breakStartInput'
          : 'breakEndInput';
      const next = { ...current, [inputKey]: value };

      if (parsed.complete && parsed.hour !== undefined && parsed.minute !== undefined) {
        const updated = new Date(current[field]);
        updated.setHours(parsed.hour, parsed.minute, 0, 0);
        return {
          ...next,
          [field]: updated,
          [inputKey]: parsed.normalized ?? value,
        };
      }

      return next;
    });
  };

  const calendarDays = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
    const cells: Array<{ date: Date | null; inMonth: boolean }> = [];

    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ date: null, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, inMonth: false });
    }
    return cells;
  })();

  const renderOverview = () => (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.summaryRow}
      >
        {summaryCards.map((card) => (
          <View key={card.id} style={styles.summaryCard}>
            <View style={styles.summaryIconWrap}>
              <IconSymbol
                ios_icon_name="chart.bar"
                android_material_icon_name={card.icon}
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.summaryValue}>{card.value}</Text>
            <Text style={styles.summaryTitle}>{card.title}</Text>
            <Text style={styles.summaryCaption}>{card.caption}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.overviewDivider} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Appointments</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setActiveTab('History')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {recentAppointments.map((appointment) => (
        <View key={appointment.id} style={styles.appointmentCard}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentClient}>{appointment.client}</Text>
            <Text style={styles.appointmentService}>{appointment.service}</Text>
            <View style={styles.appointmentMetaRow}>
              <IconSymbol
                ios_icon_name="clock"
                android_material_icon_name="schedule"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRequests = () => (
    <View style={styles.section}>
      {requests.length === 0 ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No new requests</Text>
          <Text style={styles.placeholderText}>
            New booking requests will show up here so you can accept, decline, or reschedule.
          </Text>
        </View>
      ) : (
        requests.map((request) => {
          const proposedLabel = request.proposedDate && request.proposedTime
            ? `${request.proposedDate} • ${request.proposedTime}`
            : null;

          return (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View>
                  <Text style={styles.requestClient}>{request.client}</Text>
                  <Text style={styles.requestService}>{request.service}</Text>
                </View>
                <View
                  style={[
                    styles.requestStatusPill,
                    { backgroundColor: getRequestStatusTheme(request.status).backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.requestStatusText,
                      { color: getRequestStatusTheme(request.status).color },
                    ]}
                  >
                    {request.status}
                  </Text>
                </View>
              </View>
              <View style={styles.requestDetailsRow}>
                <View style={styles.requestDetail}>
                  <Text style={styles.requestDetailLabel}>Requested</Text>
                  <Text style={styles.requestDetailValue}>
                    {request.requestedDate} • {request.requestedTime}
                  </Text>
                </View>
                <View style={styles.requestDetail}>
                  <Text style={styles.requestDetailLabel}>Duration</Text>
                  <Text style={styles.requestDetailValue}>{request.duration}</Text>
                </View>
                <View style={styles.requestDetail}>
                  <Text style={styles.requestDetailLabel}>Price</Text>
                  <Text style={styles.requestDetailValue}>{request.price}</Text>
                </View>
              </View>
              {proposedLabel ? (
                <View style={styles.proposedRow}>
                  <Text style={styles.proposedLabel}>Proposed time</Text>
                  <Text style={styles.proposedValue}>{proposedLabel}</Text>
                </View>
              ) : null}
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => {
                    setRequests((prev) => prev.filter((item) => item.id !== request.id));
                    const confirmedAppointment: Appointment = {
                      id: `conf_${request.id}`,
                      client: request.client,
                      service: request.service,
                      time: `${request.requestedDate} • ${request.requestedTime}`,
                      status: 'Confirmed',
                      price: request.price,
                    };
                    setRecentAppointments((prev) => [confirmedAppointment, ...prev]);
                    setHistoryAppointments((prev) => [confirmedAppointment, ...prev]);
                  }}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => {
                    setRequests((prev) => prev.filter((item) => item.id !== request.id));
                    setDeclinedRequests((prev) => [...prev, request]);
                    const declinedAppointment: Appointment = {
                      id: `decl_${request.id}`,
                      client: request.client,
                      service: request.service,
                      time: `${request.requestedDate} • ${request.requestedTime}`,
                      status: 'Declined',
                      price: request.price,
                    };
                    setHistoryAppointments((prev) => [declinedAppointment, ...prev]);
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.actionButtonTextDark]}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rescheduleButton]}
                  onPress={() => {
                    setSelectedRequest(request);
                    const now = new Date();
                    setProposedDateValue(now);
                    setProposedTimeValue(now);
                    setProposedDateInput(formatDateLabel(now));
                    setProposedTimeInput(formatTimeLabel(now));
                    setRescheduleNote('');
                    setRescheduleModalVisible(true);
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.actionButtonTextDark]}>
                    Suggest new time
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.section}>
      <View style={styles.availabilitySegment}>
        <TouchableOpacity
          style={[
            styles.availabilitySegmentButton,
            availabilityMode === 'weekly' && styles.availabilitySegmentActive,
          ]}
          onPress={() => setAvailabilityMode('weekly')}
        >
          <Text
            style={[
              styles.availabilitySegmentText,
              availabilityMode === 'weekly' && styles.availabilitySegmentTextActive,
            ]}
          >
            Weekly hours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.availabilitySegmentButton,
            availabilityMode === 'overrides' && styles.availabilitySegmentActive,
          ]}
          onPress={() => setAvailabilityMode('overrides')}
        >
          <Text
            style={[
              styles.availabilitySegmentText,
              availabilityMode === 'overrides' && styles.availabilitySegmentTextActive,
            ]}
          >
            Date overrides
          </Text>
        </TouchableOpacity>
      </View>

      {availabilityMode === 'weekly' ? (
        <>
          <Text style={styles.availabilityIntro}>
            Set a default weekly schedule. Overrides can be added for specific dates.
          </Text>

          {weeklySaved ? (
            <View style={styles.availabilitySavedBanner}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={18}
                color={colors.success}
              />
              <Text style={styles.availabilitySavedText}>Weekly availability saved</Text>
            </View>
          ) : null}

          {DAYS.map((day) => {
            const dayAvailability = weeklyAvailability[day.key];
            return (
              <View key={day.key} style={styles.availabilityDayCard}>
                <View style={styles.availabilityDayHeader}>
                  <Text style={styles.availabilityDayLabel}>{day.label}</Text>
                  <View style={styles.availabilityToggleRow}>
                    <Text
                      style={[
                        styles.availabilityStatusText,
                        dayAvailability.open
                          ? styles.availabilityStatusOn
                          : styles.availabilityStatusOff,
                      ]}
                    >
                      {dayAvailability.open ? 'Open' : 'Closed'}
                    </Text>
                    <Switch
                      value={dayAvailability.open}
                      onValueChange={() => toggleWeeklyDay(day.key)}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={dayAvailability.open ? colors.primary : colors.textSecondary}
                    />
                  </View>
                </View>

                {dayAvailability.open ? (
                  <View style={styles.weeklyBlock}>
                    <Text style={styles.weeklyBlockLabel}>Hours</Text>
                    <View style={styles.weeklyTimeRow}>
                      {Platform.OS === 'web' ? (
                        <>
                          <TextInput
                            style={styles.timeBlockInput}
                            value={dayAvailability.startInput}
                            maxLength={5}
                            onChangeText={(value) =>
                              updateWeeklyTimeInput(day.key, 'start', value)
                            }
                          />
                          <Text style={styles.timeBlockDash}>-</Text>
                          <TextInput
                            style={styles.timeBlockInput}
                            value={dayAvailability.endInput}
                            maxLength={5}
                            onChangeText={(value) =>
                              updateWeeklyTimeInput(day.key, 'end', value)
                            }
                          />
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.timeBlockPill}
                            onPress={() =>
                              setAvailabilityPicker({
                                scope: 'weekly',
                                dayKey: day.key,
                                field: 'start',
                              })
                            }
                          >
                            <Text style={styles.timeBlockText}>
                              {formatTimeLabel(dayAvailability.start)}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.timeBlockDash}>-</Text>
                          <TouchableOpacity
                            style={styles.timeBlockPill}
                            onPress={() =>
                              setAvailabilityPicker({
                                scope: 'weekly',
                                dayKey: day.key,
                                field: 'end',
                              })
                            }
                          >
                            <Text style={styles.timeBlockText}>
                              {formatTimeLabel(dayAvailability.end)}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>

                    {dayAvailability.breakEnabled ? (
                      <View style={styles.weeklyBreakRow}>
                        <Text style={styles.weeklyBlockLabel}>Break</Text>
                        <View style={styles.weeklyTimeRow}>
                          {Platform.OS === 'web' ? (
                            <>
                              <TextInput
                                style={styles.timeBlockInput}
                                value={dayAvailability.breakStartInput}
                                maxLength={5}
                                onChangeText={(value) =>
                                  updateWeeklyTimeInput(day.key, 'breakStart', value)
                                }
                              />
                              <Text style={styles.timeBlockDash}>-</Text>
                              <TextInput
                                style={styles.timeBlockInput}
                                value={dayAvailability.breakEndInput}
                                maxLength={5}
                                onChangeText={(value) =>
                                  updateWeeklyTimeInput(day.key, 'breakEnd', value)
                                }
                              />
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={styles.timeBlockPill}
                                onPress={() =>
                                  setAvailabilityPicker({
                                    scope: 'weekly',
                                    dayKey: day.key,
                                    field: 'breakStart',
                                  })
                                }
                              >
                                <Text style={styles.timeBlockText}>
                                  {formatTimeLabel(dayAvailability.breakStart)}
                                </Text>
                              </TouchableOpacity>
                              <Text style={styles.timeBlockDash}>-</Text>
                              <TouchableOpacity
                                style={styles.timeBlockPill}
                                onPress={() =>
                                  setAvailabilityPicker({
                                    scope: 'weekly',
                                    dayKey: day.key,
                                    field: 'breakEnd',
                                  })
                                }
                              >
                                <Text style={styles.timeBlockText}>
                                  {formatTimeLabel(dayAvailability.breakEnd)}
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                          <TouchableOpacity
                            style={styles.removeBlockButton}
                            onPress={() =>
                              updateWeeklyDay(day.key, (current) => ({
                                ...current,
                                breakEnabled: false,
                              }))
                            }
                          >
                            <IconSymbol
                              ios_icon_name="xmark"
                              android_material_icon_name="close"
                              size={16}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBlockButton}
                        onPress={() =>
                          updateWeeklyDay(day.key, (current) => ({
                            ...current,
                            breakEnabled: true,
                          }))
                        }
                      >
                        <IconSymbol
                          ios_icon_name="plus"
                          android_material_icon_name="add"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.addBlockText}>Add break</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}

          <TouchableOpacity style={styles.saveAvailabilityButton} onPress={saveWeeklyAvailability}>
            <Text style={styles.saveAvailabilityText}>Save Availability</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.availabilityIntro}>
            Tap a date to override your weekly schedule. Overrides are shown with dots.
          </Text>

          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => {
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                );
              }}
            >
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="chevron-left"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              style={styles.calendarNavButton}
              onPress={() => {
                setCalendarMonth(
                  new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                );
              }}
            >
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekRow}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
              <Text key={label} style={styles.calendarWeekLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((cell, index) => {
              if (!cell.date) {
                return <View key={`empty_${index}`} style={styles.calendarCellEmpty} />;
              }
              const dateKey = toDateKey(cell.date);
              const hasOverride = !!dateOverrides[dateKey];
              const isSelected = selectedOverrideDate
                ? toDateKey(selectedOverrideDate) === dateKey
                : false;

              return (
                <TouchableOpacity
                  key={dateKey}
                  style={[
                    styles.calendarCell,
                    isSelected && styles.calendarCellSelected,
                  ]}
                  onPress={() => openOverrideForDate(cell.date)}
                >
                  <Text style={styles.calendarCellText}>{cell.date.getDate()}</Text>
                  {hasOverride ? <View style={styles.calendarDot} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {overrideSaved ? (
            <View style={styles.availabilitySavedBanner}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={18}
                color={colors.success}
              />
              <Text style={styles.availabilitySavedText}>Override saved</Text>
            </View>
          ) : null}

          <View style={styles.overrideList}>
            {Object.keys(dateOverrides).length === 0 ? (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>No overrides yet</Text>
                <Text style={styles.placeholderText}>
                  Add an override to customize availability for specific dates.
                </Text>
              </View>
            ) : (
              Object.entries(dateOverrides)
                .map(([dateKey, override]) => ({
                  dateKey,
                  date: new Date(`${dateKey}T00:00:00`),
                  override,
                }))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map(({ dateKey, date, override }) => (
                  <View key={dateKey} style={styles.overrideListCard}>
                    <View style={styles.overrideListRow}>
                      <Text style={styles.overrideListDate}>
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                      <Text
                        style={[
                          styles.overrideListStatus,
                          override.unavailable && styles.overrideListStatusMuted,
                        ]}
                      >
                        {override.unavailable ? 'Unavailable' : 'Custom hours'}
                      </Text>
                    </View>
                    {!override.unavailable ? (
                      <Text style={styles.overrideListRange}>
                        {formatTimeLabel(override.start)} - {formatTimeLabel(override.end)}
                      </Text>
                    ) : (
                      <Text style={styles.overrideListRangeMuted}>No hours set</Text>
                    )}
                  </View>
                ))
            )}
          </View>
        </>
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyFilterRow}
      >
        {REVIEW_FILTERS.map((filter) => {
          const isActive = filter === reviewFilter;
          const label = filter === 'All' ? 'All' : `${filter}★`;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.historyFilterPill, isActive && styles.historyFilterPillActive]}
              onPress={() => setReviewFilter(filter)}
            >
              <Text style={[styles.historyFilterText, isActive && styles.historyFilterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredReviews.length === 0 ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No reviews yet</Text>
          <Text style={styles.placeholderText}>
            Completed appointments will show client feedback here.
          </Text>
        </View>
      ) : (
        filteredReviews.map((review) => {
          const replyDraft = reviewReplyDrafts[review.id] ?? '';
          const replyOpen = reviewReplyOpen[review.id];
          const replySaved = reviewReplies[review.id];

          return (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeaderRow}>
                <View>
                  <Text style={styles.reviewClient}>{review.client}</Text>
                  <Text style={styles.reviewService}>{review.service}</Text>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>

              <View style={styles.reviewRatingRow}>
                <View style={styles.reviewStarsRow}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MaterialIcons
                      key={`${review.id}_star_${index}`}
                      name={index < review.rating ? 'star' : 'star-border'}
                      size={14}
                      color={index < review.rating ? colors.primary : colors.border}
                    />
                  ))}
                </View>
                <Text style={styles.reviewRatingValue}>{review.rating}.0</Text>
              </View>

              {review.feedback ? (
                <Text style={styles.reviewFeedback}>{review.feedback}</Text>
              ) : (
                <Text style={styles.reviewFeedbackMuted}>No written feedback provided.</Text>
              )}

              {replySaved ? (
                <View style={styles.reviewReplyBox}>
                  <Text style={styles.reviewReplyLabel}>Your reply</Text>
                  <Text style={styles.reviewReplyText}>{replySaved}</Text>
                </View>
              ) : null}

              {replyOpen && !replySaved ? (
                <View style={styles.reviewReplyEditor}>
                  <TextInput
                    style={styles.reviewReplyInput}
                    placeholder="Write a quick reply..."
                    placeholderTextColor={colors.textSecondary}
                    value={replyDraft}
                    onChangeText={(value) =>
                      setReviewReplyDrafts((prev) => ({ ...prev, [review.id]: value }))
                    }
                    multiline
                  />
                  <View style={styles.reviewReplyActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() =>
                        setReviewReplyOpen((prev) => ({ ...prev, [review.id]: false }))
                      }
                    >
                      <Text style={[styles.actionButtonText, styles.actionButtonTextDark]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => {
                        if (!replyDraft.trim()) return;
                        setReviewReplies((prev) => ({ ...prev, [review.id]: replyDraft.trim() }));
                        setReviewReplyOpen((prev) => ({ ...prev, [review.id]: false }));
                      }}
                    >
                      <Text style={styles.actionButtonText}>Send reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {!replyOpen && !replySaved ? (
                <TouchableOpacity
                  style={styles.reviewReplyButton}
                  onPress={() =>
                    setReviewReplyOpen((prev) => ({ ...prev, [review.id]: true }))
                  }
                >
                  <Text style={styles.reviewReplyButtonText}>Reply</Text>
                  <IconSymbol
                    ios_icon_name="paperplane"
                    android_material_icon_name="send"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );

  const renderHistory = () => (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.historyFilterRow}
      >
        {HISTORY_FILTERS.map((filter) => {
          const isActive = filter === historyFilter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.historyFilterPill, isActive && styles.historyFilterPillActive]}
              onPress={() => setHistoryFilter(filter)}
            >
              <Text style={[styles.historyFilterText, isActive && styles.historyFilterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredHistoryAppointments.length === 0 ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No appointments yet</Text>
          <Text style={styles.placeholderText}>
            Upcoming, completed, cancelled, or declined bookings will show up here.
          </Text>
        </View>
      ) : (
        filteredHistoryAppointments.map((appointment) => {
          const displayStatus = getHistoryDisplayStatus(appointment.status);
          const theme = getHistoryStatusTheme(displayStatus);
          return (
            <TouchableOpacity
              key={appointment.id}
              style={styles.historyCard}
              activeOpacity={0.85}
              onPress={() => {
                router.push({
                  pathname: '/appointment-details',
                  params: {
                    id: appointment.id,
                    client: appointment.client,
                    service: appointment.service,
                    time: appointment.time,
                    status: appointment.status,
                    price: appointment.price ?? '',
                  },
                });
              }}
            >
              <View style={styles.historyCardInfo}>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                <Text style={styles.appointmentClient}>{appointment.client}</Text>
                <Text style={styles.appointmentService}>{appointment.service}</Text>
              </View>
              <View style={styles.historyCardRight}>
                <View style={[styles.historyStatusPill, { backgroundColor: theme.backgroundColor }]}>
                  <Text style={[styles.historyStatusText, { color: theme.color }]}>
                    {displayStatus}
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderDisputes = () => (
    <View style={styles.section}>
      {disputes.length === 0 ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No active disputes</Text>
          <Text style={styles.placeholderText}>
            If a client dispute is opened, it will be tracked here with updates.
          </Text>
        </View>
      ) : (
        disputes.map((dispute) => {
          const theme = getDisputeTheme(dispute.status);
          return (
            <TouchableOpacity
              key={dispute.id}
              style={styles.disputeCard}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedDispute(dispute);
                setDisputeModalVisible(true);
              }}
            >
              <View style={styles.disputeHeader}>
                <View>
                  <Text style={styles.disputeClient}>{dispute.client}</Text>
                  <Text style={styles.disputeReference}>
                    {dispute.service} • {dispute.date}
                  </Text>
                </View>
                <View style={[styles.disputeStatusPill, { backgroundColor: theme.backgroundColor }]}>
                  <Text style={[styles.disputeStatusText, { color: theme.color }]}>
                    {dispute.status}
                  </Text>
                </View>
              </View>
              <View style={styles.disputeFooter}>
                <Text style={styles.disputeReason}>{dispute.reason}</Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverview();
      case 'Requests':
        return renderRequests();
      case 'Availability':
        return renderAvailability();
      case 'Reviews':
        return renderReviews();
      case 'History':
        return renderHistory();
      case 'My Disputes':
        return renderDisputes();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bookings</Text>
        </View>

        <View style={styles.tabsWrapper}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  onLayout={(event) => {
                    tabLayouts.current[tab] = {
                      x: event.nativeEvent.layout.x,
                      width: event.nativeEvent.layout.width,
                    };
                  }}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {renderActiveTab()}
      </ScrollView>
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeRescheduleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suggest New Time</Text>
            <Text style={styles.modalSubtitle}>
              Propose a new date and time for {selectedRequest?.client}.
            </Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>New date</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Feb 18"
                  placeholderTextColor={colors.textSecondary}
                  value={proposedDateInput}
                  onChangeText={setProposedDateInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.modalPickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.modalPickerText}>{formatDateLabel(proposedDateValue)}</Text>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar-today"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>New time</Text>
              {Platform.OS === 'web' ? (
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 3:30 PM"
                  placeholderTextColor={colors.textSecondary}
                  value={proposedTimeInput}
                  onChangeText={setProposedTimeInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.modalPickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.modalPickerText}>{formatTimeLabel(proposedTimeValue)}</Text>
                  <IconSymbol
                    ios_icon_name="clock"
                    android_material_icon_name="schedule"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Message (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                placeholder="Add a short note to the client"
                placeholderTextColor={colors.textSecondary}
                value={rescheduleNote}
                onChangeText={setRescheduleNote}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeRescheduleModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  if (!selectedRequest) return;
                  const resolvedDate = Platform.OS === 'web'
                    ? proposedDateInput || formatDateLabel(proposedDateValue)
                    : formatDateLabel(proposedDateValue);
                  const resolvedTime = Platform.OS === 'web'
                    ? proposedTimeInput || formatTimeLabel(proposedTimeValue)
                    : formatTimeLabel(proposedTimeValue);
                  setRequests((prev) =>
                    prev.map((item) =>
                      item.id === selectedRequest.id
                        ? {
                            ...item,
                            status: 'Pending Change',
                            proposedDate: resolvedDate || item.requestedDate,
                            proposedTime: resolvedTime || item.requestedTime,
                          }
                        : item
                    )
                  );
                  closeRescheduleModal();
                }}
              >
                <Text style={styles.modalConfirmText}>Send Proposal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={overrideModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeOverrideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.overrideSheet}>
            <Text style={styles.modalTitle}>
              {selectedOverrideDate
                ? `Override • ${selectedOverrideDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`
                : 'Date Override'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Customize availability for this date.
            </Text>

            <View style={styles.overrideToggleRow}>
              <Text style={styles.overrideToggleLabel}>Unavailable</Text>
              <Switch
                value={overrideDraft?.unavailable ?? false}
                onValueChange={(value) =>
                  updateOverrideDraft((current) => ({
                    ...current,
                    unavailable: value,
                  }))
                }
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={overrideDraft?.unavailable ? colors.primary : colors.textSecondary}
              />
            </View>

            {!overrideDraft?.unavailable ? (
              <>
                <View style={styles.weeklyBlock}>
                  <Text style={styles.weeklyBlockLabel}>Hours</Text>
                  <View style={styles.weeklyTimeRow}>
                    {Platform.OS === 'web' ? (
                      <>
                        <TextInput
                          style={styles.timeBlockInput}
                          value={overrideDraft?.startInput || ''}
                          maxLength={5}
                          onChangeText={(value) => updateOverrideTimeInput('start', value)}
                        />
                        <Text style={styles.timeBlockDash}>-</Text>
                        <TextInput
                          style={styles.timeBlockInput}
                          value={overrideDraft?.endInput || ''}
                          maxLength={5}
                          onChangeText={(value) => updateOverrideTimeInput('end', value)}
                        />
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.timeBlockPill}
                          onPress={() =>
                            setAvailabilityPicker({
                              scope: 'override',
                              dateKey: selectedOverrideDate ? toDateKey(selectedOverrideDate) : undefined,
                              field: 'start',
                            })
                          }
                        >
                          <Text style={styles.timeBlockText}>
                            {overrideDraft ? formatTimeLabel(overrideDraft.start) : '--'}
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.timeBlockDash}>-</Text>
                        <TouchableOpacity
                          style={styles.timeBlockPill}
                          onPress={() =>
                            setAvailabilityPicker({
                              scope: 'override',
                              dateKey: selectedOverrideDate ? toDateKey(selectedOverrideDate) : undefined,
                              field: 'end',
                            })
                          }
                        >
                          <Text style={styles.timeBlockText}>
                            {overrideDraft ? formatTimeLabel(overrideDraft.end) : '--'}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>

                {overrideDraft?.breakEnabled ? (
                  <View style={styles.weeklyBreakRow}>
                    <Text style={styles.weeklyBlockLabel}>Break</Text>
                    <View style={styles.weeklyTimeRow}>
                      {Platform.OS === 'web' ? (
                        <>
                          <TextInput
                            style={styles.timeBlockInput}
                            value={overrideDraft?.breakStartInput || ''}
                            maxLength={5}
                            onChangeText={(value) => updateOverrideTimeInput('breakStart', value)}
                          />
                          <Text style={styles.timeBlockDash}>-</Text>
                          <TextInput
                            style={styles.timeBlockInput}
                            value={overrideDraft?.breakEndInput || ''}
                            maxLength={5}
                            onChangeText={(value) => updateOverrideTimeInput('breakEnd', value)}
                          />
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={styles.timeBlockPill}
                            onPress={() =>
                              setAvailabilityPicker({
                                scope: 'override',
                                dateKey: selectedOverrideDate ? toDateKey(selectedOverrideDate) : undefined,
                                field: 'breakStart',
                              })
                            }
                          >
                            <Text style={styles.timeBlockText}>
                              {overrideDraft ? formatTimeLabel(overrideDraft.breakStart) : '--'}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.timeBlockDash}>-</Text>
                          <TouchableOpacity
                            style={styles.timeBlockPill}
                            onPress={() =>
                              setAvailabilityPicker({
                                scope: 'override',
                                dateKey: selectedOverrideDate ? toDateKey(selectedOverrideDate) : undefined,
                                field: 'breakEnd',
                              })
                            }
                          >
                            <Text style={styles.timeBlockText}>
                              {overrideDraft ? formatTimeLabel(overrideDraft.breakEnd) : '--'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        style={styles.removeBlockButton}
                        onPress={() =>
                          updateOverrideDraft((current) => ({
                            ...current,
                            breakEnabled: false,
                          }))
                        }
                      >
                        <IconSymbol
                          ios_icon_name="xmark"
                          android_material_icon_name="close"
                          size={16}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBlockButton}
                    onPress={() =>
                      updateOverrideDraft((current) => ({
                        ...current,
                        breakEnabled: true,
                      }))
                    }
                  >
                    <IconSymbol
                      ios_icon_name="plus"
                      android_material_icon_name="add"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.addBlockText}>Add break</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}

            <View style={styles.overrideActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeOverrideModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              {selectedOverrideDate && dateOverrides[toDateKey(selectedOverrideDate)] ? (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={removeDateOverride}
                >
                  <Text style={styles.modalCancelText}>Remove Override</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={saveDateOverride}
              >
                <Text style={styles.modalConfirmText}>Save Override</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showDatePicker && Platform.OS !== 'web' ? (
        <View style={styles.pickerOverlay}>
          <DateTimePicker
            value={proposedDateValue}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setProposedDateValue(selectedDate);
              }
            }}
          />
        </View>
      ) : null}
      {showTimePicker && Platform.OS !== 'web' ? (
        <View style={styles.pickerOverlay}>
          <DateTimePicker
            value={proposedTimeValue}
            mode="time"
            display="default"
            onChange={(_, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                setProposedTimeValue(selectedDate);
              }
            }}
          />
        </View>
      ) : null}
      {availabilityPicker && Platform.OS !== 'web' ? (
        <View style={styles.pickerOverlay}>
          <DateTimePicker
            value={
              availabilityPicker.scope === 'weekly' && availabilityPicker.dayKey
                ? weeklyAvailability[availabilityPicker.dayKey][availabilityPicker.field === 'start' ? 'start' :
                  availabilityPicker.field === 'end' ? 'end' :
                  availabilityPicker.field === 'breakStart' ? 'breakStart' : 'breakEnd']
                : overrideDraft
                ? overrideDraft[availabilityPicker.field === 'start' ? 'start' :
                  availabilityPicker.field === 'end' ? 'end' :
                  availabilityPicker.field === 'breakStart' ? 'breakStart' : 'breakEnd']
                : new Date()
            }
            mode="time"
            display="default"
            onChange={(_, selectedDate) => {
              if (!selectedDate) {
                setAvailabilityPicker(null);
                return;
              }
              if (availabilityPicker.scope === 'weekly' && availabilityPicker.dayKey) {
                updateWeeklyDay(availabilityPicker.dayKey, (current) => {
                  if (availabilityPicker.field === 'start') {
                    return {
                      ...current,
                      start: selectedDate,
                      startInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  if (availabilityPicker.field === 'end') {
                    return {
                      ...current,
                      end: selectedDate,
                      endInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  if (availabilityPicker.field === 'breakStart') {
                    return {
                      ...current,
                      breakStart: selectedDate,
                      breakStartInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  return {
                    ...current,
                    breakEnd: selectedDate,
                    breakEndInput: formatTimeInputValue(selectedDate),
                  };
                });
              }

              if (availabilityPicker.scope === 'override' && overrideDraft) {
                updateOverrideDraft((current) => {
                  if (availabilityPicker.field === 'start') {
                    return {
                      ...current,
                      start: selectedDate,
                      startInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  if (availabilityPicker.field === 'end') {
                    return {
                      ...current,
                      end: selectedDate,
                      endInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  if (availabilityPicker.field === 'breakStart') {
                    return {
                      ...current,
                      breakStart: selectedDate,
                      breakStartInput: formatTimeInputValue(selectedDate),
                    };
                  }
                  return {
                    ...current,
                    breakEnd: selectedDate,
                    breakEndInput: formatTimeInputValue(selectedDate),
                  };
                });
              }
              setAvailabilityPicker(null);
            }}
          />
        </View>
      ) : null}
      <Modal
        visible={disputeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDisputeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.disputeSheet}>
            <Text style={styles.modalTitle}>Dispute Details</Text>
            <Text style={styles.modalSubtitle}>
              Review the dispute and respond with evidence or notes.
            </Text>

            {selectedDispute ? (
              <View style={styles.disputeDetailCard}>
                <View style={styles.disputeHeader}>
                  <View>
                    <Text style={styles.disputeClient}>{selectedDispute.client}</Text>
                    <Text style={styles.disputeReference}>
                      {selectedDispute.service} • {selectedDispute.date}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.disputeStatusPill,
                      { backgroundColor: getDisputeTheme(selectedDispute.status).backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.disputeStatusText,
                        { color: getDisputeTheme(selectedDispute.status).color },
                      ]}
                    >
                      {selectedDispute.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.disputeReason}>Reason: {selectedDispute.reason}</Text>
                {selectedDispute.amount ? (
                  <Text style={styles.disputeAmount}>Amount: {selectedDispute.amount}</Text>
                ) : null}
              </View>
            ) : null}

            {disputeActionNote ? (
              <View style={styles.availabilitySavedBanner}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={18}
                  color={colors.success}
                />
                <Text style={styles.availabilitySavedText}>{disputeActionNote}</Text>
              </View>
            ) : null}

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Message to support</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                placeholder="Add details or context..."
                placeholderTextColor={colors.textSecondary}
                value={disputeMessage}
                onChangeText={setDisputeMessage}
                multiline
              />
            </View>

            <View style={styles.disputeActionRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setDisputeActionNote('Evidence upload queued (mock)');
                  setTimeout(() => setDisputeActionNote(null), 2000);
                }}
              >
                <Text style={styles.modalCancelText}>Upload evidence</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  if (!disputeMessage.trim()) return;
                  setDisputeActionNote('Message sent to support (mock)');
                  setDisputeMessage('');
                  setTimeout(() => setDisputeActionNote(null), 2000);
                }}
              >
                <Text style={styles.modalConfirmText}>Send message</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.overrideActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeDisputeModal}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingBottom: 120,
    paddingTop: 12,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  summaryRow: {
    gap: 12,
    paddingVertical: 4,
  },
  overviewDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 16,
    marginBottom: 12,
  },
  summaryCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  summaryTitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  summaryCaption: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsRow: {
    gap: 10,
    paddingVertical: 4,
  },
  historyFilterRow: {
    gap: 10,
    paddingVertical: 12,
  },
  historyFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyFilterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  historyFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  historyFilterTextActive: {
    color: colors.card,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.card,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appointmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  appointmentService: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  appointmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  appointmentTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  placeholderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholderText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.card,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyCardInfo: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  historyCardRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  historyStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  availabilityIntro: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  availabilitySegment: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  availabilitySegmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  availabilitySegmentActive: {
    backgroundColor: colors.primary,
  },
  availabilitySegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  availabilitySegmentTextActive: {
    color: colors.card,
  },
  availabilitySavedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  availabilitySavedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  availabilityDayCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  availabilityDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityDayLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  availabilityToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  availabilityStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityStatusOn: {
    color: colors.primary,
  },
  availabilityStatusOff: {
    color: colors.textSecondary,
  },
  weeklyBlock: {
    marginTop: 12,
    gap: 10,
  },
  weeklyBreakRow: {
    gap: 8,
  },
  weeklyBlockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weeklyTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBlockDash: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timeBlockInput: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
  },
  timeBlockPill: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  timeBlockText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  removeBlockButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  addBlockText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  saveAvailabilityButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveAvailabilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarCell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCellEmpty: {
    width: '13%',
    aspectRatio: 1,
  },
  calendarCellSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  calendarCellText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  overrideList: {
    marginTop: 16,
    gap: 12,
  },
  overrideListCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overrideListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  overrideListDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  overrideListStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  overrideListStatusMuted: {
    color: colors.textSecondary,
  },
  overrideListRange: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  overrideListRangeMuted: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overrideSheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  overrideToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  overrideToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  overrideActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  requestService: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  requestStatusPill: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  requestStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  requestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  requestDetail: {
    minWidth: '30%',
  },
  requestDetailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  requestDetailValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  proposedRow: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  proposedLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  proposedValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  requestActions: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButton: {
    backgroundColor: '#FBE9E7',
  },
  rescheduleButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  actionButtonTextDark: {
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalField: {
    marginTop: 14,
  },
  modalPickerButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalPickerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  modalInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  modalInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCancelButton: {
    backgroundColor: colors.background,
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.card,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reviewService: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  reviewRatingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewRatingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  reviewFeedback: {
    marginTop: 10,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  reviewFeedbackMuted: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  reviewReplyButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewReplyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  reviewReplyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewReplyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  reviewReplyText: {
    marginTop: 6,
    fontSize: 13,
    color: colors.text,
  },
  reviewReplyEditor: {
    marginTop: 12,
  },
  reviewReplyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: 'top',
  },
  reviewReplyActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  disputeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  disputeClient: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  disputeReference: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  disputeStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  disputeStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  disputeFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disputeReason: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  disputeSheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  disputeDetailCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  disputeAmount: {
    marginTop: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  disputeActionRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
