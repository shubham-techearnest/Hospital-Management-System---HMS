import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useMyEncounters } from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

const PAGE_SIZE = 20;

export function PatientEncountersPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, isError } = useMyEncounters(page, PAGE_SIZE);
  const encounters = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const parsedError = error ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="My Visits"
        subtitle="Clinical encounters and OPD visits linked to your care."
      />

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

      {!isLoading && !isError && encounters.length === 0 ? (
        <Alert severity="info">No clinical visits on record yet.</Alert>
      ) : null}

      <Stack spacing={1.5}>
        {encounters.map((enc) => (
          <Card key={enc.encounterId} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{enc.encounterNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">{enc.encounterType} visit</Typography>
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
                    to={`/patient/encounters/${enc.encounterId}`}
                    size="small"
                    variant="outlined"
                  >
                    Details
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
