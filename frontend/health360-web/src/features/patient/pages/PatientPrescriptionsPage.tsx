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
import { useNearbyPartners } from '@/features/org/hooks/usePartnerQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { pharmacyRequestStatusLabel } from '@/shared/status/visitStatus';

const DEFAULT_NEARBY = { lat: 18.4562, lng: 73.9095 };

export function PatientPrescriptionsPage() {
  const { data: prescriptions = [], isLoading, error } = useMyPrescriptions();
  const { data: requests = [] } = useMyPharmacyRequests();
  const { sendHospital, sendPartner } = usePharmacyRequestMutations();
  const hospitalId = prescriptions[0]?.hospitalId;
  const { data: nearbyPharmacies = [] } = useNearbyPartners(
    'PHARMACY',
    DEFAULT_NEARBY.lat,
    DEFAULT_NEARBY.lng,
    hospitalId,
  );
  const parsedError = error ? parseApiError(error) : null;
  const sendError = sendHospital.error || sendPartner.error
    ? parseApiError(sendHospital.error ?? sendPartner.error)
    : null;

  const requestByPrescription = new Map(requests.map((r) => [r.prescriptionId, r]));

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Prescriptions"
        subtitle="Signed e-prescriptions — send to hospital pharmacy or a nearby partner store."
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
                {request?.fulfillPartnerOrgId ? (
                  <Chip size="small" variant="outlined" label="Partner pharmacy" />
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
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={sendHospital.isPending || sendPartner.isPending}
                    onClick={() => sendHospital.mutate(rx.prescriptionId)}
                  >
                    Send to hospital pharmacy
                  </Button>
                  {nearbyPharmacies.slice(0, 2).map((partner) => (
                    <Button
                      key={`${partner.partnerOrgId}-${partner.locationId}`}
                      variant="outlined"
                      size="small"
                      disabled={sendHospital.isPending || sendPartner.isPending}
                      onClick={() => sendPartner.mutate({
                        prescriptionId: rx.prescriptionId,
                        partnerOrgId: partner.partnerOrgId,
                        locationId: partner.locationId,
                      })}
                    >
                      {partner.inNetwork ? 'In-network: ' : ''}{partner.name}
                      {partner.distanceKm != null ? ` (${partner.distanceKm} km)` : ''}
                    </Button>
                  ))}
                </Stack>
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
