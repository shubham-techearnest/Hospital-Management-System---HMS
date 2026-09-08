import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import type { DoctorSearchResult } from '@/features/search/api/searchApi';
import { brand } from '@/shared/brand/brand';

interface DoctorListCardProps {
  doctor: DoctorSearchResult;
  travelTimeMinutes?: number;
  profilePath?: (doctorId: string) => string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function buildBookUrl(doctor: DoctorSearchResult) {
  const params = new URLSearchParams();
  params.set('doctorId', doctor.doctorId);
  if (doctor.hospitalId) params.set('hospitalId', doctor.hospitalId);
  if (doctor.branchId) params.set('branchId', doctor.branchId);
  if (doctor.hospitalName) params.set('hospitalName', doctor.hospitalName);
  if (doctor.branchName) params.set('branchName', doctor.branchName);
  if (doctor.name) params.set('doctorName', doctor.name);
  return `/patient/request-opd?${params.toString()}`;
}

export function DoctorListCard({
  doctor,
  profilePath = (id) => `/patient/doctors/${id}`,
}: DoctorListCardProps) {
  const navigate = useNavigate();
  const specialty = doctor.specialization ?? 'General consultation';
  const locationLine = [doctor.hospitalName ?? doctor.branchName, doctor.city].filter(Boolean).join(' · ');
  const metaParts = [
    doctor.yearsExperience != null ? `${doctor.yearsExperience} yrs` : null,
    (doctor.languages ?? []).slice(0, 2).join(', ') || null,
    doctor.availableToday ? 'Available today' : null,
  ].filter(Boolean);
  const fee =
    doctor.minConsultationFee != null
      ? `${doctor.feeCurrency === 'USD' ? '$' : '₹'}${doctor.minConsultationFee}`
      : null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '56px 1fr',
          sm: '64px minmax(0, 1fr) auto',
        },
        columnGap: { xs: 1.5, sm: 2 },
        rowGap: { xs: 1.5, sm: 0 },
        alignItems: 'center',
        px: { xs: 1.75, sm: 2.25 },
        py: { xs: 1.75, sm: 2 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          borderColor: brand.colors.primaryLight,
          bgcolor: brand.colors.canvas,
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          borderRadius: '50%',
          bgcolor: brand.colors.secondaryLight,
          color: brand.colors.primaryDark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: { xs: 15, sm: 17 },
          letterSpacing: 0.3,
          flexShrink: 0,
          gridRow: { xs: '1 / 2', sm: 'auto' },
        }}
      >
        {initials(doctor.name)}
      </Box>

      <Box sx={{ minWidth: 0, gridColumn: { xs: '2 / 3', sm: 'auto' } }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            component={RouterLink}
            to={profilePath(doctor.doctorId)}
            sx={{
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
              textDecoration: 'none',
              '&:hover': { color: 'primary.main', textDecoration: 'underline', textUnderlineOffset: 3 },
            }}
          >
            {doctor.name}
          </Typography>
          {doctor.averageRating != null ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
              <StarRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
              <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                {doctor.averageRating.toFixed(1)}
              </Typography>
              {doctor.reviewCount > 0 ? (
                <Typography component="span" sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                  ({doctor.reviewCount})
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Typography sx={{ mt: 0.35, fontSize: 13.5, color: 'primary.dark', fontWeight: 500 }}>
          {specialty}
        </Typography>

        {locationLine ? (
          <Typography
            sx={{
              mt: 0.4,
              fontSize: 12.5,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {locationLine}
          </Typography>
        ) : null}

        {metaParts.length > 0 ? (
          <Typography sx={{ mt: 0.45, fontSize: 12.5, color: 'text.secondary' }}>
            {metaParts.join(' · ')}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          gridColumn: { xs: '1 / -1', sm: 'auto' },
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'column' },
          alignItems: { xs: 'center', sm: 'flex-end' },
          justifyContent: { xs: 'space-between', sm: 'center' },
          gap: { xs: 1.25, sm: 1.25 },
          pt: { xs: 0.25, sm: 0 },
          borderTop: { xs: '1px solid', sm: 'none' },
          borderColor: 'divider',
          mt: { xs: 0.25, sm: 0 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: 72 }}>
          {fee ? (
            <>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                {fee}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.15 }}>
                consultation
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Fee on request</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            component={RouterLink}
            to={profilePath(doctor.doctorId)}
            size="small"
            color="primary"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 0.5,
              minWidth: 0,
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disableElevation
            onClick={() => navigate(buildBookUrl(doctor))}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 1.75,
              py: 0.75,
            }}
          >
            Book
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
