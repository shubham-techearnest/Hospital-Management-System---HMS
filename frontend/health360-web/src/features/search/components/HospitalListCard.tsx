import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import type { HospitalSearchResult } from '@/features/search/api/searchApi';

interface HospitalListCardProps {
  hospital: HospitalSearchResult;
  travelTimeMinutes?: number;
}

function estimateDriveMinutes(distanceKm?: number, travelTimeMinutes?: number) {
  if (travelTimeMinutes != null) return travelTimeMinutes;
  if (distanceKm != null) return Math.round(distanceKm * 2.5);
  return null;
}

export function HospitalListCard({ hospital, travelTimeMinutes }: HospitalListCardProps) {
  const driveMinutes = estimateDriveMinutes(hospital.distanceKm, travelTimeMinutes);
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6">{hospital.name}</Typography>
            <Typography color="text.secondary">
              {hospital.hospitalType?.replace(/_/g, ' ') ?? 'Hospital'}
              {hospital.city ? ` · ${hospital.city}` : ''}
            </Typography>
            {hospital.branchName ? (
              <Typography sx={{ mt: 1 }}>
                {hospital.branchName}
                {hospital.addressLine1 ? ` — ${hospital.addressLine1}` : ''}
              </Typography>
            ) : null}
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
              {hospital.distanceKm != null ? (
                <Chip label={`${hospital.distanceKm} km away`} size="small" color="primary" variant="outlined" />
              ) : null}
              {driveMinutes != null ? (
                <Chip label={`~${driveMinutes} min drive`} size="small" variant="outlined" />
              ) : null}
              {hospital.emergencyAvailable24x7 ? <Chip label="24×7 Emergency" size="small" color="error" /> : null}
              {hospital.icuAvailable ? <Chip label="ICU" size="small" variant="outlined" /> : null}
              {hospital.ambulanceAvailable ? <Chip label="Ambulance" size="small" variant="outlined" /> : null}
              {hospital.averageRating != null ? (
                <Chip label={`★ ${hospital.averageRating} (${hospital.reviewCount})`} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Box>
          <Button
            variant="outlined"
            component={RouterLink}
            to={`/hospitals/${hospital.hospitalId}`}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            View profile
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
