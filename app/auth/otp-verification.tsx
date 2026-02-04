
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/utils/api';

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedRole, refreshUser } = useAuth();
  
  const email = params.email as string;
  const isSignUp = params.isSignUp === 'true';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    console.log('[OTP] 🔐 Verifying OTP:', otpCode, 'for email:', email);
    setIsLoading(true);
    setError('');

    try {
      // Verify OTP with backend
      await apiPost('/api/otp/verify', { email, code: otpCode });
      
      console.log('[OTP] ✅ Verification successful! Proceeding to onboarding...');
      
      // Refresh user data to get updated onboarding status
      await refreshUser();
      
      setIsLoading(false);
      setSuccessModal(true);
      
      // Navigate to onboarding based on role after a short delay
      setTimeout(() => {
        if (selectedRole === 'client') {
          console.log('[OTP] → Redirecting to client onboarding');
          router.replace('/onboarding/client-name');
        } else {
          console.log('[OTP] → Redirecting to provider onboarding');
          router.replace('/onboarding/provider-name');
        }
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setError('Invalid or expired code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      console.error('[OTP] ❌ Verification error:', err);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    console.log('[OTP] 📧 Resending OTP to:', email);
    console.log('[OTP] 💡 TIP: Check your backend logs/terminal for the OTP code!');
    setCanResend(false);
    setResendTimer(60);
    setError('');

    try {
      await apiPost('/api/otp/send', { email });
      console.log('[OTP] ✅ OTP resent successfully!');
      setSuccessModal(true);
      setTimeout(() => setSuccessModal(false), 2000);
    } catch (err: any) {
      console.error('[OTP] ❌ Resend error:', err);
      setError('Failed to resend code. Please try again.');
      setCanResend(true);
    }
  };

  const timerText = `${Math.floor(resendTimer / 60)}:${(resendTimer % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={successModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              {error ? 'Code sent successfully' : 'Email verified successfully'}
            </Text>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.otpContainer}>
          <View style={styles.otpInputs}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <IconSymbol
                ios_icon_name="exclamationmark.circle.fill"
                android_material_icon_name="error"
                size={20}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Verifying code...</Text>
            </View>
          )}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>
            Didn&apos;t receive the code?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Resend in {timerText}</Text>
          )}
        </View>

        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            This verification step helps us keep your account secure and ensures you have access to important notifications.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  timerText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
