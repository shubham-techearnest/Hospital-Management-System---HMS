import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Snackbar, Text, TextInput } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useBookHospitalLab, useBookPartnerLab, useMyLabOrders } from '@/features/lab/hooks/useLabQueries';
import { labOrderStatusColor, labOrderStatusLabel } from '@/features/lab/utils/labStatus';
import { useNearbyPartners } from '@/features/org/hooks/usePartnerQueries';
import { useLabValuesHistory, useRecordLabValues } from '@/features/patient/hooks/usePatientExtendedQueries';
import { useDeviceLocation } from '@/shared/hooks/useDeviceLocation';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';

export function LabValuesScreen() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useLabValuesHistory(page);
  const recordMutation = useRecordLabValues();
  const { data: labOrders = [], isLoading: ordersLoading, error: ordersError, refetch: refetchOrders, isRefetching } = useMyLabOrders();
  const bookHospital = useBookHospitalLab();
  const bookPartner = useBookPartnerLab();
  const { coords } = useDeviceLocation();
  const hospitalIdForNearby = labOrders.find((o) => o.canBookHospital || o.canBookPartner)?.hospitalId;
  const { data: nearbyLabs = [] } = useNearbyPartners(
    'LABORATORY',
    coords?.lat ?? null,
    coords?.lng ?? null,
    hospitalIdForNearby,
    Boolean(coords),
  );
  const [form, setForm] = useState({
    hba1c: '',
    ldl: '',
    hdl: '',
    totalCholesterol: '',
    hemoglobin: '',
    recordedAt: new Date().toISOString().slice(0, 16),
  });
  const [snack, setSnack] = useState('');

  const pendingBook = useMemo(
    () => labOrders.filter((o) => o.canBookHospital || o.canBookPartner),
    [labOrders],
  );
  const inProgress = useMemo(
    () => labOrders.filter((o) => o.labOrderId && o.labOrderStatus && o.labOrderStatus !== 'RELEASED'),
    [labOrders],
  );
  const released = useMemo(
    () => labOrders.filter((o) => o.labOrderStatus === 'RELEASED'),
    [labOrders],
  );
  const booking = bookHospital.isPending || bookPartner.isPending;

  const handleSubmit = async () => {
    try {
      await recordMutation.mutateAsync({
        hba1c: form.hba1c ? Number(form.hba1c) : undefined,
        ldl: form.ldl ? Number(form.ldl) : undefined,
        hdl: form.hdl ? Number(form.hdl) : undefined,
        totalCholesterol: form.totalCholesterol ? Number(form.totalCholesterol) : undefined,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      });
      setSnack('Lab values recorded.');
      setForm({
        hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '',
        recordedAt: new Date().toISOString().slice(0, 16),
      });
    } catch {
      setSnack('Unable to record lab values. Enter at least one value.');
    }
  };

  const handleBookHospital = async (clinicalOrderItemId: string, testName: string) => {
    try {
      await bookHospital.mutateAsync(clinicalOrderItemId);
      setSnack(`${testName} booked at hospital lab.`);
    } catch (err) {
      setSnack(getApiErrorMessage(err, 'Unable to book hospital lab.'));
    }
  };

  const handleBookPartner = async (
    clinicalOrderItemId: string,
    testName: string,
    partnerOrgId: string,
    locationId: string,
    partnerName: string,
  ) => {
    try {
      await bookPartner.mutateAsync({ clinicalOrderItemId, partnerOrgId, locationId });
      setSnack(`${testName} booked at ${partnerName}.`);
    } catch (err) {
      setSnack(getApiErrorMessage(err, 'Unable to book partner lab.'));
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchOrders} />}
      >
        <PageHero
          title="Labs"
          subtitle="Book doctor-ordered tests and track self-recorded lab values."
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>Doctor-ordered tests</Text>
        {ordersLoading ? <ActivityIndicator /> : null}
        {ordersError ? <Text style={styles.error}>Unable to load lab orders.</Text> : null}
        {!ordersLoading && pendingBook.length === 0 ? (
          <Text style={styles.meta}>No new hospital lab bookings needed.</Text>
        ) : null}
        {pendingBook.map((order) => (
          <AppCard key={order.clinicalOrderItemId} style={styles.card}>
            <Text variant="titleSmall">{order.testName}</Text>
            <Text style={styles.meta}>
              {order.hospitalName ?? 'Hospital lab'}
              {order.encounterNumber ? ` · Visit ${order.encounterNumber}` : ''}
              {' · '}
              Ordered {new Date(order.orderedAt).toLocaleString()}
            </Text>
            <View style={styles.actions}>
              {order.canBookHospital ? (
                <Button
                  mode="contained"
                  compact
                  loading={booking}
                  disabled={booking}
                  onPress={() => handleBookHospital(order.clinicalOrderItemId, order.testName)}
                >
                  Book hospital lab
                </Button>
              ) : null}
              {order.canBookPartner
                ? nearbyLabs.slice(0, 2).map((partner) => (
                    <Button
                      key={`${partner.partnerOrgId}-${partner.locationId}`}
                      mode="outlined"
                      compact
                      loading={booking}
                      disabled={booking}
                      onPress={() =>
                        handleBookPartner(
                          order.clinicalOrderItemId,
                          order.testName,
                          partner.partnerOrgId,
                          partner.locationId,
                          partner.name,
                        )
                      }
                    >
                      {partner.inNetwork ? 'In-network: ' : ''}
                      {partner.name}
                      {partner.distanceKm != null ? ` (${partner.distanceKm.toFixed(1)} km)` : ''}
                    </Button>
                  ))
                : null}
            </View>
          </AppCard>
        ))}

        <Text variant="titleMedium" style={styles.sectionTitle}>In progress</Text>
        {inProgress.length === 0 ? (
          <Text style={styles.meta}>No active lab work.</Text>
        ) : (
          inProgress.map((order) => (
            <AppCard key={order.clinicalOrderItemId} style={styles.card}>
              <View style={styles.row}>
                <Text variant="titleSmall">{order.testName}</Text>
                <Chip
                  compact
                  textStyle={{ color: labOrderStatusColor(order.labOrderStatus) }}
                  style={{ backgroundColor: `${labOrderStatusColor(order.labOrderStatus)}22` }}
                >
                  {labOrderStatusLabel(order.labOrderStatus)}
                </Chip>
              </View>
              <Text style={styles.meta}>
                {order.hospitalName ?? 'Hospital lab'}
                {order.specimenId ? ` · Specimen ${order.specimenId}` : ''}
              </Text>
            </AppCard>
          ))
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>Released reports</Text>
        {released.length === 0 ? (
          <Text style={styles.meta}>No published reports yet.</Text>
        ) : (
          released.map((order) => (
            <AppCard key={order.clinicalOrderItemId} style={styles.card}>
              <View style={styles.row}>
                <Text variant="titleSmall">{order.testName}</Text>
                <Chip compact style={styles.releasedChip}>{labOrderStatusLabel('RELEASED')}</Chip>
              </View>
              {order.report?.summaryText ? (
                <Text style={styles.meta}>{order.report.summaryText}</Text>
              ) : null}
              {(order.report?.results ?? []).map((r) => (
                <Text key={r.resultId} style={styles.meta}>
                  {r.parameterName}: {r.valueText} {r.unit ?? ''}
                  {r.referenceRange ? ` (ref ${r.referenceRange})` : ''}
                </Text>
              ))}
            </AppCard>
          ))
        )}

        <Text variant="titleMedium" style={styles.sectionTitle}>Self-recorded values</Text>
        <AppCard style={styles.card}>
          <TextInput label="HbA1c (%)" mode="outlined" keyboardType="decimal-pad" value={form.hba1c} onChangeText={(hba1c) => setForm({ ...form, hba1c })} style={styles.input} />
          <TextInput label="LDL (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.ldl} onChangeText={(ldl) => setForm({ ...form, ldl })} style={styles.input} />
          <TextInput label="HDL (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.hdl} onChangeText={(hdl) => setForm({ ...form, hdl })} style={styles.input} />
          <TextInput label="Total cholesterol (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.totalCholesterol} onChangeText={(totalCholesterol) => setForm({ ...form, totalCholesterol })} style={styles.input} />
          <TextInput label="Hemoglobin (g/dL)" mode="outlined" keyboardType="decimal-pad" value={form.hemoglobin} onChangeText={(hemoglobin) => setForm({ ...form, hemoglobin })} style={styles.input} />
          <Button mode="contained" onPress={handleSubmit} loading={recordMutation.isPending} disabled={recordMutation.isPending}>
            Save lab values
          </Button>
        </AppCard>

        <Text variant="titleMedium" style={styles.sectionTitle}>History</Text>
        {isLoading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>Unable to load history.</Text> : null}
        {(data?.content ?? []).map((record) => (
          <AppCard key={record.id} style={styles.card}>
            <Text variant="titleSmall">{new Date(record.recordedAt).toLocaleString()}</Text>
            <Text style={styles.meta}>
              {[
                record.hba1c != null ? `HbA1c: ${record.hba1c}%` : null,
                record.ldl != null ? `LDL: ${record.ldl}` : null,
                record.hdl != null ? `HDL: ${record.hdl}` : null,
                record.totalCholesterol != null ? `Total chol: ${record.totalCholesterol}` : null,
              ].filter(Boolean).join(' · ') || 'Values recorded'}
            </Text>
          </AppCard>
        ))}

        {data && data.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
            <Text>Page {page + 1} of {data.totalPages}</Text>
            <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
          </View>
        ) : null}
      </ScrollView>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  sectionTitle: { fontWeight: '600', color: appColors.textPrimary, marginTop: 4 },
  card: { gap: 8 },
  meta: { color: appColors.textSecondary, lineHeight: 20 },
  error: { color: appColors.error },
  input: { marginBottom: 8 },
  actions: { gap: 8, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  releasedChip: { backgroundColor: appColors.successContainer },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
