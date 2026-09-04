import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import type { DoctorSearchResult } from '@/features/search/api/searchApi';

const PRIMARY = '#1D4ED8';

interface DoctorListCardProps {
  doctor: DoctorSearchResult;
  travelTimeMinutes?: number;
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

export function DoctorListCard({ doctor }: DoctorListCardProps) {
  const navigate = useNavigate();
  const specialty = doctor.specialization ?? 'General consultation';
  const locationLine = [doctor.hospitalName ?? doctor.branchName, doctor.city].filter(Boolean).join(' · ');
  const langs = (doctor.languages ?? []).slice(0, 3);
  const fee =
    doctor.minConsultationFee != null
      ? `${doctor.feeCurrency === 'USD' ? '$' : '₹'}${doctor.minConsultationFee}`
      : null;
  const experienceLine = [
    doctor.yearsExperience != null ? `${doctor.yearsExperience} years experience` : null,
    langs.length ? langs.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
        height: '100%',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(29,78,216,0.12)',
          borderColor: '#BFDBFE',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.75 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '10px',
            bgcolor: PRIMARY,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {initials(doctor.name)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                  {doctor.name}
                </Typography>
                <VerifiedIcon sx={{ fontSize: 16, color: PRIMARY }} />
              </Box>
              <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.25 }}>{specialty}</Typography>
            </Box>
            {doctor.averageRating != null ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, flexShrink: 0 }}>
                <StarRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  {doctor.averageRating.toFixed(1)}
                </Typography>
                {doctor.reviewCount > 0 ? (
                  <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>({doctor.reviewCount})</Typography>
                ) : null}
              </Box>
            ) : null}
          </Box>

          {locationLine ? (
            <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.75 }} noWrap>
              {locationLine}
            </Typography>
          ) : null}
          {experienceLine ? (
            <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.35 }}>{experienceLine}</Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {fee ? (
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            {fee}{' '}
            <Typography component="span" sx={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>
              / consultation
            </Typography>
          </Typography>
        ) : (
          <Box />
        )}
        {doctor.availableToday ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: '#16A34A' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>Today</Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(buildBookUrl(doctor))}
          sx={{
            bgcolor: PRIMARY,
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            boxShadow: 'none',
            py: 1,
            '&:hover': { bgcolor: '#1E40AF', boxShadow: 'none' },
          }}
        >
          Book Appointment
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to={`/doctors/${doctor.doctorId}`}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            borderColor: '#E2E8F0',
            color: '#374151',
            bgcolor: '#F8FAFC',
            whiteSpace: 'nowrap',
            px: 2,
            '&:hover': { borderColor: '#BFDBFE', bgcolor: '#EFF6FF' },
          }}
        >
          View Profile
        </Button>
      </Box>
    </Box>
  );
}
