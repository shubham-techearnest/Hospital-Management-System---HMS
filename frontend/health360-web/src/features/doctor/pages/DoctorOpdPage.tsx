import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import { beginEncounter } from '@/features/clinical/api/clinicalApi';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { OpdFloorStatusHelp } from '@/features/opd/components/OpdFloorStatusHelp';
import { queueStatusLabel } from '@/shared/status/visitStatus';
import { useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 20;
const STATUS_FILTERS = ['', 'REGISTERED', 'WAITING', 'IN_PROGRESS', 'COMPLETED'] as const;

export function DoctorOpdPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading, error, refetch, isFetching } = useDoctorEncounters(
    page,
    PAGE_SIZE,
    true,
    statusFilter || undefined,
  );
  const encounters = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const parsedError = error ? parseApiError(error) : null;

  const startConsult = async (encounterId: string, status: string) => {
    setActionError(null);
    setStartingId(encounterId);
    try {
      await beginEncounter(encounterId, status);
      await queryClient.invalidateQueries({ queryKey: ['clinical'] });
      await refetch();
      navigate(`/doctor/encounters/${encounterId}`);
    } catch (e) {
      setActionError(parseApiError(e).message);
    } finally {
      setStartingId(null);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Today's OPD"
        subtitle="Tap Begin & open to start documenting. Use finger tabs on the encounter screen."
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
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <OpdFloorStatusHelp audience="doctor" />

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      ) : null}

      {!isLoading && encounters.length === 0 ? (
        <Alert severity="info">
          No OPD encounters assigned to you today. Reception must assign you as the consulting doctor on the queue.
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        {encounters.map((enc) => {
          const canStart = enc.status === 'WAITING' || enc.status === 'REGISTERED';
          return (
            <Card key={enc.encounterId} variant="outlined">
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {enc.patientName || 'Patient'}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {enc.uhid ? `${enc.uhid} · ` : ''}{enc.encounterNumber}
                    </Typography>
                    {enc.visitReason ? (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>{enc.visitReason}</Typography>
                    ) : null}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatEncounterDate(enc.startedAt ?? enc.createdAt)}
                    </Typography>
                  </Box>
                  <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                      {enc.queueStatus ? (
                        <Chip label={`Queue ${queueStatusLabel(enc.queueStatus)}`} size="small" variant="outlined" />
                      ) : null}
                      <Chip
                        label={encounterStatusLabel(enc.status)}
                        color={encounterStatusColor(enc.status)}
                        size="small"
                      />
                    </Stack>
                    {canStart ? (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={startingId === enc.encounterId}
                        onClick={() => startConsult(enc.encounterId, enc.status)}
                      >
                        Begin & open
                      </Button>
                    ) : (
                      <Button
                        component={RouterLink}
                        to={`/doctor/encounters/${enc.encounterId}`}
                        size="small"
                        variant="contained"
                      >
                        Open encounter
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
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
