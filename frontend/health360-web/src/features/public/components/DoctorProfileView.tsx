import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import {
  fetchDoctorReviews,
  fetchPublicDoctorProfile,
} from '@/features/public/api/publicProfileApi';
import { ReviewsSection } from '@/features/public/components/ReviewsSection';

export type DoctorProfileVariant = 'public' | 'portal';

type Props = {
  doctorId: string;
  variant?: DoctorProfileVariant;
  /** Shown while authenticated booking is available */
  canBook?: boolean;
};

export function DoctorProfileView({ doctorId, variant = 'public', canBook = true }: Props) {
  const navigate = useNavigate();
  const portal = variant === 'portal';

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public', 'doctor', doctorId],
    queryFn: () => fetchPublicDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  const handleBook = () => {
    navigate(`/patient/request-opd?doctorId=${doctorId}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">Doctor profile not found or is not publicly available.</Alert>
        <Button
          component={RouterLink}
          to={portal ? '/patient/doctors' : '/login'}
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          {portal ? 'Back to doctors' : 'Search doctors after signing in'}
        </Button>
      </Stack>
    );
  }

  const bookCta = canBook ? (
    <Button variant="contained" size="large" onClick={handleBook} sx={{ textTransform: 'none', fontWeight: 700 }}>
      Request OPD visit
    </Button>
  ) : (
    <Button
      component={RouterLink}
      to="/login"
      state={{ from: `/patient/request-opd?doctorId=${doctorId}` }}
      variant="contained"
      size="large"
      sx={{ textTransform: 'none', fontWeight: 700 }}
    >
      Log in to request visit
    </Button>
  );

  return (
    <Box sx={{ pb: portal ? 2 : 12 }}>
      <Button
        component={RouterLink}
        to={portal ? '/patient/doctors' : '/'}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        ← {portal ? 'Back to doctors' : 'Back'}
      </Button>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          borderRadius: 3,
          borderColor: 'divider',
          background: 'linear-gradient(180deg, #F8FAFF 0%, #FFFFFF 48%)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          <Avatar
            src={profile.profilePhotoUrl}
            sx={{
              width: 96,
              height: 96,
              fontSize: 36,
              fontWeight: 700,
              bgcolor: 'primary.main',
              boxShadow: '0 8px 24px rgba(29,78,216,0.18)',
            }}
          >
            {profile.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }} flexWrap="wrap" useFlexGap>
              <Typography variant="h4" sx={{ fontSize: { xs: 24, sm: 32 }, fontWeight: 800 }}>
                {profile.title ? `${profile.title}. ` : ''}{profile.name}
              </Typography>
              {profile.verified ? (
                <Chip icon={<VerifiedIcon />} label="Verified" color="primary" size="small" />
              ) : null}
            </Stack>
            <Typography color="text.secondary" sx={{ mb: 1.25, fontWeight: 500 }}>
              {profile.specialization ?? 'Healthcare professional'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              {profile.averageRating != null ? (
                <>
                  <Rating value={profile.averageRating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2">
                    {profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No ratings yet</Typography>
              )}
              {profile.yearsExperience != null ? (
                <Chip label={`${profile.yearsExperience} years experience`} size="small" variant="outlined" />
              ) : null}
            </Stack>
          </Box>
          {portal ? (
            <Box sx={{ flexShrink: 0 }}>{bookCta}</Box>
          ) : null}
        </Stack>
      </Paper>

      {profile.biography ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>About</Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{profile.biography}</Typography>
        </Box>
      ) : null}

      {profile.languages.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Languages</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {profile.languages.map((lang) => <Chip key={lang} label={lang} size="small" />)}
          </Stack>
        </Box>
      ) : null}

      {profile.qualifications.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Qualifications</Typography>
          <Stack spacing={1} divider={<Divider flexItem />}>
            {profile.qualifications.map((q) => (
              <Typography key={q.id} variant="body2">
                <strong>{q.degree}</strong> — {q.institution}
                {q.yearOfCompletion ? ` (${q.yearOfCompletion})` : ''}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}

      {(profile.awards?.length ?? 0) > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Awards</Typography>
          <Stack spacing={1}>
            {profile.awards.map((a) => (
              <Typography key={a.id} variant="body2">
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
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Professional memberships</Typography>
          <Stack spacing={1}>
            {profile.memberships.map((m) => (
              <Typography key={m.id} variant="body2">
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
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Hospitals & fees</Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                      {portal ? (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight={600}>{h.hospitalName}</Typography>
                        </Stack>
                      ) : (
                        <Button
                          component={RouterLink}
                          to={`/hospitals/${h.hospitalId}`}
                          size="small"
                          sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                        >
                          {h.hospitalName}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{[h.branchName, h.city].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell>
                      {h.consultationFees.map((f) => f.feeDisplay).join(' · ') || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ) : null}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Availability preview</Typography>
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

      <Box sx={{ mb: portal ? 0 : 2 }}>
        <ReviewsSection
          queryKey={['public', 'doctor', doctorId, 'reviews']}
          fetchReviews={(page) => fetchDoctorReviews(doctorId, page)}
        />
      </Box>

      {!portal ? (
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
            zIndex: 10,
          }}
        >
          {bookCta}
        </Paper>
      ) : null}
    </Box>
  );
}
