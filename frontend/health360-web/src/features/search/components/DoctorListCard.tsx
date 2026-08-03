import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { DoctorSearchResult } from '@/features/search/api/searchApi';

interface DoctorListCardProps {
  doctor: DoctorSearchResult;
  travelTimeMinutes?: number;
}

function estimateDriveMinutes(distanceKm?: number, travelTimeMinutes?: number) {
  if (travelTimeMinutes != null) return travelTimeMinutes;
  if (distanceKm != null) return Math.round(distanceKm * 2.5);
  return null;
}

export function DoctorListCard({ doctor, travelTimeMinutes }: DoctorListCardProps) {
  const navigate = useNavigate();
  const driveMinutes = estimateDriveMinutes(doctor.distanceKm, travelTimeMinutes);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">{doctor.name}</Typography>
            <Typography color="text.secondary">{doctor.specialization ?? 'General consultation'}</Typography>
            <Typography sx={{ mt: 1 }}>
              {doctor.hospitalName}
              {doctor.branchName ? ` — ${doctor.branchName}` : ''}
              {doctor.city ? ` (${doctor.city})` : ''}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {doctor.availableToday ? <Chip label="Available today" color="success" size="small" /> : null}
              {doctor.distanceKm != null ? (
                <Chip label={`${doctor.distanceKm} km`} size="small" variant="outlined" />
              ) : null}
              {driveMinutes != null ? (
                <Chip label={`~${driveMinutes} min drive`} size="small" variant="outlined" />
              ) : null}
              {doctor.minConsultationFee != null ? (
                <Chip
                  label={`From ${doctor.feeCurrency ?? 'INR'} ${doctor.minConsultationFee}`}
                  size="small"
                  variant="outlined"
                />
              ) : null}
              {doctor.averageRating != null ? (
                <Chip label={`★ ${doctor.averageRating}`} size="small" variant="outlined" />
              ) : null}
              {doctor.yearsExperience != null ? (
                <Chip label={`${doctor.yearsExperience}+ yrs`} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Box>
          <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to={`/doctors/${doctor.doctorId}`}
            >
              View profile
            </Button>
            <Button variant="contained" onClick={() => navigate(`/patient/book/${doctor.doctorId}`)}>
              Book appointment
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
