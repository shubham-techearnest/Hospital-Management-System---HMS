import { Box, Typography } from '@mui/material';
import type { DocumentPatientBlock as PatientBlock } from '@/features/documents/api/documentsApi';

type Props = {
  patient: PatientBlock;
};

export function DocumentPatientBlock({ patient }: Props) {
  return (
    <Box
      className="doc-patient"
      sx={{
        mb: 2,
        p: 1.5,
        border: '1px solid #bbb',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 0.75,
      }}
    >
      <Typography variant="body2">
        <strong>Patient:</strong> {patient.patientName}
      </Typography>
      <Typography variant="body2">
        <strong>UHID:</strong> {patient.uhid ?? '—'}
      </Typography>
      <Typography variant="body2">
        <strong>Age / Sex:</strong> {patient.ageSex ?? '—'}
      </Typography>
      <Typography variant="body2">
        <strong>Encounter:</strong> {patient.encounterNumber ?? '—'}
      </Typography>
      {patient.visitDate ? (
        <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
          <strong>Visit date:</strong> {patient.visitDate}
        </Typography>
      ) : null}
    </Box>
  );
}
