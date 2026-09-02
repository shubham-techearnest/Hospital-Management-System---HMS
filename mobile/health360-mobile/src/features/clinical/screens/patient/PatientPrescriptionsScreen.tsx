import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, Snackbar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useMyPrescriptions } from '@/features/clinical/hooks/useClinicalQueries';
import type { Prescription, PrescriptionItem } from '@/features/clinical/api/clinicalApi';
import { useNearbyPartners } from '@/features/org/hooks/usePartnerQueries';
import {
  useMyPharmacyRequests,
  useSendPrescriptionToHospital,
  useSendPrescriptionToPartner,
} from '@/features/pharmacy/hooks/usePharmacyQueries';
import { pharmacyRequestStatusLabel } from '@/features/pharmacy/utils/pharmacyStatus';
import { useDeviceLocation } from '@/shared/hooks/useDeviceLocation';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Prescriptions'>;

function formatPrescriptionItem(item: PrescriptionItem): string {
  return [
    item.doseText,
    item.frequency,
    item.durationDays != null ? `${item.durationDays} days` : null,
    item.instructions,
  ]
    .filter(Boolean)
    .join(' · ');
}

function formatSignedAt(iso?: string): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export function PatientPrescriptionsScreen(_props: Props) {
  const { data: prescriptions = [], isLoading, error, refetch, isRefetching } = useMyPrescriptions();
  const { data: requests = [] } = useMyPharmacyRequests();
  const sendHospital = useSendPrescriptionToHospital();
  const sendPartner = useSendPrescriptionToPartner();
  const { coords } = useDeviceLocation();
  const hospitalId = prescriptions[0]?.hospitalId;
  const { data: nearbyPharmacies = [] } = useNearbyPartners(
    'PHARMACY',
    coords?.lat ?? null,
    coords?.lng ?? null,
    hospitalId,
    Boolean(coords),
  );
  const [snack, setSnack] = useState('');

  const requestByPrescription = new Map(requests.map((r) => [r.prescriptionId, r]));
  const sending = sendHospital.isPending || sendPartner.isPending;

  const handleSendHospital = async (rx: Prescription) => {
    try {
      await sendHospital.mutateAsync(rx.prescriptionId);
      setSnack('Sent to hospital pharmacy.');
    } catch (err) {
      setSnack(getApiErrorMessage(err, 'Unable to send prescription.'));
    }
  };

  const handleSendPartner = async (
    rx: Prescription,
    partnerOrgId: string,
    locationId: string,
    partnerName: string,
  ) => {
    try {
      await sendPartner.mutateAsync({ prescriptionId: rx.prescriptionId, partnerOrgId, locationId });
      setSnack(`Sent to ${partnerName}.`);
    } catch (err) {
      setSnack(getApiErrorMessage(err, 'Unable to send to partner pharmacy.'));
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHero
          compact
          title="Prescriptions"
          subtitle="Signed e-prescriptions — send to hospital pharmacy or a nearby partner store."
        />

        {error ? (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorText}>
              {getApiErrorMessage(error, 'Unable to load prescriptions.')}
            </Text>
          </AppCard>
        ) : null}

        {!error && prescriptions.length === 0 ? (
          <EmptyState
            icon="pill"
            title="No prescriptions yet"
            message="Signed prescriptions from your visits will appear here."
          />
        ) : null}

        {prescriptions.map((rx) => {
          const request = requestByPrescription.get(rx.prescriptionId);
          return (
            <AppCard key={rx.prescriptionId} style={styles.card}>
              <View style={styles.row}>
                <Text variant="titleMedium">{rx.prescriptionNumber}</Text>
                <Chip compact style={styles.statusChip}>{rx.status}</Chip>
              </View>
              {request ? (
                <Chip compact icon="pharmacy" style={styles.requestChip}>
                  {pharmacyRequestStatusLabel(request.status)}
                </Chip>
              ) : null}
              <Text style={styles.meta}>
                Signed {formatSignedAt(rx.signedAt)}
                {rx.notes ? ` · ${rx.notes}` : ''}
              </Text>
              <Divider style={styles.divider} />
              {rx.items.map((item) => (
                <View key={item.itemId} style={styles.itemRow}>
                  <Text variant="titleSmall">{item.medicineName}</Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {formatPrescriptionItem(item)}
                  </Text>
                </View>
              ))}
              {!request ? (
                <View style={styles.sendActions}>
                  <Button
                    mode="contained"
                    compact
                    loading={sending}
                    disabled={sending}
                    onPress={() => handleSendHospital(rx)}
                    style={styles.sendBtn}
                  >
                    Send to hospital pharmacy
                  </Button>
                  {nearbyPharmacies.slice(0, 3).map((partner) => (
                    <Button
                      key={`${partner.partnerOrgId}-${partner.locationId}`}
                      mode="outlined"
                      compact
                      loading={sending}
                      disabled={sending}
                      onPress={() =>
                        handleSendPartner(rx, partner.partnerOrgId, partner.locationId, partner.name)
                      }
                      style={styles.sendBtn}
                    >
                      {partner.inNetwork ? 'In-network: ' : ''}
                      {partner.name}
                      {partner.distanceKm != null ? ` (${partner.distanceKm.toFixed(1)} km)` : ''}
                    </Button>
                  ))}
                </View>
              ) : (
                <Text variant="bodySmall" style={styles.meta}>
                  Request {request.requestNumber}
                  {request.fulfillPartnerOrgId ? ' · Partner pharmacy' : ''}
                </Text>
              )}
            </AppCard>
          );
        })}
      </ScrollView>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  errorCard: { backgroundColor: appColors.errorContainer },
  errorText: { color: appColors.error },
  card: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statusChip: { backgroundColor: appColors.successContainer },
  requestChip: { alignSelf: 'flex-start', backgroundColor: appColors.primaryContainer },
  meta: { color: appColors.textSecondary },
  divider: { marginVertical: layout.stackGap },
  itemRow: { marginBottom: 8, gap: 2 },
  sendActions: { gap: 8, marginTop: 4 },
  sendBtn: { alignSelf: 'flex-start', borderRadius: 12 },
});
