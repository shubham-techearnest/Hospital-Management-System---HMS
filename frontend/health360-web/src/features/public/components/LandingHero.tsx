import { useState } from 'react';
import { Box, Container, Stack, useMediaQuery, useTheme } from '@mui/material';
import {
  getRoleDashboardPathFromRoles,
  resolvePrimaryRole,
  type AppRole,
} from '@/shared/auth/roleNavigation';
import { brand } from '@/shared/brand/brand';
import { APP_NAVBAR_HEIGHT } from '@/shared/layout/PortalTopBar';
import { HeroContent } from './hero/HeroContent';
import { HeroAudienceActions } from './hero/HeroAudienceActions';
import { HeroCapabilityStrip } from './hero/HeroCapabilityStrip';
import { Health360ProductVisual } from './hero/Health360ProductVisual';
import type { HeroAudienceFocus, LandingHeroProps } from './hero/types';

const ROLE_LABELS: Record<AppRole, string> = {
  PATIENT: 'Patient portal',
  DOCTOR: 'Doctor portal',
  HOSPITAL_ADMIN: 'Hospital portal',
  PLATFORM_ADMIN: 'Admin portal',
  LAB_TECHNICIAN: 'Lab portal',
  RADIOLOGY_TECHNICIAN: 'Radiology portal',
  OT_COORDINATOR: 'Operation theatre portal',
  PHARMACIST: 'Pharmacy portal',
  ASSET_MANAGER: 'Asset manager portal',
  RECEPTIONIST: 'Reception portal',
  NURSE: 'Nursing portal',
  ICU_NURSE: 'ICU nursing portal',
};

export type { LandingHeroProps };

export function LandingHero({ isAuthenticated, displayName, roles }: LandingHeroProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [audienceFocus, setAudienceFocus] = useState<HeroAudienceFocus>('none');

  const dashboardPath = getRoleDashboardPathFromRoles(roles);
  const primaryRole = resolvePrimaryRole(roles);
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : 'Your portal';

  return (
    <Box
      component="section"
      aria-label={`${brand.shortName} connected healthcare overview`}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        minHeight: {
          xs: `calc(88svh - ${APP_NAVBAR_HEIGHT}px)`,
          md: `calc(90dvh - ${APP_NAVBAR_HEIGHT}px)`,
        },
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: `
          radial-gradient(ellipse 70% 55% at 88% 12%, rgba(113, 79, 255, 0.14) 0%, transparent 58%),
          radial-gradient(ellipse 45% 40% at 8% 88%, rgba(136, 82, 204, 0.09) 0%, transparent 55%),
          radial-gradient(circle at 72% 68%, rgba(207, 200, 255, 0.35) 0%, transparent 42%),
          linear-gradient(165deg, #f7f6ff 0%, #ffffff 45%, #faf9ff 100%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(113, 79, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(113, 79, 255, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 75% 70% at 70% 45%, black 20%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          py: { xs: 3.5, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 0.95fr) minmax(300px, 1.05fr)',
              lg: 'minmax(0, 0.9fr) minmax(340px, 1.1fr)',
            },
            gap: { xs: 3.5, md: 3, lg: 4 },
            alignItems: 'center',
          }}
        >
          <Stack spacing={{ xs: 2.25, md: 2.5 }}>
            <HeroContent
              isAuthenticated={isAuthenticated}
              displayName={displayName}
              roleLabel={roleLabel}
            />
            <HeroAudienceActions
              isAuthenticated={isAuthenticated}
              dashboardPath={dashboardPath}
              audienceFocus={audienceFocus}
              onAudienceFocus={setAudienceFocus}
            />
            <HeroCapabilityStrip />
          </Stack>

          <Health360ProductVisual
            audienceFocus={audienceFocus}
            compact={!isLgUp && isMdUp}
          />
        </Box>
      </Container>
    </Box>
  );
}
