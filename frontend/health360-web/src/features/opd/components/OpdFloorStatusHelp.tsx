import { Alert } from '@mui/material';

export function OpdFloorStatusHelp({ audience }: { audience: 'desk' | 'doctor' | 'patient' }) {
  const message =
    audience === 'desk'
      ? 'This board is the live floor. Call the next token here. When the doctor starts or completes the consult, Queue and Consult update together — you do not need a second status. Checkout after the doctor finalizes the note and signs the e-prescription.'
      : audience === 'doctor'
        ? 'Start consultation when the patient is with you. Reception and hospital OPD will show In service. Complete the visit when the consult is done so the desk can bill.'
        : 'Book a slot from Book appointment. Your token appears after the desk checks you in. Status here matches the hospital queue.';

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}
