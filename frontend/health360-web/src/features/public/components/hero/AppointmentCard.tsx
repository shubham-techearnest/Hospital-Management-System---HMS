import { Box, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { HeroAudienceFocus } from './types';
import { FloatingCardShell } from './FloatingCardShell';

interface AppointmentCardProps {
  audienceFocus: HeroAudienceFocus;
}

export function AppointmentCard({ audienceFocus }: AppointmentCardProps) {
  return (
    <FloatingCardShell
      emphasis="patient"
      audienceFocus={audienceFocus}
      floatIndex={1}
      delayMs={400}
      sx={{
        top: { xs: 'auto', md: 118 },
        bottom: { xs: 72, md: 'auto' },
        left: { xs: -6, md: -28 },
        width: { xs: 168, md: 178 },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Appointment
      </Typography>
      <Typography fontWeight={800} sx={{ fontSize: '0.88rem', mt: 0.35, letterSpacing: '-0.02em' }}>
        Dr. A. Sharma
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.85 }}>
        Cardiology · Today · 11:30 AM
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
        <Typography variant="caption" fontWeight={700} color="success.main">
          Confirmed
        </Typography>
      </Stack>
      <Box
        className="hero-appt-action"
        sx={{
          mt: 1,
          pt: 0.85,
          borderTop: '1px solid',
          borderColor: 'divider',
          opacity: 0,
          maxHeight: 0,
          overflow: 'hidden',
          transition: 'opacity 0.2s ease, max-height 0.2s ease',
        }}
      >
        <Typography variant="caption" fontWeight={700} color="primary.main">
          Manage visit →
        </Typography>
      </Box>
    </FloatingCardShell>
  );
}
