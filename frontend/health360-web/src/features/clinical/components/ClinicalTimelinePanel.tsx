import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  useMyClinicalTimeline,
  usePatientClinicalTimeline,
} from '@/features/clinical/hooks/useClinicalQueries';
import { formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';

function eventChipColor(eventType: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' {
  if (eventType.includes('VITAL')) return 'primary';
  if (eventType.includes('DIAGNOSIS')) return 'secondary';
  if (eventType.includes('NOTE')) return 'info';
  if (eventType.includes('ORDER')) return 'warning';
  if (eventType.includes('COMPLETED')) return 'success';
  return 'default';
}

interface ClinicalTimelinePanelProps {
  /** Staff view: timeline for this patient id */
  patientId?: string;
  /** Patient self view */
  self?: boolean;
  title?: string;
}

export function ClinicalTimelinePanel({
  patientId,
  self = false,
  title = 'Clinical timeline',
}: ClinicalTimelinePanelProps) {
  const [page, setPage] = useState(0);
  const staffQuery = usePatientClinicalTimeline(self ? '' : (patientId ?? ''), page);
  const selfQuery = useMyClinicalTimeline(page);
  const query = self ? selfQuery : staffQuery;

  const { data, isLoading, error } = query;
  const events = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const loadError = error ? parseApiError(error).message : null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hospital visit activity — encounters, clinical vitals, diagnoses, notes, and orders.
      </Typography>

      {loadError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      ) : null}

      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading clinical timeline…
        </Typography>
      ) : events.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No clinical events yet.
        </Typography>
      ) : (
        <List dense disablePadding>
          {events.map((event) => (
            <ListItem key={event.eventId} disableGutters alignItems="flex-start" sx={{ py: 1 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={event.eventType.replaceAll('_', ' ')} color={eventChipColor(event.eventType)} />
                    <Typography variant="body2" fontWeight={600}>
                      {event.summary}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatEncounterDate(event.occurredAt)}
                    {event.encounterNumber ? ` · ${event.encounterNumber}` : ''}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {totalPages > 1 ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Button size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography variant="caption">
            Page {page + 1} of {totalPages}
          </Typography>
          <Button size="small" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
