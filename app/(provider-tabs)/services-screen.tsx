import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

const PROVIDER_PLAN = 'Free';
const FREE_CATEGORY_LIMIT = 2;

type CategoryDefinition = {
  id: string;
  name: string;
  services: string[];
};

type ServiceVariation = {
  id: string;
  name: string;
  extraPrice: number;
};

type ServiceRecord = {
  id: string;
  categoryId: string;
  serviceName: string;
  basePrice: number;
  durationMinutes: number;
  sizes: ServiceVariation[];
  addOns: ServiceVariation[];
  imageLabel: string | null;
};

type DraftService = {
  id?: string;
  categoryId: string | null;
  serviceName: string | null;
  basePriceInput: string;
  durationMinutesInput: string;
  sizes: ServiceVariation[];
  addOns: ServiceVariation[];
  imageLabel: string | null;
};

type PickerType = 'category' | 'service' | 'size' | 'addon';

type PickerOption = {
  value: string;
  label: string;
  disabled?: boolean;
  helper?: string;
};

type VariationEditor = {
  kind: 'size' | 'addon';
  mode: 'add' | 'edit';
  id?: string;
  selectedName: string | null;
  priceInput: string;
};

const EWAJI_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'braids',
    name: 'Braids',
    services: [
      'Box Braids (Small / Medium / Large)',
      'Knotless Braids (Small / Medium / Large)',
      'Boho Knotless Braids',
      'Feed-in Braids',
      'Cornrows (Straight back / Designer / Zigzag / Freestyle)',
      'Lemonade Braids',
      'Fulani Braids',
      'Tribal Braids',
      'Stitch Braids',
      'Micro Braids',
      'Goddess Braids',
      'Crochet Braids',
      'Braided Ponytail',
      'Braided Updo',
    ],
  },
  {
    id: 'locs',
    name: 'Locs',
    services: [
      'Starter Locs (Coils / Two-Strand Twists / Interlocks)',
      'Instant Locs',
      'Loc Retwist',
      'Loc Styling (Updo, Buns, etc.)',
      'Loc Repair',
      'Faux Locs',
      'Butterfly Locs',
      'Soft Locs',
      'Wicks',
    ],
  },
  {
    id: 'barber',
    name: 'Barber',
    services: [
      'Haircut (Fade / Taper / Bald / Scissor cut)',
      'Beard Trim & Shape-up',
      'Hairline Shape-up / Edge-up',
      'Full Grooming Package (Cut + Beard + Facial)',
      'Kids Cut',
      'Razor Shave',
      'Hair Art / Design',
      'Color Enhancement',
    ],
  },
  {
    id: 'wigs',
    name: 'Wigs',
    services: [
      'Wig Install (Frontal / Closure / 360)',
      'Glueless Wig Install',
      'Wig Customization (Plucking, Bleaching Knots)',
      'Wig Revamp (Wash, Style, Repair)',
      'Wig Coloring',
      'Wig Styling (Curls, Straight, Waves)',
    ],
  },
  {
    id: 'nails',
    name: 'Nails',
    services: [
      'Manicure (Classic / Gel / Acrylic Overlay)',
      'Acrylic Full Set (Square / Coffin / Stiletto / Almond)',
      'Gel-X Extensions',
      'Dip Powder Nails',
      'Nail Art (Basic / Advanced / Custom)',
      'Pedicure (Classic / Spa / Gel)',
      'Fill-ins',
      'Nail Repair',
      'Removal Service',
    ],
  },
  {
    id: 'lashes',
    name: 'Lashes',
    services: [
      'Classic Lash Extensions',
      'Hybrid Lash Extensions',
      'Volume Lash Extensions',
      'Mega Volume Lashes',
      'Lash Lift & Tint',
      'Lash Refill',
      'Lash Removal',
    ],
  },
];

const PREDEFINED_SIZES = [
  'Extra-Small',
  'Small',
  'Smedium',
  'Medium',
  'Large',
  'Extra-Large',
] as const;

const PREDEFINED_ADDONS = [
  'Hair Wash',
  'Boho Hair',
  'Curls',
  'Scalp Treatment',
  'Extension Removal',
] as const;

const makeId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const money = (value: number) => `$${value.toFixed(2)}`;

const formatDuration = (minutes: number) => {
  return `${minutes} min`;
};

const parsePriceInput = (value: string): number | null => {
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(value)) return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) return null;
  return numeric;
};

const isDurationMinutesValid = (value: string) => {
  if (!/^\d{1,4}$/.test(value)) return false;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 && numeric <= 1440;
};

const defaultDraft = (): DraftService => ({
  categoryId: null,
  serviceName: null,
  basePriceInput: '',
  durationMinutesInput: '',
  sizes: [],
  addOns: [],
  imageLabel: null,
});

const seedServices: ServiceRecord[] = [
  {
    id: makeId(),
    categoryId: 'braids',
    serviceName: 'Boho Knotless Braids',
    basePrice: 210,
    durationMinutes: 240,
    sizes: [
      { id: makeId(), name: 'Small', extraPrice: 40 },
      { id: makeId(), name: 'Medium', extraPrice: 60 },
    ],
    addOns: [{ id: makeId(), name: 'Boho Hair', extraPrice: 30 }],
    imageLabel: null,
  },
  {
    id: makeId(),
    categoryId: 'nails',
    serviceName: 'Gel-X Extensions',
    basePrice: 95,
    durationMinutes: 90,
    sizes: [],
    addOns: [{ id: makeId(), name: 'Nail Art (Basic / Advanced / Custom)', extraPrice: 20 }],
    imageLabel: null,
  },
];

function SelectionField({
  label,
  value,
  placeholder,
  onPress,
  disabled,
}: {
  label: string;
  value?: string | null;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectionButton, disabled && styles.selectionButtonDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={value ? styles.selectionValue : styles.selectionPlaceholder}>
          {value ?? placeholder}
        </Text>
        <IconSymbol
          ios_icon_name="chevron.down"
          android_material_icon_name="keyboard-arrow-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function ProviderServicesScreen() {
  const [services, setServices] = useState<ServiceRecord[]>(seedServices);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [draft, setDraft] = useState<DraftService>(defaultDraft());
  const [formError, setFormError] = useState<string | null>(null);

  const [pickerType, setPickerType] = useState<PickerType | null>(null);
  const [variationEditor, setVariationEditor] = useState<VariationEditor | null>(null);
  const [serviceMenuId, setServiceMenuId] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => EWAJI_CATEGORIES.find((category) => category.id === draft.categoryId) ?? null,
    [draft.categoryId]
  );

  const activeCategoryIds = useMemo(
    () => new Set(services.map((service) => service.categoryId)),
    [services]
  );

  const categoryLimitReached =
    PROVIDER_PLAN === 'Free' && activeCategoryIds.size >= FREE_CATEGORY_LIMIT;

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceMenuId) ?? null,
    [serviceMenuId, services]
  );

  const duplicateService = useMemo(() => {
    if (!draft.categoryId || !draft.serviceName) return false;

    return services.some(
      (service) =>
        service.id !== draft.id &&
        service.categoryId === draft.categoryId &&
        service.serviceName === draft.serviceName
    );
  }, [draft.categoryId, draft.id, draft.serviceName, services]);

  const pickerTitle = useMemo(() => {
    if (pickerType === 'category') return 'Select Category';
    if (pickerType === 'service') return 'Select Service';
    if (pickerType === 'size') return 'Select Size';
    if (pickerType === 'addon') return 'Select Add-on';
    return '';
  }, [pickerType]);

  const pickerOptions = useMemo<PickerOption[]>(() => {
    if (pickerType === 'category') {
      return EWAJI_CATEGORIES.map((category) => {
        const locked = !activeCategoryIds.has(category.id) && categoryLimitReached;
        return {
          value: category.id,
          label: category.name,
          disabled: locked,
          helper: locked ? 'Free plan limit reached (2 categories).' : undefined,
        };
      });
    }

    if (pickerType === 'service') {
      if (!selectedCategory) return [];
      return selectedCategory.services.map((serviceName) => {
        const isDuplicate = services.some(
          (service) =>
            service.id !== draft.id &&
            service.categoryId === selectedCategory.id &&
            service.serviceName === serviceName
        );

        return {
          value: serviceName,
          label: serviceName,
          disabled: isDuplicate,
          helper: isDuplicate ? 'Already active' : undefined,
        };
      });
    }

    if (pickerType === 'size') {
      return PREDEFINED_SIZES.map((size) => {
        const isUsedByOther = draft.sizes.some(
          (item) => item.name === size && item.id !== variationEditor?.id
        );

        return {
          value: size,
          label: size,
          disabled: isUsedByOther,
          helper: isUsedByOther ? 'Already added' : undefined,
        };
      });
    }

    if (pickerType === 'addon') {
      return PREDEFINED_ADDONS.map((addOn) => {
        const isUsedByOther = draft.addOns.some(
          (item) => item.name === addOn && item.id !== variationEditor?.id
        );

        return {
          value: addOn,
          label: addOn,
          disabled: isUsedByOther,
          helper: isUsedByOther ? 'Already added' : undefined,
        };
      });
    }

    return [];
  }, [
    activeCategoryIds,
    categoryLimitReached,
    draft.addOns,
    draft.id,
    draft.sizes,
    pickerType,
    selectedCategory,
    services,
    variationEditor?.id,
  ]);

  const currentPickerValue = useMemo(() => {
    if (pickerType === 'category') return draft.categoryId;
    if (pickerType === 'service') return draft.serviceName;
    if (pickerType === 'size' || pickerType === 'addon') return variationEditor?.selectedName ?? null;
    return null;
  }, [draft.categoryId, draft.serviceName, pickerType, variationEditor?.selectedName]);

  const activeSections = useMemo(
    () =>
      EWAJI_CATEGORIES.map((category) => {
        const entries = services.filter((service) => service.categoryId === category.id);

        return {
          category,
          entries,
        };
      }).filter((section) => section.entries.length > 0),
    [services]
  );

  const lockedCategoryCount = useMemo(() => {
    if (!categoryLimitReached) return 0;
    return Math.max(EWAJI_CATEGORIES.length - activeCategoryIds.size, 0);
  }, [activeCategoryIds.size, categoryLimitReached]);

  const notify = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 1800);
  };

  const openAddForm = (prefillCategoryId?: string) => {
    if (prefillCategoryId) {
      const locked = !activeCategoryIds.has(prefillCategoryId) && categoryLimitReached;
      if (locked) {
        notify('Free plan allows only 2 active categories.');
        return;
      }
    }

    setFormMode('add');
    setDraft({
      ...defaultDraft(),
      categoryId: prefillCategoryId ?? null,
    });
    setFormError(null);
    setPickerType(null);
    setVariationEditor(null);
    setFormOpen(true);
  };

  const openEditForm = (service: ServiceRecord) => {
    setFormMode('edit');
    setDraft({
      id: service.id,
      categoryId: service.categoryId,
      serviceName: service.serviceName,
      basePriceInput: service.basePrice.toFixed(2),
      durationMinutesInput: String(service.durationMinutes),
      sizes: service.sizes.map((item) => ({ ...item })),
      addOns: service.addOns.map((item) => ({ ...item })),
      imageLabel: service.imageLabel,
    });
    setFormError(null);
    setPickerType(null);
    setVariationEditor(null);
    setServiceMenuId(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setPickerType(null);
    setVariationEditor(null);
    setFormError(null);
  };

  const validateDraft = (): string | null => {
    if (!draft.categoryId) return 'Select a category.';
    if (!draft.serviceName) return 'Select a service.';

    const addingNewCategory = !activeCategoryIds.has(draft.categoryId);
    if (formMode === 'add' && PROVIDER_PLAN === 'Free' && addingNewCategory && categoryLimitReached) {
      return 'Free plan allows up to 2 active categories.';
    }

    if (duplicateService) {
      return 'This service is already active in the selected category.';
    }

    const parsedPrice = parsePriceInput(draft.basePriceInput);
    if (parsedPrice === null) {
      return 'Enter a valid base price.';
    }

    if (!isDurationMinutesValid(draft.durationMinutesInput)) {
      return 'Enter a valid duration in minutes (1-1440).';
    }

    return null;
  };

  const saveService = () => {
    const validationError = validateDraft();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const basePrice = parsePriceInput(draft.basePriceInput);
    if (basePrice === null) {
      setFormError('Enter a valid base price.');
      return;
    }

    const nextService: ServiceRecord = {
      id: draft.id ?? makeId(),
      categoryId: draft.categoryId ?? '',
      serviceName: draft.serviceName ?? '',
      basePrice,
      durationMinutes: Number(draft.durationMinutesInput),
      sizes: draft.sizes,
      addOns: draft.addOns,
      imageLabel: draft.imageLabel,
    };

    setServices((current) => {
      if (formMode === 'edit') {
        return current.map((service) => (service.id === nextService.id ? nextService : service));
      }
      return [...current, nextService];
    });

    closeForm();
    notify(formMode === 'edit' ? 'Service updated' : 'Service saved');
  };

  const deactivateService = (serviceId: string) => {
    setServices((current) => current.filter((service) => service.id !== serviceId));
    setServiceMenuId(null);
    notify('Service deactivated');
  };

  const handlePickerSelection = (option: PickerOption) => {
    if (option.disabled || !pickerType) return;

    if (pickerType === 'category') {
      setDraft((previous) => ({
        ...previous,
        categoryId: option.value,
        serviceName: null,
      }));
    }

    if (pickerType === 'service') {
      setDraft((previous) => ({
        ...previous,
        serviceName: option.value,
      }));
    }

    if (pickerType === 'size' || pickerType === 'addon') {
      setVariationEditor((previous) =>
        previous
          ? {
              ...previous,
              selectedName: option.value,
            }
          : previous
      );
    }

    setFormError(null);
    setPickerType(null);
  };

  const openVariationEditor = (kind: 'size' | 'addon', existing?: ServiceVariation) => {
    setVariationEditor({
      kind,
      mode: existing ? 'edit' : 'add',
      id: existing?.id,
      selectedName: existing?.name ?? null,
      priceInput: existing ? existing.extraPrice.toFixed(2) : '',
    });
    setFormError(null);
  };

  const saveVariation = () => {
    if (!variationEditor) return;

    if (!variationEditor.selectedName) {
      setFormError(`Select a ${variationEditor.kind === 'size' ? 'size' : 'add-on'}.`);
      return;
    }

    const parsedPrice = parsePriceInput(variationEditor.priceInput);
    if (parsedPrice === null) {
      setFormError('Enter a valid non-negative price.');
      return;
    }

    if (variationEditor.kind === 'size') {
      const duplicate = draft.sizes.some(
        (item) => item.id !== variationEditor.id && item.name === variationEditor.selectedName
      );
      if (duplicate) {
        setFormError('That size is already added.');
        return;
      }

      setDraft((previous) => {
        if (variationEditor.mode === 'edit' && variationEditor.id) {
          return {
            ...previous,
            sizes: previous.sizes.map((item) =>
              item.id === variationEditor.id
                ? { ...item, name: variationEditor.selectedName ?? item.name, extraPrice: parsedPrice }
                : item
            ),
          };
        }

        return {
          ...previous,
          sizes: [
            ...previous.sizes,
            {
              id: makeId(),
              name: variationEditor.selectedName ?? '',
              extraPrice: parsedPrice,
            },
          ],
        };
      });
    }

    if (variationEditor.kind === 'addon') {
      const duplicate = draft.addOns.some(
        (item) => item.id !== variationEditor.id && item.name === variationEditor.selectedName
      );
      if (duplicate) {
        setFormError('That add-on is already added.');
        return;
      }

      setDraft((previous) => {
        if (variationEditor.mode === 'edit' && variationEditor.id) {
          return {
            ...previous,
            addOns: previous.addOns.map((item) =>
              item.id === variationEditor.id
                ? { ...item, name: variationEditor.selectedName ?? item.name, extraPrice: parsedPrice }
                : item
            ),
          };
        }

        return {
          ...previous,
          addOns: [
            ...previous.addOns,
            {
              id: makeId(),
              name: variationEditor.selectedName ?? '',
              extraPrice: parsedPrice,
            },
          ],
        };
      });
    }

    setVariationEditor(null);
    setFormError(null);
  };

  const attachMockImage = () => {
    const stamp = new Date().toISOString().replace(/[.:]/g, '-');
    setDraft((previous) => ({
      ...previous,
      imageLabel: `service-${stamp}.jpg`,
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Services</Text>
            <TouchableOpacity style={styles.headerActionButton} onPress={() => openAddForm()}>
              <IconSymbol
                ios_icon_name="plus"
                android_material_icon_name="add"
                size={22}
                color={colors.card}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Manage active services by category.</Text>
        </View>

        <View style={styles.planCard}>
          <Text
            style={styles.planSummary}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Active categories ({activeCategoryIds.size}/{FREE_CATEGORY_LIMIT})
          </Text>

          <View style={styles.planPill}>
            <Text style={styles.planPillText}>{PROVIDER_PLAN} plan</Text>
          </View>
        </View>

        {toastMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.listContent}>
          {activeSections.length === 0 ? (
            <View style={styles.emptyServiceCard}>
              <Text style={styles.emptyServiceText}>No active services yet. Tap + to add one.</Text>
            </View>
          ) : null}

          {activeSections.map((section) => (
            <View key={section.category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{section.category.name}</Text>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{section.entries.length}</Text>
                </View>
              </View>

              {section.entries.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceCardHeader}>
                    <Text style={styles.serviceName}>{service.serviceName}</Text>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => setServiceMenuId(service.id)}
                    >
                      <IconSymbol
                        ios_icon_name="ellipsis"
                        android_material_icon_name="more-horiz"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.serviceMeta}>
                    {money(service.basePrice)} • {formatDuration(service.durationMinutes)}
                  </Text>

                  <View style={styles.chipRow}>
                    {service.sizes.length > 0 ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>Sizes</Text>
                      </View>
                    ) : null}

                    {service.addOns.length > 0 ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>Add-ons</Text>
                      </View>
                    ) : null}

                    {service.imageLabel ? (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>Image</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ))}

          {lockedCategoryCount > 0 ? (
            <View style={styles.lockedSummaryCard}>
              <View style={styles.lockedSummaryHeader}>
                <IconSymbol
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.lockedSummaryTitle}>Locked categories</Text>
              </View>
              <Text style={styles.lockedSummaryText}>Upgrade to unlock more.</Text>
            </View>
          ) : null}
        </ScrollView>

        {serviceMenuId ? (
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.overlayBackdrop} onPress={() => setServiceMenuId(null)} />
            <View style={styles.actionSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Service actions</Text>
                <TouchableOpacity style={styles.iconButton} onPress={() => setServiceMenuId(null)}>
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.sheetActionRow}
                onPress={() => selectedService && openEditForm(selectedService)}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.sheetActionText}>Edit service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetActionRow}
                onPress={() => selectedService && deactivateService(selectedService.id)}
              >
                <IconSymbol
                  ios_icon_name="trash"
                  android_material_icon_name="delete"
                  size={18}
                  color={colors.error}
                />
                <Text style={styles.sheetActionDanger}>Deactivate service</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>

      <Modal visible={formOpen} animationType="slide" onRequestClose={closeForm}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.iconButton} onPress={closeForm}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{formMode === 'edit' ? 'Edit Service' : 'Add Service'}</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <SelectionField
              label="Category"
              value={selectedCategory?.name ?? null}
              placeholder="Choose a category"
              onPress={() => setPickerType('category')}
            />

            <SelectionField
              label="Service"
              value={draft.serviceName}
              placeholder="Choose a service"
              onPress={() => setPickerType('service')}
              disabled={!selectedCategory}
            />

            <View style={styles.inlineInputRow}>
              <View style={styles.inlineInputCol}>
                <Text style={styles.fieldLabel}>Base price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={draft.basePriceInput}
                  keyboardType="decimal-pad"
                  placeholder="150"
                  placeholderTextColor={colors.textSecondary}
                  onChangeText={(value) => {
                    if (value === '' || /^\d{0,6}(?:\.\d{0,2})?$/.test(value)) {
                      setDraft((previous) => ({ ...previous, basePriceInput: value }));
                    }
                  }}
                />
              </View>

              <View style={styles.inlineInputCol}>
                <Text style={styles.fieldLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={draft.durationMinutesInput}
                  keyboardType="number-pad"
                  placeholder="120"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={4}
                  onChangeText={(value) => {
                    if (value === '' || /^\d{0,4}$/.test(value)) {
                      setDraft((previous) => ({ ...previous, durationMinutesInput: value }));
                    }
                  }}
                />
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Sizes & Variations</Text>
                <TouchableOpacity
                  style={styles.inlineAddButton}
                  onPress={() => openVariationEditor('size')}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.inlineAddButtonText}>Add size</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemListCard}>
                {draft.sizes.length === 0 ? (
                  <Text style={styles.emptyItemText}>No sizes added.</Text>
                ) : (
                  draft.sizes.map((size) => (
                    <View key={size.id} style={styles.itemRow}>
                      <View style={styles.itemTextWrap}>
                        <Text style={styles.itemName}>{size.name}</Text>
                        <Text style={styles.itemPrice}>+{money(size.extraPrice)}</Text>
                      </View>

                      <View style={styles.itemActionRow}>
                        <TouchableOpacity
                          style={styles.smallIconButton}
                          onPress={() => openVariationEditor('size', size)}
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallIconButton}
                          onPress={() =>
                            setDraft((previous) => ({
                              ...previous,
                              sizes: previous.sizes.filter((item) => item.id !== size.id),
                            }))
                          }
                        >
                          <IconSymbol
                            ios_icon_name="trash"
                            android_material_icon_name="delete"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Add-ons & Extras</Text>
                <TouchableOpacity
                  style={styles.inlineAddButton}
                  onPress={() => openVariationEditor('addon')}
                >
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={styles.inlineAddButtonText}>Add add-on</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemListCard}>
                {draft.addOns.length === 0 ? (
                  <Text style={styles.emptyItemText}>No add-ons added.</Text>
                ) : (
                  draft.addOns.map((addOn) => (
                    <View key={addOn.id} style={styles.itemRow}>
                      <View style={styles.itemTextWrap}>
                        <Text style={styles.itemName}>{addOn.name}</Text>
                        <Text style={styles.itemPrice}>+{money(addOn.extraPrice)}</Text>
                      </View>

                      <View style={styles.itemActionRow}>
                        <TouchableOpacity
                          style={styles.smallIconButton}
                          onPress={() => openVariationEditor('addon', addOn)}
                        >
                          <IconSymbol
                            ios_icon_name="pencil"
                            android_material_icon_name="edit"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.smallIconButton}
                          onPress={() =>
                            setDraft((previous) => ({
                              ...previous,
                              addOns: previous.addOns.filter((item) => item.id !== addOn.id),
                            }))
                          }
                        >
                          <IconSymbol
                            ios_icon_name="trash"
                            android_material_icon_name="delete"
                            size={16}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Service image (optional)</Text>
              <View style={styles.imageCard}>
                <TouchableOpacity style={styles.imageUploadButton} onPress={attachMockImage}>
                  <IconSymbol
                    ios_icon_name="photo"
                    android_material_icon_name="photo-camera"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.imageUploadText}>Upload image</Text>
                </TouchableOpacity>

                {draft.imageLabel ? (
                  <View style={styles.imageMetaRow}>
                    <Text style={styles.imageMetaText}>{draft.imageLabel}</Text>
                    <TouchableOpacity
                      style={styles.smallIconButton}
                      onPress={() =>
                        setDraft((previous) => ({
                          ...previous,
                          imageLabel: null,
                        }))
                      }
                    >
                      <IconSymbol
                        ios_icon_name="trash"
                        android_material_icon_name="delete"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.emptyItemText}>No image selected.</Text>
                )}
              </View>
            </View>

            {formError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.saveButton} onPress={saveService}>
              <Text style={styles.saveButtonText}>
                {formMode === 'edit' ? 'Save changes' : 'Save service'}
              </Text>
            </TouchableOpacity>
          </View>

          {pickerType !== null ? (
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.overlayBackdrop} onPress={() => setPickerType(null)} />

              <View style={styles.sheetContainer}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{pickerTitle}</Text>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setPickerType(null)}>
                    <IconSymbol
                      ios_icon_name="xmark"
                      android_material_icon_name="close"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.sheetList}>
                  {pickerOptions.map((option) => {
                    const selected = currentPickerValue === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.sheetOptionRow, option.disabled && styles.sheetOptionDisabled]}
                        disabled={option.disabled}
                        onPress={() => handlePickerSelection(option)}
                      >
                        <View style={styles.sheetOptionTextWrap}>
                          <Text style={[styles.sheetOptionText, option.disabled && styles.sheetOptionTextDisabled]}>
                            {option.label}
                          </Text>
                          {option.helper ? <Text style={styles.sheetOptionHelper}>{option.helper}</Text> : null}
                        </View>

                        {selected ? (
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check-circle"
                            size={18}
                            color={colors.primary}
                          />
                        ) : (
                          <IconSymbol
                            ios_icon_name="chevron.right"
                            android_material_icon_name="keyboard-arrow-right"
                            size={18}
                            color={colors.textSecondary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : null}

          {variationEditor && pickerType === null ? (
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.overlayBackdrop} onPress={() => setVariationEditor(null)} />

              <View style={styles.sheetContainer}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {variationEditor.mode === 'edit' ? 'Edit' : 'Add'}{' '}
                    {variationEditor.kind === 'size' ? 'size' : 'add-on'}
                  </Text>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setVariationEditor(null)}>
                    <IconSymbol
                      ios_icon_name="xmark"
                      android_material_icon_name="close"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.editorBody}>
                  <SelectionField
                    label={variationEditor.kind === 'size' ? 'Size' : 'Add-on'}
                    value={variationEditor.selectedName}
                    placeholder={variationEditor.kind === 'size' ? 'Select size' : 'Select add-on'}
                    onPress={() => setPickerType(variationEditor.kind === 'size' ? 'size' : 'addon')}
                  />

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Price add-on ($)</Text>
                    <TextInput
                      style={styles.input}
                      value={variationEditor.priceInput}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      onChangeText={(value) => {
                        if (value === '' || /^\d{0,6}(?:\.\d{0,2})?$/.test(value)) {
                          setVariationEditor((previous) =>
                            previous
                              ? {
                                  ...previous,
                                  priceInput: value,
                                }
                              : previous
                          );
                        }
                      }}
                    />
                  </View>

                  <View style={styles.editorActionRow}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setVariationEditor(null)}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={saveVariation}>
                      <Text style={styles.primaryButtonText}>
                        {variationEditor.mode === 'edit' ? 'Save' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    position: 'relative',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
  },
  headerActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: "space-between",
  },
  planPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  planPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  planSummary: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  toast: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 110,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 9,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  lockedSummaryCard: {
    marginTop: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  lockedSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockedSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  lockedSummaryText: {
    marginTop: 5,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyServiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
  },
  emptyServiceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  serviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 8,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    flex: 1,
    paddingRight: 8,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    color: colors.text,
  },
  menuButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  serviceMeta: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    flex: 1,
  },
  actionSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  sheetActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  sheetActionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  sheetActionDanger: {
    fontSize: 15,
    color: colors.error,
    fontWeight: '600',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: colors.text,
  },
  iconButtonPlaceholder: {
    width: 30,
    height: 30,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  fieldGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectionButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectionButtonDisabled: {
    opacity: 0.5,
  },
  selectionValue: {
    flex: 1,
    paddingRight: 8,
    fontSize: 16,
    color: colors.text,
  },
  selectionPlaceholder: {
    flex: 1,
    paddingRight: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
  inlineInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  inlineInputCol: {
    flex: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  sectionBlock: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  inlineAddButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineAddButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  itemListCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emptyItemText: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 9,
  },
  itemTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  imageCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10,
  },
  imageUploadButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  imageMetaRow: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageMetaText: {
    flex: 1,
    paddingRight: 8,
    fontSize: 12,
    color: colors.text,
  },
  errorCard: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FDECEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  saveButton: {
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 14,
  },
  sheetList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sheetOptionRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sheetOptionDisabled: {
    opacity: 0.55,
  },
  sheetOptionTextWrap: {
    flex: 1,
  },
  sheetOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  sheetOptionTextDisabled: {
    color: colors.textSecondary,
  },
  sheetOptionHelper: {
    marginTop: 2,
    fontSize: 11,
    color: colors.textSecondary,
  },
  editorBody: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  editorActionRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 4,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
});
