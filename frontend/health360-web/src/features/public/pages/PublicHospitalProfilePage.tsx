import { useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import {
  fetchHospitalReviews,
  fetchPublicHospitalProfile,
} from '@/features/public/api/publicProfileApi';
import { BranchLocationsMap } from '@/features/public/components/BranchLocationsMap';
import { PublicProfileLayout } from '@/features/public/components/PublicProfileLayout';
import { ReviewsSection } from '@/features/public/components/ReviewsSection';
import { galleryImageSrc } from '@/features/hospital/api/hospitalApi';
import { brand } from '@/shared/brand/brand';

export function PublicHospitalProfilePage() {
  const { hospitalId = '' } = useParams<{ hospitalId: string }>();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public', 'hospital', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — ${brand.name}`;
    }
    return () => {
      document.title = brand.name;
    };
  }, [profile?.name]);

  if (isLoading) {
    return (
      <PublicProfileLayout>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </PublicProfileLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicProfileLayout>
        <Alert severity="error">Hospital profile not found.</Alert>
      </PublicProfileLayout>
    );
  }

  return (
    <PublicProfileLayout>
      <Button component={RouterLink} to="/" sx={{ mb: 2 }}>← Back</Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>{profile.name}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {profile.hospitalType?.replace(/_/g, ' ') ?? 'Hospital'}
          {profile.establishedYear ? ` · Est. ${profile.establishedYear}` : ''}
          {profile.accreditation ? ` · ${profile.accreditation}` : ''}
        </Typography>
        {profile.averageRating != null ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating value={profile.averageRating} precision={0.1} readOnly size="small" />
            <Typography>{profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)</Typography>
          </Stack>
        ) : null}
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {profile.emergencyInfo.emergencyAvailable24x7 ? (
            <Chip label="24×7 Emergency" color="error" size="small" />
          ) : null}
          {profile.emergencyInfo.icuAvailable ? <Chip label="ICU" size="small" variant="outlined" /> : null}
          {profile.emergencyInfo.ambulanceAvailable ? (
            <Chip label="Ambulance" size="small" variant="outlined" />
          ) : null}
          {profile.totalBedCount != null ? (
            <Chip label={`${profile.totalBedCount} beds`} size="small" variant="outlined" />
          ) : null}
        </Stack>
      </Paper>

      {profile.description ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>About</Typography>
          <Typography color="text.secondary">{profile.description}</Typography>
        </Box>
      ) : null}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Locations</Typography>
        <BranchLocationsMap branches={profile.branches} />
        <Stack spacing={1} sx={{ mt: 2 }}>
          {profile.branches.map((branch) => (
            <Typography key={branch.id}>
              <strong>{branch.name}</strong> — {branch.addressLine1}, {branch.city}, {branch.state} {branch.pincode}
              {branch.phone ? ` · ${branch.phone}` : ''}
            </Typography>
          ))}
        </Stack>
      </Box>

      {profile.departments.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Departments</Typography>
          <Stack spacing={1}>
            {profile.departments.map((dept) => (
              <Typography key={dept.id}>
                <strong>{dept.name}</strong>
                {dept.floor ? ` (Floor ${dept.floor})` : ''}
                {dept.description ? ` — ${dept.description}` : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {(profile.facilities?.length ?? 0) > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Facilities</Typography>
          <Stack spacing={1}>
            {profile.facilities.map((f) => (
              <Typography key={f.id}>
                <strong>{f.name}</strong> ({f.category.replace(/_/g, ' ')})
                {f.description ? ` — ${f.description}` : ''}
                {!f.available ? ' · Currently unavailable' : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {(profile.gallery?.length ?? 0) > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Gallery</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {profile.gallery.map((img) => (
              <Paper key={img.id} variant="outlined" sx={{ overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={galleryImageSrc(img.imageUrl)}
                  alt={img.caption ?? 'Hospital photo'}
                  sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                />
                {img.caption ? (
                  <Typography variant="body2" sx={{ p: 1.5 }}>{img.caption}</Typography>
                ) : null}
              </Paper>
            ))}
          </Box>
        </Box>
      ) : null}

      {profile.featuredDoctors.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Doctors at this hospital</Typography>
          <Stack spacing={1.5}>
            {profile.featuredDoctors.map((doctor) => (
              <Paper key={doctor.doctorId} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography fontWeight={600}>{doctor.name}</Typography>
                    <Typography color="text.secondary">{doctor.specialization ?? 'General consultation'}</Typography>
                    {doctor.averageRating != null ? (
                      <Typography variant="body2">★ {doctor.averageRating.toFixed(1)} ({doctor.reviewCount})</Typography>
                    ) : null}
                  </Box>
                  <Button component={RouterLink} to={`/doctors/${doctor.doctorId}`} variant="outlined" size="small">
                    View profile
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      ) : null}

      <ReviewsSection
        queryKey={['public', 'hospital', hospitalId, 'reviews']}
        fetchReviews={(page) => fetchHospitalReviews(hospitalId, page)}
      />
    </PublicProfileLayout>
  );
}
