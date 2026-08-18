import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import {
  useEncounter,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
} from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';

export function PatientEncounterDetailPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const { data: encounter, isLoading, error } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const parsedError = error ? parseApiError(error) : null;

  if (isLoading) {
    return (
      <AnimatedPage>
        <Skeleton variant="text" width="50%" height={48} />
        <Skeleton variant="rounded" height={200} />
      </AnimatedPage>
    );
  }

  if (parsedError || !encounter) {
    return (
      <AnimatedPage>
        <Alert severity="error">{parsedError?.message ?? 'Encounter not found.'}</Alert>
        <Button component={RouterLink} to="/patient/encounters" sx={{ mt: 2 }}>Back to visits</Button>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/patient/encounters" sx={{ mb: 2 }}>← Back to visits</Button>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{encounter.encounterNumber}</Typography>
        <Chip
          label={encounterStatusLabel(encounter.status)}
          color={encounterStatusColor(encounter.status)}
          size="small"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
      </Typography>

      {encounter.visitReason ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Reason for visit</Typography>
          <Typography>{encounter.visitReason}</Typography>
        </Box>
      ) : null}

      <Stack spacing={3}>
        <Section title="Diagnoses" empty={diagnoses.length === 0}>
          <List dense disablePadding>
            {diagnoses.map((dx) => (
              <ListItem key={dx.diagnosisId} disableGutters>
                <ListItemText
                  primary={dx.diagnosisText}
                  secondary={[dx.diagnosisType, dx.diagnosisCode].filter(Boolean).join(' · ')}
                />
              </ListItem>
            ))}
          </List>
        </Section>

        <Section title="Clinical notes" empty={notes.length === 0}>
          <List dense disablePadding>
            {notes.map((note) => (
              <ListItem key={note.noteId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={note.noteType}
                  secondary={note.content}
                />
              </ListItem>
            ))}
          </List>
        </Section>

        <Section title="Orders" empty={orders.length === 0}>
          <List dense disablePadding>
            {orders.map((order) => (
              <ListItem key={order.orderId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${order.orderType} — ${order.status}`}
                  secondary={
                    <>
                      {order.instructions ? <Typography variant="body2">{order.instructions}</Typography> : null}
                      {order.items.map((item) => (
                        <Typography key={item.itemId} variant="body2" color="text.secondary">
                          {item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}
                        </Typography>
                      ))}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Section>
      </Stack>
    </AnimatedPage>
  );
}

function Section({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1.5 }} />
      {empty ? <Typography variant="body2" color="text.secondary">None recorded.</Typography> : children}
    </Box>
  );
}
