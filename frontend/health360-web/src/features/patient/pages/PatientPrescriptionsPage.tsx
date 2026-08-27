import {
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useMyPrescriptions } from '@/features/clinical/hooks/useClinicalQueries';
import {
  useMyPharmacyRequests,
  usePharmacyRequestMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { pharmacyRequestStatusLabel } from '@/shared/status/visitStatus';

export function PatientPrescriptionsPage() {
  const { data: prescriptions = [], isLoading, error } = useMyPrescriptions();
  const { data: requests = [] } = useMyPharmacyRequests();
  const { sendHospital } = usePharmacyRequestMutations();
  const parsedError = error ? parseApiError(error) : null;
  const sendError = sendHospital.error ? parseApiError(sendHospital.error) : null;

  const requestByPrescription = new Map(requests.map((r) => [r.prescriptionId, r]));

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Prescriptions"
        subtitle="Signed e-prescriptions — send to hospital pharmacy when ready to collect."
      />

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {sendError ? <Alert severity="error" sx={{ mb: 2 }}>{sendError.message}</Alert> : null}
      {isLoading ? <Skeleton variant="rounded" height={160} /> : null}

      {!isLoading && prescriptions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No signed prescriptions yet.</Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {prescriptions.map((rx) => {
          const request = requestByPrescription.get(rx.prescriptionId);
          return (
            <Paper key={rx.prescriptionId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                <Typography variant="h6">{rx.prescriptionNumber}</Typography>
                <Chip size="small" color="success" label={rx.status} />
                {request ? (
                  <Chip
                    size="small"
                    color="info"
                    label={pharmacyRequestStatusLabel(request.status)}
                  />
                ) : null}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Signed {rx.signedAt ? new Date(rx.signedAt).toLocaleString() : '—'}
                {rx.notes ? ` · ${rx.notes}` : ''}
              </Typography>
              <List dense disablePadding>
                {rx.items.map((item) => (
                  <ListItem key={item.itemId} disableGutters>
                    <ListItemText
                      primary={item.medicineName}
                      secondary={[item.doseText, item.frequency, item.durationDays != null ? `${item.durationDays} days` : null, item.instructions]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                  </ListItem>
                ))}
              </List>
              {!request ? (
                <Button
                  sx={{ mt: 1.5 }}
                  variant="contained"
                  size="small"
                  disabled={sendHospital.isPending}
                  onClick={() => sendHospital.mutate(rx.prescriptionId)}
                >
                  Send to hospital pharmacy
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Pharmacy request {request.requestNumber} · {pharmacyRequestStatusLabel(request.status)}
                </Typography>
              )}
            </Paper>
          );
        })}
      </Stack>
    </AnimatedPage>
  );
}
