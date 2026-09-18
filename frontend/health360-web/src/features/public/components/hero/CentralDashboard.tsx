import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import { Health360Mark } from '@/shared/brand/Health360Mark';
import type { HeroAudienceFocus } from './types';
import { heroScaleIn, reducedMotionSx } from './heroMotion';

interface CentralDashboardProps {
  audienceFocus: HeroAudienceFocus;
}

export function CentralDashboard({ audienceFocus }: CentralDashboardProps) {
  const patientEmphasis = audienceFocus === 'patient' || audienceFocus === 'none';
  const hospitalEmphasis = audienceFocus === 'hospital' || audienceFocus === 'none';

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: { xs: 320, sm: 340, md: 360 },
        mx: 'auto',
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(113, 79, 255, 0.16)',
        boxShadow: '0 24px 56px rgba(113, 79, 255, 0.14)',
        overflow: 'hidden',
        animation: `${heroScaleIn} 0.65s 0.18s cubic-bezier(0.16, 1, 0.3, 1) both`,
        ...reducedMotionSx,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #714fff 0%, #8852cc 100%)',
          color: 'common.white',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Health360Mark size={28} motion="idle" />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Health360
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', opacity: 0.9, lineHeight: 1.2 }}>
              Connected Healthcare
            </Typography>
          </Box>
        </Stack>
        <Chip
          label="Preview"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: 'rgba(255,255,255,0.18)',
            color: 'common.white',
            border: '1px solid rgba(255,255,255,0.28)',
          }}
        />
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Good morning
        </Typography>
        <Typography fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1.5, color: 'secondary.main' }}>
          Healthcare overview
        </Typography>

        <Box
          sx={{
            p: 1.35,
            mb: 1.35,
            borderRadius: 2,
            bgcolor: 'rgba(113, 79, 255, 0.06)',
            border: '1px solid rgba(113, 79, 255, 0.12)',
            opacity: patientEmphasis ? 1 : 0.45,
            transition: 'opacity 0.25s ease',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'common.white',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Upcoming appointment
              </Typography>
              <Typography fontWeight={700} sx={{ fontSize: '0.9rem', lineHeight: 1.3 }}>
                Dr. A. Sharma
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cardiology · Today · 11:30 AM
              </Typography>
            </Box>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.25 }} />
          </Stack>
        </Box>

        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{ display: 'block', mb: 0.75, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Health activity
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
          {[
            { icon: <EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Appointments', tone: 'patient' as const },
            { icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Reports', tone: 'patient' as const },
            { icon: <LocalPharmacyOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Rx', tone: 'shared' as const },
          ].map((item) => {
            const active =
              audienceFocus === 'none' ||
              item.tone === 'shared' ||
              (item.tone === 'patient' && audienceFocus === 'patient');
            return (
              <Box
                key={item.label}
                sx={{
                  flex: 1,
                  py: 0.85,
                  px: 0.5,
                  borderRadius: 1.5,
                  textAlign: 'center',
                  bgcolor: 'rgba(15, 11, 40, 0.03)',
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: active ? 1 : 0.4,
                  transition: 'opacity 0.25s ease',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 0.25 }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Button
          fullWidth
          size="small"
          variant="contained"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
          tabIndex={-1}
          sx={{
            py: 0.9,
            fontWeight: 700,
            boxShadow: 'none',
            opacity: hospitalEmphasis && audienceFocus === 'hospital' ? 0.85 : 1,
          }}
        >
          View health journey
        </Button>
      </Box>
    </Box>
  );
}
