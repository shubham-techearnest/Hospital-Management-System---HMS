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
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export function PatientSearchPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [uhid, setUhid] = useState('');
  const [mobile, setMobile] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const searchParams = tab === 0
    ? { uhid: submitted ? uhid : undefined }
    : tab === 1
      ? { mobile: submitted ? mobile : undefined }
      : {
          firstName: submitted ? firstName : undefined,
          lastName: submitted ? lastName : undefined,
          dateOfBirth: submitted ? dateOfBirth : undefined,
        };

  const { data, isFetching, isError, error, refetch } = usePatientSearch({
    ...searchParams,
    enabled: submitted,
  });

  const handleSearch = () => {
    setSubmitted(true);
    void refetch();
  };

  const openPatient = (patient: HospitalPatientSummary) => {
    navigate(`/reception/patients/${patient.patientId}`);
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Patient Search"
        subtitle="Find an existing patient by UHID, mobile, or name and date of birth."
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tab} onChange={(_, value) => { setTab(value); setSubmitted(false); }}>
          <Tab label="UHID" />
          <Tab label="Mobile" />
          <Tab label="Name + DOB" />
        </Tabs>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {tab === 0 && (
            <TextField label="UHID" value={uhid} onChange={(e) => setUhid(e.target.value)} fullWidth />
          )}
          {tab === 1 && (
            <TextField label="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} fullWidth />
          )}
          {tab === 2 && (
            <>
              <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
              <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
              <TextField
                label="Date of birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </>
          )}
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch} disabled={isFetching}>
            Search
          </Button>
        </Stack>
      </Paper>

      {isError && <Alert severity="error">{parseApiError(error).message}</Alert>}

      {submitted && !isFetching && data && (
        <Paper sx={{ p: 3 }}>
          {data.content.length === 0 ? (
            <Box>
              <Typography color="text.secondary" gutterBottom>No patient found.</Typography>
              <Button variant="outlined" onClick={() => navigate('/reception/patients/new')}>
                Register new patient
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {data.content.map((patient) => (
                <Paper key={patient.patientId} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6">{patient.legalName || 'Unnamed patient'}</Typography>
                      <Typography variant="body2">UHID: {patient.uhid ?? '—'}</Typography>
                      <Typography variant="body2">Mobile: {patient.primaryPhone ?? '—'}</Typography>
                      <Typography variant="body2">DOB: {patient.dateOfBirth ?? '—'}</Typography>
                    </Box>
                    <Button variant="contained" onClick={() => openPatient(patient)}>Open</Button>
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
