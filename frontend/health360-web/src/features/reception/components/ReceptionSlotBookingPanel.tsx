import { useMemo, useState } from 'react';
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
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { useOpdDoctors } from '@/features/opd/hooks/useOpdQueries';
import {
  useBookAppointment,
  useDoctorAvailability,
  useCloseHospitalAppointment,
  useHospitalAppointments,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  hospitalId: string;
  branchId: string;
};

export function ReceptionSlotBookingPanel({ hospitalId, branchId }: Props) {
  const { data: doctors = [] } = useOpdDoctors(hospitalId, branchId);
  const book = useBookAppointment();
  const closeAppt = useCloseHospitalAppointment(hospitalId, branchId);
  const today = new Date().toISOString().slice(0, 10);
  const { data: dayAppointments = [], refetch } = useHospitalAppointments(hospitalId, branchId, today);

  const [patientQuery, setPatientQuery] = useState('');
  const [patient, setPatient] = useState<HospitalPatientSummary | null>(null);
  const [doctorId, setDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [slotId, setSlotId] = useState('');
  const [consultationType, setConsultationType] = useState('IN_PERSON');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: availability } = useDoctorAvailability(
    doctorId,
    hospitalId,
    branchId,
    Boolean(doctorId && hospitalId && branchId),
  );

  const daySlots = useMemo(() => {
    const day = availability?.days.find((d) => d.date === selectedDate);
    return day?.slots.filter((s) => s.status === 'AVAILABLE') ?? [];
  }, [availability, selectedDate]);

  const findPatient = async () => {
    setError(null);
    setPatient(null);
    const q = patientQuery.trim();
    if (!q) {
      setError('Enter UHID, mobile, or email to find the patient.');
      return;
    }
    try {
      const params = buildPatientSearchParams(q);
      if (!params) {
        setError('Enter UHID, mobile, or email to find the patient.');
        return;
      }
      const page = await searchHospitalPatients(params);
      if (page.content.length === 0) {
        setError('Patient not found — register them first.');
        return;
      }
      setPatient(page.content[0]);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const bookSlot = async () => {
    setError(null);
    setSuccess(null);
    if (!patient?.patientId || !doctorId || !slotId) {
      setError('Select patient, doctor, and time slot.');
      return;
    }
    try {
      const result = await book.mutateAsync({
        patientId: patient.patientId,
        doctorId,
        hospitalId,
        branchId,
        slotId,
        consultationType,
        reasonForVisit: reason.trim() || undefined,
      });
      setSuccess(
        `Booked ${result.appointmentId}. ${VISIT_FLOW.request.hint} On visit day use "${VISIT_FLOW.walkIn.deskTab}".`,
      );
      setSlotId('');
      refetch();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const close = async (appointmentId: string, status: 'COMPLETED' | 'NO_SHOW') => {
    try {
      await closeAppt.mutateAsync({ appointmentId, status });
      setSuccess(`Appointment ${status.toLowerCase()}.`);
      refetch();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">{VISIT_FLOW.request.deskTab}</Typography>
          <Typography variant="body2" color="text.secondary">
            {VISIT_FLOW.request.hint}
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="Patient UHID / mobile / email"
              fullWidth
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
            />
            <Button variant="outlined" onClick={findPatient}>Find</Button>
          </Stack>
          {patient ? (
            <Alert severity="info">
              {patient.legalName} · {patient.uhid ?? patient.patientId}
            </Alert>
          ) : null}
          <TextField select label="Doctor" fullWidth value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <MenuItem value="">Select doctor</MenuItem>
            {doctors.map((d) => (
              <MenuItem key={d.doctorId} value={d.doctorId}>
                {d.doctorName}{d.specialization ? ` · ${d.specialization}` : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSlotId(''); }}
          />
          <TextField
            select
            label="Consultation type"
            fullWidth
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
          >
            <MenuItem value="IN_PERSON">In person</MenuItem>
            <MenuItem value="TELECONSULTATION">Teleconsultation</MenuItem>
          </TextField>
          <TextField
            select
            label="Available slot"
            fullWidth
            value={slotId}
            onChange={(e) => {
              const id = e.target.value;
              setSlotId(id);
              const slot = daySlots.find((s) => s.id === id);
              if (slot) setConsultationType(slot.consultationType);
            }}
          >
            <MenuItem value="">Select slot</MenuItem>
            {daySlots.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.startTime?.slice(0, 5)} – {s.endTime?.slice(0, 5)} ({s.consultationType})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Reason for visit"
            fullWidth
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button variant="contained" onClick={bookSlot} disabled={book.isPending}>
            Book appointment
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Today&apos;s appointments — close / no-show</Typography>
        <Stack spacing={1}>
          {dayAppointments.map((a) => (
            <Stack
              key={a.appointmentId}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}
            >
              <Typography variant="body2">
                {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' · '}{a.patient?.name ?? 'Patient'}
                {' · '}{a.doctor?.name ?? 'Doctor'}
                {' · '}{a.status}
              </Typography>
              <Stack direction="row" spacing={1}>
                {['CONFIRMED', 'ARRIVED'].includes(a.status) ? (
                  <>
                    <Button size="small" color="success" onClick={() => close(a.appointmentId, 'COMPLETED')}>
                      Complete
                    </Button>
                    <Button size="small" color="warning" onClick={() => close(a.appointmentId, 'NO_SHOW')}>
                      No-show
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Stack>
          ))}
          {dayAppointments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No appointments for today.</Typography>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
