import { Alert, AlertTitle, Stack, Typography } from '@mui/material';

export function ReceptionOpdFlowBanner() {
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle>Which desk action?</AlertTitle>
      <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
        <Typography component="li" variant="body2">
          <strong>Walk-in today</strong> — patient has no booking; issue a queue token now.
        </Typography>
        <Typography component="li" variant="body2">
          <strong>Book future appointment</strong> — reserves a slot; patient is <em>not</em> on today&apos;s queue until arrival day.
        </Typography>
        <Typography component="li" variant="body2">
          <strong>Check in booked appointment</strong> — patient already has a slot today; issue token without a new walk-in.
        </Typography>
      </Stack>
    </Alert>
  );
}
