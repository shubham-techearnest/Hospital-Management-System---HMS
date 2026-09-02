import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { OpdQueueEntry } from '@/features/opd/api/opdApi';
import { useOpdDoctors, useOpdQueueActions } from '@/features/opd/hooks/useOpdQueries';
import {
  invoiceStatusColor,
  invoiceStatusLabel,
  patientDisplayLabel,
  queueStatusColor,
  queueStatusLabel,
  registrationTypeColor,
  registrationTypeLabel,
  visitEncounterStatusColor,
  visitEncounterStatusLabel,
} from '@/shared/status/visitStatus';

type Props = {
  hospitalId: string;
  branchId: string;
  queue: OpdQueueEntry[];
  checkoutBasePath?: string;
  onError: (e: unknown) => void;
  onSuccess: (message: string) => void;
};

export function OpdQueueTable({
  hospitalId,
  branchId,
  queue,
  checkoutBasePath = '/reception/checkout',
  onError,
  onSuccess,
}: Props) {
  const { data: doctors = [] } = useOpdDoctors(hospitalId, branchId);
  const queueActions = useOpdQueueActions(hospitalId, branchId);
  const [doctorByEntry, setDoctorByEntry] = useState<Record<string, string>>({});

  const doctorFor = (entry: OpdQueueEntry) =>
    doctorByEntry[entry.queueEntryId] || entry.primaryDoctorId || '';

  const patientLabel = (entry: OpdQueueEntry) =>
    patientDisplayLabel(
      entry.patientName ?? entry.encounter?.patientName,
      entry.uhid ?? entry.encounter?.uhid,
    );

  const patientUhid = (entry: OpdQueueEntry) =>
    entry.uhid ?? entry.encounter?.uhid;

  const run = async (
    action: 'call' | 'start' | 'complete' | 'cancel' | 'skip' | 'recall' | 'assign',
    entry: OpdQueueEntry,
  ) => {
    try {
      const primaryDoctorId = doctorFor(entry) || undefined;
      if (action === 'assign') {
        if (!primaryDoctorId) throw new Error('Select a doctor first');
        await queueActions.assignDoctor.mutateAsync({
          queueEntryId: entry.queueEntryId,
          primaryDoctorId,
        });
      } else if (action === 'skip') {
        await queueActions.skip.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'recall') {
        await queueActions.recall.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'call') {
        await queueActions.call.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'start') {
        await queueActions.start.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'complete') {
        await queueActions.complete.mutateAsync(entry.queueEntryId);
      } else {
        await queueActions.cancel.mutateAsync(entry.queueEntryId);
      }
      onSuccess(`Queue updated (${action}).`);
    } catch (e) {
      onError(e);
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Queue #</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Queue</TableCell>
            <TableCell>Consult</TableCell>
            <TableCell>Billing</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Visit #</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queue.map((entry, index) => (
            <TableRow key={entry.queueEntryId}>
              <TableCell><Typography fontWeight={700}>#{entry.tokenNumber || index + 1}</Typography></TableCell>
              <TableCell>
                <Typography fontWeight={600}>{patientLabel(entry)}</Typography>
                {patientUhid(entry) && (entry.patientName ?? entry.encounter?.patientName) ? (
                  <Typography variant="caption" color="text.secondary" display="block">{patientUhid(entry)}</Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={registrationTypeLabel(entry.registrationType)}
                  color={registrationTypeColor(entry.registrationType)}
                  variant={entry.registrationType === 'PATIENT_REQUEST' ? 'filled' : 'outlined'}
                />
                {entry.visitReason ? (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, maxWidth: 160 }}>
                    {entry.visitReason}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={queueStatusLabel(entry.status)}
                  color={queueStatusColor(entry.status)}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={entry.encounterStatus ? visitEncounterStatusLabel(entry.encounterStatus) : '—'}
                  color={entry.encounterStatus ? visitEncounterStatusColor(entry.encounterStatus) : 'default'}
                />
              </TableCell>
              <TableCell>
                {entry.status === 'COMPLETED' ? (
                  <Chip
                    size="small"
                    label={invoiceStatusLabel(entry.invoiceStatus)}
                    color={invoiceStatusColor(entry.invoiceStatus)}
                    variant={entry.invoiceStatus === 'PAID' ? 'filled' : 'outlined'}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell sx={{ minWidth: 180 }}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={doctorFor(entry)}
                  onChange={(e) =>
                    setDoctorByEntry((prev) => ({ ...prev, [entry.queueEntryId]: e.target.value }))
                  }
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {doctors.map((d) => (
                    <MenuItem key={d.doctorId} value={d.doctorId}>{d.doctorName}</MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>{entry.encounterNumber}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                  {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(entry.status) && (
                    <Button size="small" onClick={() => run('assign', entry)}>Assign</Button>
                  )}
                  {entry.status === 'WAITING' && (
                    <>
                      <Button size="small" onClick={() => run('call', entry)}>Call</Button>
                      <Button size="small" onClick={() => run('skip', entry)}>Skip</Button>
                    </>
                  )}
                  {entry.status === 'CALLED' && (
                    <>
                      <Button size="small" variant="contained" onClick={() => run('start', entry)}>Start</Button>
                      <Button size="small" onClick={() => run('skip', entry)}>Skip</Button>
                    </>
                  )}
                  {entry.status === 'SKIPPED' && (
                    <Button size="small" variant="contained" onClick={() => run('recall', entry)}>Recall</Button>
                  )}
                  {entry.status === 'IN_SERVICE' && (
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', px: 0.5 }}>
                      With doctor
                    </Typography>
                  )}
                  {entry.status === 'COMPLETED' && entry.encounterId ? (
                    entry.invoiceStatus === 'PAID' ? (
                      <Chip size="small" label="Paid ✓" color="success" />
                    ) : entry.invoiceStatus === 'ISSUED' || entry.invoiceStatus === 'PARTIALLY_PAID' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        component={RouterLink}
                        to={`${checkoutBasePath}/${entry.encounterId}`}
                      >
                        Collect payment
                      </Button>
                    ) : entry.invoiceStatus === 'DRAFT' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        component={RouterLink}
                        to={`${checkoutBasePath}/${entry.encounterId}`}
                      >
                        Finalize bill
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        component={RouterLink}
                        to={`${checkoutBasePath}/${entry.encounterId}`}
                      >
                        Checkout
                      </Button>
                    )
                  ) : null}
                  {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(entry.status) && (
                    <Button size="small" color="error" onClick={() => run('cancel', entry)}>Cancel</Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {queue.length === 0 && (
            <TableRow><TableCell colSpan={9}>No patients in queue for today.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
