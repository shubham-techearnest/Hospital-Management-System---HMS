import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useDoctorEncounters } from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

const PAGE_SIZE = 20;
const STATUS_FILTERS = ['', 'WAITING', 'IN_PROGRESS', 'COMPLETED'] as const;

export function DoctorOpdPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, error, refetch, isFetching } = useDoctorEncounters(
    page,
    PAGE_SIZE,
    true,
    statusFilter || undefined,
  );
  const encounters = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const parsedError = error ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Today's OPD"
        subtitle="Encounters assigned to you for today. Queue refreshes automatically."
        actions={
          <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
        }
      />

      <TextField
        select
        label="Status"
        value={statusFilter}
        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        size="small"
        sx={{ maxWidth: 220, mb: 2 }}
      >
        <MenuItem value="">All today</MenuItem>
        {STATUS_FILTERS.filter(Boolean).map((s) => (
          <MenuItem key={s} value={s}>{encounterStatusLabel(s)}</MenuItem>
        ))}
      </TextField>

      {parsedError ? (
        <Alert severity={parsedError.kind === 'session' ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {parsedError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      ) : null}

      {!isLoading && encounters.length === 0 ? (
        <Alert severity="info">No OPD encounters for today in this view.</Alert>
      ) : null}

      <Stack spacing={1.5}>
        {encounters.map((enc) => (
          <Card key={enc.encounterId} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{enc.encounterNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient {enc.patientId.slice(0, 8)}…
                  </Typography>
                  {enc.visitReason ? (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{enc.visitReason}</Typography>
                  ) : null}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {formatEncounterDate(enc.startedAt ?? enc.createdAt)}
                  </Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75}>
                  <Chip
                    label={encounterStatusLabel(enc.status)}
                    color={encounterStatusColor(enc.status)}
                    size="small"
                  />
                  <Button
                    component={RouterLink}
                    to={`/doctor/encounters/${enc.encounterId}`}
                    size="small"
                    variant="contained"
                  >
                    Open encounter
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 3 }}>
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography variant="body2">Page {page + 1} of {totalPages}</Typography>
          <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
