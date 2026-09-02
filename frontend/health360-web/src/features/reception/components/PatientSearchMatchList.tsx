import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { formatPatientDob, formatPatientPhone } from '@/features/reception/utils/patientDisplayUtils';

type Props = {
  patients: HospitalPatientSummary[];
  selectedPatientId?: string;
  onSelect: (patient: HospitalPatientSummary) => void;
  actionLabel?: string;
};

export function PatientSearchMatchList({
  patients,
  selectedPatientId,
  onSelect,
  actionLabel = 'Select',
}: Props) {
  if (patients.length === 0) return null;

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {patients.length === 1 ? 'Patient found — confirm details:' : `${patients.length} matches — pick the correct person:`}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>UHID</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => {
              const selected = selectedPatientId === patient.patientId;
              return (
                <TableRow
                  key={patient.patientId}
                  selected={selected}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onSelect(patient)}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{patient.legalName || 'Unnamed patient'}</Typography>
                  </TableCell>
                  <TableCell>{patient.uhid ?? '—'}</TableCell>
                  <TableCell>{formatPatientDob(patient.dateOfBirth)}</TableCell>
                  <TableCell>{formatPatientPhone(patient.primaryPhone)}</TableCell>
                  <TableCell sx={{ maxWidth: 180, wordBreak: 'break-all' }}>{patient.email ?? '—'}</TableCell>
                  <TableCell>{patient.gender ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={selected ? 'contained' : 'outlined'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(patient);
                      }}
                    >
                      {selected ? 'Selected' : actionLabel}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function PatientSelectedSummary({ patient }: { patient: HospitalPatientSummary }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50', borderColor: 'success.light' }}>
      <Typography variant="subtitle2" color="success.dark" gutterBottom>
        Selected patient
      </Typography>
      <Stack spacing={0.5}>
        <Typography variant="body1" fontWeight={700}>{patient.legalName}</Typography>
        <Typography variant="body2">UHID: {patient.uhid ?? 'Not assigned yet'}</Typography>
        <Typography variant="body2">DOB: {formatPatientDob(patient.dateOfBirth)}</Typography>
        <Typography variant="body2">Mobile: {formatPatientPhone(patient.primaryPhone)}</Typography>
        {patient.email ? <Typography variant="body2">Email: {patient.email}</Typography> : null}
        {patient.gender ? <Typography variant="body2">Gender: {patient.gender}</Typography> : null}
      </Stack>
    </Paper>
  );
}
