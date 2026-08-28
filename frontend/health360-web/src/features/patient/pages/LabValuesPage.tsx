import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useLabValuesHistory, useRecordLabValues } from '@/features/patient/hooks/usePatientExtendedQueries';
import { useBookHospitalLab, useBookPartnerLab, useMyLabOrders } from '@/features/lab/hooks/useLabQueries';
import { useNearbyPartners } from '@/features/org/hooks/usePartnerQueries';
import { labOrderStatusColor, labOrderStatusLabel } from '@/shared/status/visitStatus';
import { parseApiError } from '@/shared/api/errorUtils';

const DEFAULT_NEARBY = { lat: 18.4562, lng: 73.9095 };

export function LabValuesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useLabValuesHistory(page);
  const recordMutation = useRecordLabValues();
  const { data: labOrders = [], isLoading: ordersLoading, error: ordersError } = useMyLabOrders();
  const bookMutation = useBookHospitalLab();
  const bookPartnerMutation = useBookPartnerLab();
  const [form, setForm] = useState({
    hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '', recordedAt: new Date().toISOString().slice(0, 16),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  const pendingBook = useMemo(() => labOrders.filter((o) => o.canBookHospital || o.canBookPartner), [labOrders]);
  const hospitalIdForNearby = pendingBook[0]?.hospitalId;
  const { data: nearbyLabs = [] } = useNearbyPartners(
    'LABORATORY',
    DEFAULT_NEARBY.lat,
    DEFAULT_NEARBY.lng,
    hospitalIdForNearby,
  );
  const inProgress = useMemo(
    () => labOrders.filter((o) => o.labOrderId && o.labOrderStatus && o.labOrderStatus !== 'RELEASED'),
    [labOrders],
  );
  const released = useMemo(
    () => labOrders.filter((o) => o.labOrderStatus === 'RELEASED'),
    [labOrders],
  );

  const handleSubmit = async () => {
    setMessage(null);
    try {
      await recordMutation.mutateAsync({
        hba1c: form.hba1c ? Number(form.hba1c) : undefined,
        ldl: form.ldl ? Number(form.ldl) : undefined,
        hdl: form.hdl ? Number(form.hdl) : undefined,
        totalCholesterol: form.totalCholesterol ? Number(form.totalCholesterol) : undefined,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      });
      setMessage('Lab values recorded.');
      setForm({ hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '', recordedAt: new Date().toISOString().slice(0, 16) });
    } catch {
      setMessage('Unable to record lab values. Enter at least one value.');
    }
  };

  const book = async (clinicalOrderItemId: string, testName: string) => {
    setBookError(null);
    setBookSuccess(null);
    try {
      await bookMutation.mutateAsync(clinicalOrderItemId);
      setBookSuccess(`${testName} booked at the hospital lab.`);
    } catch (e) {
      setBookError(parseApiError(e).message);
    }
  };

  const bookPartner = async (
    clinicalOrderItemId: string,
    testName: string,
    partnerOrgId: string,
    locationId: string,
    partnerName: string,
  ) => {
    setBookError(null);
    setBookSuccess(null);
    try {
      await bookPartnerMutation.mutateAsync({ clinicalOrderItemId, partnerOrgId, locationId });
      setBookSuccess(`${testName} booked at ${partnerName}.`);
    } catch (e) {
      setBookError(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>Labs</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Book doctor-ordered tests at the hospital lab or a nearby partner laboratory.
      </Typography>

      {bookError ? <Alert severity="error" sx={{ mb: 2 }}>{bookError}</Alert> : null}
      {bookSuccess ? <Alert severity="success" sx={{ mb: 2 }}>{bookSuccess}</Alert> : null}

      <Typography variant="h6" sx={{ mb: 1 }}>Doctor-ordered tests</Typography>
      {ordersLoading ? <CircularProgress size={24} sx={{ mb: 2 }} /> : null}
      {ordersError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load lab orders.</Alert> : null}
      {pendingBook.length === 0 && !ordersLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No new hospital lab bookings needed.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {pendingBook.map((order) => (
            <Card key={order.clinicalOrderItemId} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{order.testName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.hospitalName ?? 'Hospital lab'}
                      {order.encounterNumber ? ` · Visit ${order.encounterNumber}` : ''}
                      {' · '}
                      Ordered {new Date(order.orderedAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {order.canBookHospital ? (
                      <Button
                        variant="contained"
                        disabled={bookMutation.isPending || bookPartnerMutation.isPending}
                        onClick={() => book(order.clinicalOrderItemId, order.testName)}
                      >
                        Book hospital lab
                      </Button>
                    ) : null}
                    {order.canBookPartner
                      ? nearbyLabs.slice(0, 2).map((partner) => (
                          <Button
                            key={`${partner.partnerOrgId}-${partner.locationId}`}
                            variant="outlined"
                            disabled={bookMutation.isPending || bookPartnerMutation.isPending}
                            onClick={() => bookPartner(
                              order.clinicalOrderItemId,
                              order.testName,
                              partner.partnerOrgId,
                              partner.locationId,
                              partner.name,
                            )}
                          >
                            {partner.inNetwork ? 'In-network: ' : ''}{partner.name}
                            {partner.distanceKm != null ? ` (${partner.distanceKm} km)` : ''}
                          </Button>
                        ))
                      : null}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>In progress</Typography>
      {inProgress.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No active lab work.</Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {inProgress.map((order) => (
            <Card key={order.clinicalOrderItemId} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography fontWeight={600}>{order.testName}</Typography>
                  <Chip
                    size="small"
                    label={labOrderStatusLabel(order.labOrderStatus ?? 'ORDERED')}
                    color={labOrderStatusColor(order.labOrderStatus ?? 'ORDERED')}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {order.hospitalName ?? 'Hospital lab'}
                  {order.specimenId ? ` · Specimen ${order.specimenId}` : ''}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>Released reports</Typography>
      {released.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No published reports yet.</Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {released.map((order) => (
            <Card key={order.clinicalOrderItemId} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography fontWeight={600}>{order.testName}</Typography>
                  <Chip size="small" color="success" label={labOrderStatusLabel('RELEASED')} />
                </Stack>
                {order.report?.summaryText ? (
                  <Typography variant="body2" sx={{ mb: 1 }}>{order.report.summaryText}</Typography>
                ) : null}
                {(order.report?.results ?? []).map((r) => (
                  <Typography key={r.resultId} variant="body2" color="text.secondary">
                    {r.parameterName}: {r.valueText} {r.unit ?? ''}
                    {r.referenceRange ? ` (ref ${r.referenceRange})` : ''}
                  </Typography>
                ))}
                {order.encounterId ? (
                  <Button
                    component={RouterLink}
                    to={`/patient/encounters/${order.encounterId}`}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Open visit
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1 }}>Health metrics history</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Released hospital reports automatically add matching values (e.g. hemoglobin). You can also record home or external results.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Record additional values</Typography>
          <Stack spacing={2}>
            <TextField label="HbA1c (%)" type="number" value={form.hba1c} onChange={(e) => setForm({ ...form, hba1c: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="LDL (mg/dL)" type="number" fullWidth value={form.ldl} onChange={(e) => setForm({ ...form, ldl: e.target.value })} />
              <TextField label="HDL (mg/dL)" type="number" fullWidth value={form.hdl} onChange={(e) => setForm({ ...form, hdl: e.target.value })} />
            </Stack>
            <TextField label="Total cholesterol (mg/dL)" type="number" value={form.totalCholesterol} onChange={(e) => setForm({ ...form, totalCholesterol: e.target.value })} />
            <TextField label="Hemoglobin (g/dL)" type="number" value={form.hemoglobin} onChange={(e) => setForm({ ...form, hemoglobin: e.target.value })} />
            <TextField label="Recorded at" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.recordedAt} onChange={(e) => setForm({ ...form, recordedAt: e.target.value })} />
            <Button variant="contained" onClick={handleSubmit} disabled={recordMutation.isPending}>Save lab values</Button>
          </Stack>
          {message ? <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert> : null}
        </CardContent>
      </Card>

      {isLoading ? <CircularProgress /> : null}
      {error ? <Alert severity="error">Unable to load history.</Alert> : null}
      <Stack spacing={1}>
        {(data?.content ?? []).map((record) => (
          <Card key={record.id} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">{new Date(record.recordedAt).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  record.hba1c != null ? `HbA1c: ${record.hba1c}%` : null,
                  record.hemoglobin != null ? `Hb: ${record.hemoglobin}` : null,
                  record.ldl != null ? `LDL: ${record.ldl}` : null,
                  record.hdl != null ? `HDL: ${record.hdl}` : null,
                  record.totalCholesterol != null ? `Total chol: ${record.totalCholesterol}` : null,
                ].filter(Boolean).join(' · ') || 'Values recorded'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {page + 1} of {data.totalPages}</Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
