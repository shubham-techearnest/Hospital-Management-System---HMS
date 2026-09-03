import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Paper, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { usePatientSearch } from '@/features/reception/hooks/usePatientRegistryQueries';
import type { HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { lookupDeskAppointment, type DeskAppointmentLookup } from '@/features/scheduling/api/schedulingApi';
import { arriveAppointment } from '@/features/opd/api/opdApi';
import { appointmentLabel } from '@/features/scheduling/utils/schedulingUtils';
import { formatPatientDob, formatPatientPhone } from '@/features/reception/utils/patientDisplayUtils';
import { isValidUuid } from '@/shared/utils/uuid';
import { PhoneField } from '@/shared/phone/PhoneField';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export function PatientSearchPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [uhid, setUhid] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [apptLookup, setApptLookup] = useState<DeskAppointmentLookup | null>(null);
  const [apptError, setApptError] = useState<string | null>(null);
  const [apptLoading, setApptLoading] = useState(false);
  const [arrivePending, setArrivePending] = useState(false);
  const [arriveMessage, setArriveMessage] = useState<string | null>(null);

  const searchParams = tab === 0
    ? { uhid: submitted ? uhid : undefined }
    : tab === 1
      ? { mobile: submitted ? mobile : undefined }
      : tab === 2
        ? { email: submitted ? email : undefined }
        : tab === 3
        ? {
            firstName: submitted ? firstName : undefined,
            lastName: submitted ? lastName : undefined,
            dateOfBirth: submitted && dateOfBirth ? dateOfBirth : undefined,
          }
        : {};

  const { data, isFetching, isError, error, refetch } = usePatientSearch({
    ...searchParams,
    enabled: submitted && tab !== 4,
  });

  const handleSearch = async () => {
    setArriveMessage(null);
    if (tab === 4) {
      setApptError(null);
      setApptLookup(null);
      const id = appointmentId.trim();
      if (!isValidUuid(id)) {
        setApptError('Enter a valid appointment ID (UUID).');
        return;
      }
      setApptLoading(true);
      try {
        const result = await lookupDeskAppointment(id);
        setApptLookup(result ?? null);
        if (!result) setApptError('Appointment not found.');
      } catch (e) {
        setApptError(parseApiError(e).message);
      } finally {
        setApptLoading(false);
      }
      return;
    }
    setSubmitted(true);
    void refetch();
  };

  const openPatient = (patient: HospitalPatientSummary) => {
    navigate(`/reception/patients/${patient.patientId}`);
  };

  const handleArrive = async () => {
    if (!apptLookup) return;
    setArrivePending(true);
    setArriveMessage(null);
    try {
      const result = await arriveAppointment({ appointmentId: apptLookup.appointmentId });
      setArriveMessage(
        `Arrived — token ${result.queueEntry.tokenDisplay}. Status ${result.appointmentStatus ?? 'ARRIVED'}.`,
      );
      setApptLookup({ ...apptLookup, canArrive: false, appointmentStatus: 'ARRIVED' });
    } catch (e) {
      setApptError(parseApiError(e).message);
    } finally {
      setArrivePending(false);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Patient Search"
        subtitle="Find by UHID, mobile, email, name (DOB optional), or appointment ID. Always open an existing record when it matches."
        actions={(
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/reception/patients/new')}
          >
            Register New
          </Button>
        )}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Search first. If a match exists, open that patient — do not register a second identity for the same person.
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tab} onChange={(_, value) => {
          setTab(value);
          setSubmitted(false);
          setApptLookup(null);
          setApptError(null);
          setArriveMessage(null);
        }}>
          <Tab label="UHID" />
          <Tab label="Mobile" />
          <Tab label="Email" />
          <Tab label="Name" />
          <Tab label="Appointment ID" />
        </Tabs>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {tab === 0 && (
            <TextField label="UHID" value={uhid} onChange={(e) => setUhid(e.target.value)} fullWidth />
          )}
          {tab === 1 && (
            <PhoneField
              label="Mobile number"
              value={mobile}
              onChange={setMobile}
              optional
            />
          )}
          {tab === 2 && (
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          )}
          {tab === 3 && (
            <>
              <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
              <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
              <TextField
                label="Date of birth (optional)"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </>
          )}
          {tab === 4 && (
            <TextField
              label="Appointment ID"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="UUID from booking confirmation"
              fullWidth
            />
          )}
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => void handleSearch()}
            disabled={isFetching || apptLoading}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      {isError && tab !== 4 && <Alert severity="error">{parseApiError(error).message}</Alert>}
      {apptError && <Alert severity="error" sx={{ mb: 2 }}>{apptError}</Alert>}
      {arriveMessage && <Alert severity="success" sx={{ mb: 2 }}>{arriveMessage}</Alert>}

      {tab === 4 && apptLookup && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>{apptLookup.patientName}</Typography>
          <Typography variant="body2">UHID: {apptLookup.uhid ?? '—'}</Typography>
          <Typography variant="body2">Mobile: {apptLookup.primaryPhone ?? '—'}</Typography>
          <Typography variant="body2">
            Appointment: {appointmentLabel(apptLookup.appointmentStatus)}
            {apptLookup.scheduledAt
              ? ` · ${new Date(apptLookup.scheduledAt).toLocaleString()}`
              : ''}
          </Typography>
          <Typography variant="body2">
            Doctor: {apptLookup.doctorName}
            {apptLookup.hospitalName ? ` · ${apptLookup.hospitalName}` : ''}
            {apptLookup.branchName ? ` — ${apptLookup.branchName}` : ''}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={() => navigate(`/reception/patients/${apptLookup.patientId}`)}>
              Open patient
            </Button>
            {apptLookup.canArrive ? (
              <Button variant="contained" disabled={arrivePending} onClick={() => void handleArrive()}>
                {arrivePending ? 'Arriving…' : 'Mark arrived (issue token)'}
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => navigate('/reception/dashboard')}>
                Open OPD queue
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {submitted && tab !== 4 && !isFetching && data && (
        <Paper sx={{ p: 3 }}>
          {data.content.length === 0 ? (
            <Box>
              <Typography color="text.secondary" gutterBottom>
                No patient found. Try another identifier before registering — duplicates create broken records.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" onClick={() => navigate('/reception/patients/new')}>
                  Register new patient
                </Button>
                <Button variant="text" onClick={() => { setTab(1); setSubmitted(false); }}>
                  Try mobile search
                </Button>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2}>
              {data.content.map((patient) => (
                <Paper key={patient.patientId} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6">{patient.legalName || 'Unnamed patient'}</Typography>
                      <Typography variant="body2">UHID: {patient.uhid ?? '—'}</Typography>
                      <Typography variant="body2">DOB: {formatPatientDob(patient.dateOfBirth)}</Typography>
                      <Typography variant="body2">Mobile: {formatPatientPhone(patient.primaryPhone)}</Typography>
                      <Typography variant="body2">Email: {patient.email ?? '—'}</Typography>
                      <Typography variant="body2">Gender: {patient.gender ?? '—'}</Typography>
                    </Box>
                    <Button variant="contained" onClick={() => openPatient(patient)}>Open existing</Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </AnimatedPage>
  );
}
