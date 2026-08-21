import {
  Alert,
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
import { parseApiError } from '@/shared/api/errorUtils';

export function PatientPrescriptionsPage() {
  const { data: prescriptions = [], isLoading, error } = useMyPrescriptions();
  const parsedError = error ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Prescriptions"
        subtitle="Signed e-prescriptions from your hospital visits."
      />

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Skeleton variant="rounded" height={160} /> : null}

      {!isLoading && prescriptions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No signed prescriptions yet.</Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {prescriptions.map((rx) => (
          <Paper key={rx.prescriptionId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">{rx.prescriptionNumber}</Typography>
              <Chip size="small" color="success" label={rx.status} />
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
          </Paper>
        ))}
      </Stack>
    </AnimatedPage>
  );
}
