import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { HospitalSearchResult } from '@/features/search/api/searchApi';

const PRIMARY = '#1D4ED8';

interface HospitalListCardProps {
  hospital: HospitalSearchResult;
  travelTimeMinutes?: number;
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.floor(rating);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarRoundedIcon
          key={i}
          sx={{ fontSize: 12, color: i <= filled ? '#F59E0B' : '#D1D5DB' }}
        />
      ))}
    </Box>
  );
}

function facilityTags(hospital: HospitalSearchResult) {
  const tags: string[] = [];
  if (hospital.hospitalType) tags.push(hospital.hospitalType.replace(/_/g, ' '));
  if (hospital.icuAvailable) tags.push('ICU');
  if (hospital.ambulanceAvailable) tags.push('Ambulance');
  if (hospital.emergencyAvailable24x7) tags.push('Emergency');
  return tags;
}

export function HospitalListCard({ hospital }: HospitalListCardProps) {
  const location = [hospital.addressLine1, hospital.branchName, hospital.city].filter(Boolean).join(', ');
  const tags = facilityTags(hospital);

  return (
    <Box
      component={RouterLink}
      to={`/hospitals/${hospital.hospitalId}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2.5,
        bgcolor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
          borderColor: '#BFDBFE',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#EFF6FF',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LocalHospitalOutlinedIcon sx={{ fontSize: 24, color: PRIMARY }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{hospital.name}</Typography>
            <VerifiedIcon sx={{ fontSize: 16, color: PRIMARY, flexShrink: 0 }} />
          </Box>
          {location ? (
            <Typography
              sx={{
                fontSize: 12,
                color: '#64748B',
                mt: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <PlaceOutlinedIcon sx={{ fontSize: 12 }} />
              {location}
            </Typography>
          ) : null}
        </Box>
        {hospital.averageRating != null ? <StarRating rating={hospital.averageRating} /> : null}
      </Box>

      {tags.length > 0 ? (
        <Box>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 0.75,
            }}
          >
            Departments
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {tags.slice(0, 4).map((tag) => (
              <Box
                key={tag}
                component="span"
                sx={{
                  fontSize: 11,
                  color: '#374151',
                  bgcolor: '#F1F5F9',
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                }}
              >
                {tag}
              </Box>
            ))}
            {tags.length > 4 ? (
              <Box
                component="span"
                sx={{
                  fontSize: 11,
                  color: '#94A3B8',
                  bgcolor: '#F1F5F9',
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                }}
              >
                +{tags.length - 4}
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: 1.5,
          borderTop: '1px solid #F1F5F9',
          fontSize: 12,
          color: '#64748B',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocalHospitalOutlinedIcon sx={{ fontSize: 14 }} />
          {hospital.distanceKm != null ? `${hospital.distanceKm} km` : hospital.city ?? 'Hospital'}
        </Box>
        {hospital.emergencyAvailable24x7 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#DC2626', fontWeight: 600 }}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            24/7 Emergency
          </Box>
        ) : (
          <Box />
        )}
        <Button
          size="small"
          onClick={(e) => e.preventDefault()}
          component={RouterLink}
          to={`/hospitals/${hospital.hospitalId}`}
          sx={{
            height: 28,
            px: 1.5,
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: '6px',
            bgcolor: '#fff',
            color: '#374151',
            border: '1px solid #D1D5DB',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#F9FAFB', boxShadow: 'none' },
          }}
        >
          View Hospital
        </Button>
      </Box>
    </Box>
  );
}
