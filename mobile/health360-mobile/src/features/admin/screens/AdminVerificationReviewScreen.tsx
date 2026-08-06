import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ActivityIndicator, Button, Portal, Dialog, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors, layout } from '@/shared/theme';
import {
  useApproveVerification,
  useFetchVerificationDocument,
  useRejectVerification,
  useVerificationReview,
} from '../hooks/useAdminQueries';
import type { AdminStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'VerificationReview'>;

export function AdminVerificationReviewScreen({ navigation, route }: Props) {
  const { doctorId } = route.params;
  const { data, isLoading, isError } = useVerificationReview(doctorId);
  const approve = useApproveVerification();
  const reject = useRejectVerification();
  const fetchDoc = useFetchVerificationDocument();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const handleViewDoc = async (documentId: string, fileName: string) => {
    try {
      const buffer = await fetchDoc.mutateAsync({ doctorId, documentId });
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach((b) => { binary += String.fromCharCode(b); });
      const base64 = btoa(binary);
      const path = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        setSnack('Document saved to cache.');
      }
    } catch {
      setSnack('Unable to open document.');
    }
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(doctorId);
      setSnack('Doctor verified.');
      navigation.goBack();
    } catch {
      setSnack('Unable to approve.');
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync({ doctorId, reason: reason.trim() });
      setRejectOpen(false);
      setReason('');
      setSnack('Verification rejected.');
      navigation.goBack();
    } catch {
      setSnack('Unable to reject.');
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>Unable to load review details.</Text>
      </ScreenContainer>
    );
  }

  const profile = data.profile;

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="headlineSmall" style={styles.title}>{data.doctorName}</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>{data.email}</Text>

        <AppCard style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Profile summary</Text>
          <Text variant="bodySmall" style={styles.line}>
            Registration: {profile.professionalDetails.medicalRegistrationNumber ?? '—'}
          </Text>
          <Text variant="bodySmall" style={styles.line}>
            Council: {profile.professionalDetails.registrationCouncil ?? '—'}
          </Text>
          <Text variant="bodySmall" style={styles.line}>
            Specialization: {profile.specialization?.primarySpecializationName ?? '—'}
          </Text>
          <Text variant="bodySmall" style={styles.line}>
            Qualifications: {profile.qualifications.length}
          </Text>
          <Text variant="bodySmall" style={styles.line}>
            Languages: {profile.languages?.join(', ') || '—'}
          </Text>
          <Text variant="bodySmall" style={styles.line}>
            Status: {data.verificationStatus.replace(/_/g, ' ')}
          </Text>
        </AppCard>

        <AppCard style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Verification documents</Text>
          {data.documents.length === 0 ? (
            <Text variant="bodySmall" style={styles.line}>No documents.</Text>
          ) : (
            data.documents.map((doc) => (
              <View key={doc.id} style={styles.docRow}>
                <Text variant="bodySmall" style={styles.docLabel}>
                  {doc.documentType.replace(/_/g, ' ')} — {doc.fileName}
                </Text>
                <Button compact mode="outlined" onPress={() => handleViewDoc(doc.id, doc.fileName)}>
                  Open
                </Button>
              </View>
            ))
          )}
        </AppCard>

        {data.verificationStatus === 'PENDING_VERIFICATION' ? (
          <View style={styles.actions}>
            <Button mode="contained" onPress={handleApprove} loading={approve.isPending}>
              Approve
            </Button>
            <Button mode="outlined" textColor={appColors.error} onPress={() => setRejectOpen(true)}>
              Reject
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <Portal>
        <Dialog visible={rejectOpen} onDismiss={() => setRejectOpen(false)}>
          <Dialog.Title>Reject verification</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason (required)"
              mode="outlined"
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectOpen(false)}>Cancel</Button>
            <Button onPress={handleReject} disabled={!reason.trim() || reject.isPending}>
              Reject
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: layout.sectionGap, gap: layout.stackGap },
  title: { fontWeight: '700', color: appColors.textPrimary },
  subtitle: { color: appColors.textSecondary, marginBottom: layout.stackGap },
  section: { gap: 6 },
  sectionTitle: { fontWeight: '600', color: appColors.textPrimary, marginBottom: 4 },
  line: { color: appColors.textSecondary, lineHeight: layout.textLineHeight },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  docLabel: { flex: 1, color: appColors.textSecondary },
  actions: { gap: layout.stackGap, marginTop: layout.stackGap },
  error: { color: appColors.error },
});
