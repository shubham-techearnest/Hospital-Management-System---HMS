import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material';
import { DESK_FLOW_STEPS, VISIT_FLOW_STEPS } from '@/features/opd/utils/visitFlowCopy';

type Variant = 'patient' | 'desk';

type Props = {
  variant: Variant;
  compact?: boolean;
};

export function VisitFlowGuide({ variant, compact = false }: Props) {
  const steps = variant === 'patient' ? VISIT_FLOW_STEPS : DESK_FLOW_STEPS;
  const title = variant === 'patient' ? 'How a hospital visit works' : 'Reception — pick the right action';

  if (compact) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {variant === 'patient'
            ? 'Request OPD → wait in queue → consult → bill.'
            : 'New OPD registers patients · Queue tab manages the live line.'}
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {steps.map((s) => (
          <Box key={s.step} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                minWidth: 20,
                height: 20,
                lineHeight: '20px',
                textAlign: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                flexShrink: 0,
              }}
            >
              {s.step}
            </Typography>
            <Box>
              <Typography variant="body2" fontWeight={600}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.body}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Alert>
  );
}
