import { Alert } from '@mui/material';
import { opdFloorHint } from '@/features/opd/utils/visitFlowCopy';

/** One-line contextual hint (full guide: VisitFlowGuide). */
export function OpdFloorStatusHelp({ audience }: { audience: 'desk' | 'doctor' | 'patient' }) {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      {opdFloorHint(audience)}
    </Alert>
  );
}
