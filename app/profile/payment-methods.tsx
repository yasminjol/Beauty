import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { EmptyStateCard, ProfileHeader, ProfileScaffold, profileUiStyles } from './_ui';

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

const INITIAL_METHODS: PaymentMethod[] = [
  {
    id: 'card-1',
    brand: 'Visa',
    last4: '4242',
    expiry: '08/28',
    isDefault: true,
  },
  {
    id: 'card-2',
    brand: 'Mastercard',
    last4: '7781',
    expiry: '03/27',
    isDefault: false,
  },
];

const randomLast4 = () => `${Math.floor(1000 + Math.random() * 9000)}`;

export default function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>(INITIAL_METHODS);

  const hasMethods = useMemo(() => methods.length > 0, [methods]);

  const setDefault = (methodId: string) => {
    setMethods((current) =>
      current.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      })),
    );
  };

  const removeMethod = (methodId: string) => {
    setMethods((current) => {
      const filtered = current.filter((method) => method.id !== methodId);
      if (filtered.length && !filtered.some((method) => method.isDefault)) {
        return filtered.map((method, index) => ({
          ...method,
          isDefault: index === 0,
        }));
      }
      return filtered;
    });
  };

  const addMethod = () => {
    const id = `card-${Date.now()}`;

    setMethods((current) => [
      ...current,
      {
        id,
        brand: 'Visa',
        last4: randomLast4(),
        expiry: '12/29',
        isDefault: current.length === 0,
      },
    ]);

    Alert.alert('Card added', 'Payment method added (mock).');
  };

  return (
    <ProfileScaffold>
      <ProfileHeader title="Payment Methods" withBack />

      {hasMethods ? (
        methods.map((method) => (
          <View key={method.id} style={styles.methodCard}>
            <View style={styles.methodLeftRow}>
              <View style={styles.cardIconWrap}>
                <IconSymbol
                  ios_icon_name="creditcard.fill"
                  android_material_icon_name="payment"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={styles.methodTextWrap}>
                <Text style={styles.methodTitle}>
                  {method.brand} •••• {method.last4}
                </Text>
                <Text style={styles.methodMeta}>Expires {method.expiry}</Text>
              </View>
            </View>

            <View style={styles.methodActionsRow}>
              <TouchableOpacity
                style={[styles.defaultChip, method.isDefault && styles.defaultChipActive]}
                onPress={() => setDefault(method.id)}
              >
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name={method.isDefault ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={14}
                  color={method.isDefault ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.defaultChipText, method.isDefault && styles.defaultChipTextActive]}>
                  Default
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={() => removeMethod(method.id)}>
                <IconSymbol
                  ios_icon_name="trash"
                  android_material_icon_name="delete"
                  size={16}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <EmptyStateCard
          title="No payment methods yet"
          description="Add a card to speed up checkout and deposits."
          icon="payment"
        />
      )}

      <TouchableOpacity style={[profileUiStyles.primaryButton, styles.addButton]} onPress={addMethod}>
        <Text style={profileUiStyles.primaryButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </ProfileScaffold>
  );
}

const styles = StyleSheet.create({
  methodCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E2F6',
    backgroundColor: colors.card,
    padding: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  methodLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextWrap: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  methodMeta: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  methodActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9D4E8',
    backgroundColor: '#F6F5FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultChipActive: {
    borderColor: '#D1C1F6',
    backgroundColor: '#EEE6FF',
  },
  defaultChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  defaultChipTextActive: {
    color: colors.primary,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  addButton: {
    marginTop: 8,
  },
});
