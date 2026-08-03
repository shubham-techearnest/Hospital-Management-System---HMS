import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  fetchDoctorReviews,
  fetchPublicDoctorProfile,
} from '@/features/public/api/publicProfileApi';
import { PublicProfileLayout } from '@/features/public/components/PublicProfileLayout';
import { ReviewsSection } from '@/features/public/components/ReviewsSection';

export function PublicDoctorProfilePage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public', 'doctor', doctorId],
    queryFn: () => fetchPublicDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — Health360`;
    }
    return () => {
      document.title = 'Health360';
    };
  }, [profile?.name]);

  const handleBook = () => {
    if (user) {
      navigate(`/patient/book/${doctorId}`);
    } else {
      navigate('/login', { state: { from: `/patient/book/${doctorId}` } });
    }
  };

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
        <Alert severity="error" sx={{ mb: 2 }}>Doctor profile not found or is not publicly available.</Alert>
        <Button component={RouterLink} to="/login">Search doctors after signing in</Button>
      </PublicProfileLayout>
    );
  }

  return (
    <PublicProfileLayout>
      <Button component={RouterLink} to={user ? '/patient/book' : '/'} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Avatar
            src={profile.profilePhotoUrl}
            sx={{ width: 96, height: 96, fontSize: 36 }}
          >
            {profile.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="h4">
                {profile.title ? `${profile.title}. ` : ''}{profile.name}
              </Typography>
              {profile.verified ? (
                <Chip icon={<VerifiedIcon />} label="Verified" color="primary" size="small" />
              ) : null}
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {profile.specialization ?? 'Healthcare professional'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              {profile.averageRating != null ? (
                <>
                  <Rating value={profile.averageRating} precision={0.1} readOnly size="small" />
                  <Typography>{profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)</Typography>
                </>
              ) : (
                <Typography color="text.secondary">No ratings yet</Typography>
              )}
              {profile.yearsExperience != null ? (
                <Chip label={`${profile.yearsExperience} years experience`} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {profile.biography ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>About</Typography>
          <Typography color="text.secondary">{profile.biography}</Typography>
        </Box>
      ) : null}

      {profile.languages.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Languages</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {profile.languages.map((lang) => <Chip key={lang} label={lang} size="small" />)}
          </Stack>
        </Box>
      ) : null}

      {profile.qualifications.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Qualifications</Typography>
          <Stack spacing={1}>
            {profile.qualifications.map((q) => (
              <Typography key={q.id}>
                <strong>{q.degree}</strong> — {q.institution}
                {q.yearOfCompletion ? ` (${q.yearOfCompletion})` : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {(profile.awards?.length ?? 0) > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Awards</Typography>
          <Stack spacing={1}>
            {profile.awards.map((a) => (
              <Typography key={a.id}>
                <strong>{a.title}</strong>
                {[a.organization, a.awardYear].filter(Boolean).length > 0
                  ? ` — ${[a.organization, a.awardYear].filter(Boolean).join(', ')}`
                  : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {(profile.memberships?.length ?? 0) > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Professional Memberships</Typography>
          <Stack spacing={1}>
            {profile.memberships.map((m) => (
              <Typography key={m.id}>
                <strong>{m.organization}</strong>
                {[m.membershipId, m.memberSince ? `since ${m.memberSince}` : ''].filter(Boolean).length > 0
                  ? ` — ${[m.membershipId, m.memberSince ? `since ${m.memberSince}` : ''].filter(Boolean).join(', ')}`
                  : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {profile.hospitals.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>Hospitals & fees</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hospital</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Consultation fees</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profile.hospitals.map((h) => (
                <TableRow key={`${h.hospitalId}-${h.branchId ?? 'main'}`}>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/hospitals/${h.hospitalId}`}
                      size="small"
                      sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                    >
                      {h.hospitalName}
                    </Button>
                  </TableCell>
                  <TableCell>{[h.branchName, h.city].filter(Boolean).join(', ') || '—'}</TableCell>
                  <TableCell>
                    {h.consultationFees.map((f) => f.feeDisplay).join(' · ') || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : null}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Availability preview</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {profile.availabilityPreview.availableToday ? (
            <Chip label="Available today" color="success" size="small" />
          ) : (
            <Chip label="No slots today" size="small" variant="outlined" />
          )}
          <Chip
            label={`${profile.availabilityPreview.availableSlotsNext7Days} slots in next 7 days`}
            size="small"
            variant="outlined"
          />
        </Stack>
      </Box>

      <Box sx={{ mb: 10 }}>
        <ReviewsSection
          queryKey={['public', 'doctor', doctorId, 'reviews']}
          fetchReviews={(page) => fetchDoctorReviews(doctorId, page)}
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button variant="contained" size="large" onClick={handleBook}>
          Book appointment
        </Button>
      </Paper>
    </PublicProfileLayout>
  );
}
