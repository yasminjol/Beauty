
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedPost, BACKEND_URL } from '@/utils/api';

export default function ProviderVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { completeOnboarding, refreshUser } = useAuth();
  
  const providerName = params.name as string;
  const businessName = params.businessName as string;
  const address = params.address as string;
  const categories = JSON.parse(params.categories as string);

  const [idImage, setIdImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      setErrorModal({
        visible: true,
        message: 'Please allow access to your photo library to upload your ID',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('[ProviderVerification] Selected ID image:', result.assets[0].uri);
      setIdImage(result.assets[0].uri);
    }
  };

  const handleUploadAndComplete = async () => {
    if (!idImage) return;

    console.log('[ProviderVerification] Uploading ID and completing onboarding');
    setIsUploading(true);

    try {
      // First, complete provider onboarding
      await authenticatedPost('/api/onboarding/provider', {
        name: providerName,
        businessName,
        serviceAddress: address,
        serviceCategories: categories,
      });

      // Then upload ID document
      const formData = new FormData();
      const filename = idImage.split('/').pop() || 'id-document.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('idDocument', {
        uri: idImage,
        name: filename,
        type,
      } as any);

      // Upload ID using fetch with multipart/form-data
      const response = await fetch(`${BACKEND_URL}/api/onboarding/provider/id-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload ID document');
      }

      console.log('[ProviderVerification] Upload complete');
      
      // Refresh user to update onboarding status
      await refreshUser();
      completeOnboarding();
      
      setIsUploading(false);
      router.replace('/(provider-tabs)/dashboard');
    } catch (error: any) {
      setIsUploading(false);
      console.error('[ProviderVerification] Upload error:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to upload ID. Please try again.',
      });
    }
  };

  const handleSkipAndComplete = async () => {
    console.log('[ProviderVerification] Skipping ID verification and completing onboarding');
    setIsCompleting(true);

    try {
      // Complete provider onboarding without ID
      await authenticatedPost('/api/onboarding/provider', {
        name: providerName,
        businessName,
        serviceAddress: address,
        serviceCategories: categories,
      });

      console.log('[ProviderVerification] Onboarding complete');
      
      // Refresh user to update onboarding status
      await refreshUser();
      completeOnboarding();
      
      setIsCompleting(false);
      router.replace('/(provider-tabs)/dashboard');
    } catch (error: any) {
      setIsCompleting(false);
      console.error('[ProviderVerification] Onboarding error:', error);
      setErrorModal({
        visible: true,
        message: error.message || 'Failed to complete onboarding. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, message: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={48}
              color={colors.error}
            />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal({ visible: false, message: '' })}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
        </View>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>Step 4 of 4 (Optional)</Text>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            Build trust with clients by verifying your identity
          </Text>
        </View>

        <View style={styles.trustBox}>
          <IconSymbol
            ios_icon_name="checkmark.shield.fill"
            android_material_icon_name="verified-user"
            size={32}
            color={colors.primary}
          />
          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>Why verify?</Text>
            <Text style={styles.trustText}>
              Verified providers get a trust badge on their profile, helping clients feel confident booking with you
            </Text>
          </View>
        </View>

        <View style={styles.uploadSection}>
          {!idImage ? (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={pickImage}
            >
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="camera"
                size={48}
                color={colors.primary}
              />
              <Text style={styles.uploadTitle}>Upload Government ID</Text>
              <Text style={styles.uploadText}>
                Driver&apos;s License, Passport, or State ID
              </Text>
              <View style={styles.uploadButton}>
                <IconSymbol
                  ios_icon_name="photo"
                  android_material_icon_name="photo"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.uploadButtonText}>Choose Photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: idImage }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.changeButton}
                onPress={pickImage}
              >
                <IconSymbol
                  ios_icon_name="arrow.triangle.2.circlepath"
                  android_material_icon_name="refresh"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.changeButtonText}>Change Photo</Text>
              </TouchableOpacity>
              <View style={styles.statusBadge}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="schedule"
                  size={16}
                  color={colors.warning}
                />
                <Text style={styles.statusText}>Pending Approval</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.privacyBox}>
          <IconSymbol
            ios_icon_name="lock.fill"
            android_material_icon_name="lock"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.privacyText}>
            Your ID is encrypted and only used for verification. It will never be shared with clients.
          </Text>
        </View>

        <View style={styles.actions}>
          {idImage ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUploadAndComplete}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Upload & Complete</Text>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={20}
                    color={colors.card}
                  />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkipAndComplete}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.secondaryButtonText}>Skip for Now</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.primary}
                  />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.skipNote}>
          You can always verify your identity later from your profile settings
        </Text>
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
    paddingBottom: 40,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  header: {
    marginBottom: 24,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  trustBox: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  trustContent: {
    flex: 1,
    gap: 4,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trustText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  uploadText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  previewContainer: {
    gap: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.warning,
  },
  privacyBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  skipNote: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
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
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.card,
  },
});
