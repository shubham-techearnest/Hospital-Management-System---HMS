import { useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { searchHospitalPatients, type HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { buildPatientSearchParams } from '@/features/reception/utils/patientSearchParams';
import { listDeskArrivals } from '@/features/scheduling/api/schedulingApi';
import { appointmentLabel } from '@/features/scheduling/utils/schedulingUtils';
import { arriveAppointment } from '@/features/opd/api/opdApi';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { parseApiError } from '@/shared/api/errorUtils';
import { isValidUuid } from '@/shared/utils/uuid';

type Props = {
  hospitalId: string;
  branchId: string;
  desks: Array<{ id: string; label: string }>;
  onArrived?: (message: string) => void;
};

export function ReceptionArrivalPanel({ hospitalId, branchId, desks, onArrived }: Props) {
  const [query, setQuery] = useState('');
  const [patient, setPatient] = useState<HospitalPatientSummary | null>(null);
  const [appointments, setAppointments] = useState<Awaited<ReturnType<typeof listDeskArrivals>>>([]);
  const [deskId, setDeskId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [arrivingId, setArrivingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const findPatientAndAppointments = async () => {
    setError(null);
    setSuccess(null);
    setPatient(null);
    setAppointments([]);

    const q = query.trim();
    if (!q) {
      setError('Enter mobile, email, or UHID to find today\'s bookings.');
      return;
    }

    setLoading(true);
    try {
      const params = buildPatientSearchParams(q);
      if (!params) {
        setError('Enter a valid mobile, email, or UHID.');
        return;
      }
      const page = await searchHospitalPatients(params);
      if (page.content.length === 0) {
        setError(`Patient not found. Use "${VISIT_FLOW.walkIn.deskTab}" or "${VISIT_FLOW.request.deskTab}" first.`);
        return;
      }
      const found = page.content[0];
      setPatient(found);
      const arrivals = await listDeskArrivals({
        hospitalId,
        branchId,
        patientId: found.patientId,
      });
      setAppointments(arrivals);
      if (arrivals.length === 0) {
        setError(`No bookings for today. Use "${VISIT_FLOW.walkIn.deskTab}" if they came without a booking.`);
      }
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setLoading(false);
    }
  };

  const arrive = async (targetAppointmentId: string) => {
    setError(null);
    setSuccess(null);
    setArrivingId(targetAppointmentId);
    try {
      const result = await arriveAppointment({
        appointmentId: targetAppointmentId,
        deskId: deskId || undefined,
      });
      const message = `Arrived — token ${result.queueEntry.tokenDisplay}. Send patient to vitals / doctor.`;
      setSuccess(message);
      onArrived?.(message);
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointmentId === targetAppointmentId
            ? { ...a, canArrive: false, appointmentStatus: result.appointmentStatus ?? 'ARRIVED' }
            : a,
        ),
      );
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setArrivingId(null);
    }
  };

  const arriveById = async () => {
    const id = appointmentId.trim();
    if (!isValidUuid(id)) {
      setError('Enter a valid appointment ID (UUID).');
      return;
    }
    await arrive(id);
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2, maxWidth: 720 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">{VISIT_FLOW.walkIn.deskTab}</Typography>
          <Typography variant="body2" color="text.secondary">
            {VISIT_FLOW.walkIn.hint}
          </Typography>
          {error ? <Alert severity="warning">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Mobile / email / UHID"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button variant="outlined" onClick={() => void findPatientAndAppointments()} disabled={loading}>
              {loading ? 'Searching…' : 'Find bookings'}
            </Button>
          </Stack>
          {patient ? (
            <Alert severity="info">
              {patient.legalName}
              {patient.uhid ? ` · ${patient.uhid}` : ''}
              {patient.primaryPhone ? ` · ${patient.primaryPhone}` : ''}
            </Alert>
          ) : null}
          <TextField
            select
            label="Desk (optional)"
            fullWidth
            value={deskId}
            onChange={(e) => setDeskId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {desks.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
            ))}
          </TextField>
          {appointments.map((appt) => (
            <Paper key={appt.appointmentId} variant="outlined" sx={{ p: 1.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
                <BoxText appt={appt} />
                {appt.canArrive ? (
                  <Button
                    variant="contained"
                    size="small"
                    disabled={arrivingId === appt.appointmentId}
                    onClick={() => void arrive(appt.appointmentId)}
                  >
                    {arrivingId === appt.appointmentId ? 'Checking in…' : 'Mark arrived'}
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {appointmentLabel(appt.appointmentStatus)}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, maxWidth: 480 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Advanced: appointment ID</Typography>
        <Stack spacing={1}>
          <TextField
            label="Appointment ID"
            fullWidth
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="UUID from booking confirmation"
          />
          <Button variant="outlined" onClick={() => void arriveById()} disabled={!appointmentId.trim()}>
            Mark arrived by ID
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

function BoxText({ appt }: { appt: Awaited<ReturnType<typeof listDeskArrivals>>[number] }) {
  return (
    <Typography variant="body2">
      {appt.scheduledAt
        ? new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—'}
      {' · '}{appt.doctorName}
      {' · '}{appointmentLabel(appt.appointmentStatus)}
    </Typography>
  );
}
