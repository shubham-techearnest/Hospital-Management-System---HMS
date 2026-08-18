import { useState } from 'react';
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
import { PatientSummaryPanel } from '@/features/doctor/components/PatientSummaryPanel';
import { usePatientSummary } from '@/features/doctor/hooks/usePatientSummaryQueries';
import {
  useEncounter,
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
} from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusColor, encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { parseApiError } from '@/shared/api/errorUtils';

export function DoctorEncounterDetailPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const { data: encounter, isLoading, error, refetch } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const actions = useEncounterActions(encounterId);
  const { data: patientSummary, isLoading: summaryLoading, error: summaryError } = usePatientSummary(
    encounter?.patientId ?? '',
    encounter?.appointmentId ?? '',
    Boolean(encounter?.patientId && encounter?.appointmentId),
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const parsedError = error ? parseApiError(error) : null;

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    setActionError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(`${label} successful.`);
      refetch();
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

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
        <Button component={RouterLink} to="/doctor/opd" sx={{ mt: 2 }}>Back to OPD</Button>
      </AnimatedPage>
    );
  }

  const canCheckIn = encounter.status === 'REGISTERED';
  const canStart = encounter.status === 'WAITING' || encounter.status === 'REGISTERED';
  const canComplete = encounter.status === 'IN_PROGRESS';

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/doctor/opd" sx={{ mb: 2 }}>← Back to OPD</Button>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4">{encounter.encounterNumber}</Typography>
        <Chip
          label={encounterStatusLabel(encounter.status)}
          color={encounterStatusColor(encounter.status)}
          size="small"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
      </Typography>

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {canCheckIn ? (
          <Button
            variant="outlined"
            disabled={actions.checkIn.isPending}
            onClick={() => runAction('Check-in', () => actions.checkIn.mutateAsync())}
          >
            Check in
          </Button>
        ) : null}
        {canStart ? (
          <Button
            variant="contained"
            disabled={actions.start.isPending}
            onClick={() => runAction('Start consultation', () => actions.start.mutateAsync())}
          >
            Start consultation
          </Button>
        ) : null}
        {canComplete ? (
          <Button
            variant="contained"
            color="success"
            disabled={actions.complete.isPending}
            onClick={() => runAction('Complete encounter', () => actions.complete.mutateAsync())}
          >
            Complete encounter
          </Button>
        ) : null}
      </Stack>

      {encounter.visitReason ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">Reason for visit</Typography>
          <Typography>{encounter.visitReason}</Typography>
        </Box>
      ) : null}

      <Box sx={{ mb: 3 }}>
        {summaryLoading ? <Skeleton variant="rounded" height={120} /> : null}
        {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}
        {!summaryLoading && !patientSummary && summaryError ? (
          <Alert severity="info">Patient summary unavailable for this encounter.</Alert>
        ) : null}
      </Box>

      <Stack spacing={3}>
        <DetailSection title="Diagnoses" empty={diagnoses.length === 0}>
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
        </DetailSection>

        <DetailSection title="Clinical notes" empty={notes.length === 0}>
          <List dense disablePadding>
            {notes.map((note) => (
              <ListItem key={note.noteId} disableGutters alignItems="flex-start">
                <ListItemText primary={note.noteType} secondary={note.content} />
              </ListItem>
            ))}
          </List>
        </DetailSection>

        <DetailSection title="Orders" empty={orders.length === 0}>
          <List dense disablePadding>
            {orders.map((order) => (
              <ListItem key={order.orderId} disableGutters alignItems="flex-start">
                <ListItemText
                  primary={`${order.orderType} — ${order.status}`}
                  secondary={order.items.map((item) => item.itemName).join(', ') || order.instructions}
                />
              </ListItem>
            ))}
          </List>
        </DetailSection>
      </Stack>
    </AnimatedPage>
  );
}

function DetailSection({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      <Divider sx={{ mb: 1.5 }} />
      {empty ? <Typography variant="body2" color="text.secondary">None recorded.</Typography> : children}
    </Box>
  );
}
