import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  Button,
  Chip,
  Divider,
  Icon,
  List,
  ProgressBar,
  Snackbar,
  Text,
} from 'react-native-paper';
import {
  SUPPORTED_LANGUAGES,
  type PickedDocumentFile,
  type VerificationDocumentType,
} from '@/features/doctor/api/doctorApi';
import {
  useAddLanguage,
  useDeleteVerificationDocument,
  useDoctorProfile,
  useRemoveLanguage,
  useSubmitForVerification,
  useUploadVerificationDocument,
} from '@/features/doctor/hooks/useDoctorQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors } from '@/shared/theme';

const STEPS = ['Draft', 'Submitted', 'Under Review', 'Verified'];
const DOCUMENT_TYPES: VerificationDocumentType[] = ['REGISTRATION_CERT', 'IDENTITY_PROOF'];

function activeStepIndex(status: string) {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 2;
    case 'VERIFIED':
      return 3;
    default:
      return 0;
  }
}

function formatDocType(type: string) {
  return type.replace(/_/g, ' ');
}

function formatVerificationStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function statusChipStyle(status: string) {
  switch (status) {
    case 'VERIFIED':
      return { backgroundColor: '#e8f5e9' };
    case 'PENDING_VERIFICATION':
      return { backgroundColor: '#fff8e1' };
    case 'REJECTED':
      return { backgroundColor: '#ffebee' };
    default:
      return undefined;
  }
}

async function pickDocument(): Promise<PickedDocumentFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  };
}

export function DoctorVerificationScreen() {
  const { data: profile, isLoading, isError } = useDoctorProfile();
  const uploadDoc = useUploadVerificationDocument();
  const deleteDoc = useDeleteVerificationDocument();
  const addLanguage = useAddLanguage();
  const removeLanguage = useRemoveLanguage();
  const submitVerification = useSubmitForVerification();

  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });
  const [missingItems, setMissingItems] = useState<string[]>([]);

  const status = profile?.verificationStatus ?? 'DRAFT';
  const editable = status === 'DRAFT' || status === 'REJECTED';
  const languages = profile?.languages ?? [];
  const documents = profile?.verificationDocuments ?? [];

  const checklist = useMemo(() => {
    if (!profile) return [];
    const hasReg = !!profile.professionalDetails.medicalRegistrationNumber;
    const hasQual = profile.qualifications.length > 0;
    const hasSpec = !!profile.specialization?.primarySpecializationId;
    const hasRegCert = documents.some((d) => d.documentType === 'REGISTRATION_CERT');
    const hasId = documents.some((d) => d.documentType === 'IDENTITY_PROOF');
    return [
      { label: 'Medical registration number', done: hasReg },
      { label: 'At least one qualification', done: hasQual },
      { label: 'Primary specialization', done: hasSpec },
      { label: 'Registration certificate uploaded', done: hasRegCert },
      { label: 'Identity proof uploaded', done: hasId },
    ];
  }, [profile, documents]);

  const checklistComplete = checklist.every((item) => item.done);

  const notify = useCallback((message: string, isError = false) => {
    setSnackbar({ visible: true, message, isError });
  }, []);

  const handleUpload = async (documentType: VerificationDocumentType) => {
    const file = await pickDocument();
    if (!file) return;
    try {
      await uploadDoc.mutateAsync({ documentType, file });
      notify(`${formatDocType(documentType)} uploaded.`);
    } catch (error) {
      notify(getApiErrorMessage(error, 'Unable to upload document.'), true);
    }
  };

  const handleSubmit = async () => {
    setMissingItems([]);
    try {
      await submitVerification.mutateAsync();
      notify('Profile submitted for verification.');
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: { details?: { message: string }[] } } };
      };
      const details = err.response?.data?.error?.details ?? [];
      setMissingItems(details.map((d) => d.message));
      notify('Complete all requirements before submitting.', true);
    }
  };

  const toggleLanguage = async (code: string) => {
    try {
      if (languages.includes(code)) {
        await removeLanguage.mutateAsync(code);
      } else {
        await addLanguage.mutateAsync(code);
      }
    } catch (error) {
      notify(getApiErrorMessage(error, 'Unable to update languages.'), true);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load verification status.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Verification</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Upload credentials and submit your profile for platform verification.
        </Text>

        {status === 'REJECTED' && profile?.verificationRejectionReason ? (
          <View style={styles.rejectionBox}>
            <Text variant="titleSmall" style={styles.rejectionTitle}>Rejected</Text>
            <Text variant="bodyMedium">{profile.verificationRejectionReason}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Status</Text>
          <View style={styles.stepRow}>
            {STEPS.map((label, index) => (
              <View key={label} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    index <= activeStepIndex(status) ? styles.stepDotActive : undefined,
                  ]}
                />
                <Text variant="labelSmall" style={styles.stepLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Chip compact style={statusChipStyle(status)}>
            {formatVerificationStatus(status)}
          </Chip>
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Requirements checklist</Text>
          {checklist.map((item) => (
            <List.Item
              key={item.label}
              title={item.label}
              left={() => (
                <Icon
                  source={item.done ? 'check-circle' : 'checkbox-blank-circle-outline'}
                  color={item.done ? '#2e7d32' : '#9e9e9e'}
                  size={22}
                />
              )}
            />
          ))}
          {missingItems.length > 0 ? (
            <View style={styles.missingBox}>
              {missingItems.map((message) => (
                <Text key={message} variant="bodySmall" style={styles.missingText}>
                  • {message}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Languages spoken</Text>
          <View style={styles.chipRow}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const selected = languages.includes(lang.code);
              return (
                <Chip
                  key={lang.code}
                  compact
                  selected={selected}
                  onPress={editable ? () => toggleLanguage(lang.code) : undefined}
                  disabled={!editable || addLanguage.isPending || removeLanguage.isPending}
                  style={styles.langChip}
                >
                  {lang.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Verification documents</Text>
          <Text variant="bodySmall" style={styles.hint}>
            PDF, JPEG, or PNG up to 5 MB. Documents are visible only to platform admins.
          </Text>
          <Divider style={styles.divider} />

          {DOCUMENT_TYPES.map((docType) => {
            const doc = documents.find((d) => d.documentType === docType);
            return (
              <View key={docType} style={styles.docCard}>
                <Text variant="titleSmall">{formatDocType(docType)}</Text>
                {doc ? (
                  <View style={styles.docRow}>
                    <Icon source="file-document-outline" size={18} />
                    <Text variant="bodySmall" style={styles.fileName}>{doc.fileName}</Text>
                    {editable ? (
                      <Button
                        compact
                        textColor="#b00020"
                        onPress={async () => {
                          try {
                            await deleteDoc.mutateAsync(doc.id);
                            notify('Document removed.');
                          } catch (error) {
                            notify(getApiErrorMessage(error, 'Unable to delete document.'), true);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </View>
                ) : (
                  <Text variant="bodySmall" style={styles.notUploaded}>Not uploaded</Text>
                )}
                {editable ? (
                  <Button
                    mode="outlined"
                    compact
                    loading={uploadDoc.isPending}
                    disabled={uploadDoc.isPending}
                    onPress={() => handleUpload(docType)}
                    style={styles.uploadButton}
                  >
                    {doc ? 'Replace' : 'Upload'}
                  </Button>
                ) : null}
              </View>
            );
          })}
          {uploadDoc.isPending ? <ProgressBar indeterminate style={styles.progress} /> : null}
        </View>

        {editable ? (
          <Button
            mode="contained"
            disabled={!checklistComplete || submitVerification.isPending}
            loading={submitVerification.isPending}
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Submit for Verification
          </Button>
        ) : null}
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={4000}
        style={snackbar.isError ? styles.snackbarError : undefined}
      >
        {snackbar.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, marginTop: 48 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#b00020' },
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  rejectionBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  rejectionTitle: { color: '#b00020', marginBottom: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
  },
  stepDotActive: { backgroundColor: appColors.primary },
  stepLabel: { textAlign: 'center', opacity: 0.7 },
  missingBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff8e1',
    borderRadius: 6,
  },
  missingText: { color: '#795548' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { marginBottom: 4 },
  hint: { opacity: 0.7, marginBottom: 8 },
  divider: { marginBottom: 12 },
  docCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  fileName: { flex: 1 },
  notUploaded: { opacity: 0.6, marginTop: 8 },
  uploadButton: { marginTop: 8, alignSelf: 'flex-start' },
  progress: { marginTop: 8 },
  submitButton: { marginTop: 4 },
  snackbarError: { backgroundColor: '#b00020' },
});
