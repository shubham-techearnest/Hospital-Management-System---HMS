import { Box } from '@mui/material';
import type { HeroAudienceFocus } from './types';
import { CentralDashboard } from './CentralDashboard';
import { HospitalOperationsCard } from './HospitalOperationsCard';
import { AppointmentCard } from './AppointmentCard';
import { HealthDataCard } from './HealthDataCard';
import { AnalyticsCard } from './AnalyticsCard';
import { ConnectionNetwork } from './ConnectionNetwork';
import { heroFadeIn, reducedMotionSx } from './heroMotion';

interface Health360ProductVisualProps {
  audienceFocus: HeroAudienceFocus;
  compact?: boolean;
}

export function Health360ProductVisual({ audienceFocus, compact = false }: Health360ProductVisualProps) {
  return (
    <Box
      aria-label="Health360 product ecosystem preview"
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 360, sm: 420, md: 480 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${heroFadeIn} 0.6s 0.12s ease both`,
        ...reducedMotionSx,
      }}
    >
      <ConnectionNetwork audienceFocus={audienceFocus} />
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, py: { xs: 3, md: 4 } }}>
        <CentralDashboard audienceFocus={audienceFocus} />
        <HospitalOperationsCard audienceFocus={audienceFocus} compact={compact} />
        <AppointmentCard audienceFocus={audienceFocus} />
        <HealthDataCard audienceFocus={audienceFocus} />
        {!compact ? <AnalyticsCard audienceFocus={audienceFocus} /> : null}
      </Box>
    </Box>
  );
}
