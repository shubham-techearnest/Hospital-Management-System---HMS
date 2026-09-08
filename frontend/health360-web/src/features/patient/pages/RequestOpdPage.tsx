import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { VisitFlowGuide } from '@/features/opd/components/VisitFlowGuide';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { useRegisterOpdRequest } from '@/features/opd/hooks/useOpdQueries';
import { searchHospitals } from '@/features/search/api/searchApi';
import {
  fetchHospitalDoctors,
  fetchPublicDoctorProfile,
  fetchPublicHospitalProfile,
  type PublicDoctorProfile,
  type PublicHospitalDoctorSummary,
  type PublicHospitalProfile,
} from '@/features/public/api/publicProfileApi';
import { parseApiError } from '@/shared/api/errorUtils';

const PRIMARY = '#1D4ED8';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function HospitalProfileCard({
  profile,
  branchLabel,
  loading,
}: {
  profile?: PublicHospitalProfile;
  branchLabel?: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Skeleton width="40%" />
        <Skeleton height={28} sx={{ mt: 1 }} />
        <Skeleton height={60} sx={{ mt: 2 }} />
      </Paper>
    );
  }
  if (!profile) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC' }}>
        <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>
          Select a hospital to see its profile here.
        </Typography>
      </Paper>
    );
  }

  const primaryBranch = profile.branches.find((b) => b.primary) ?? profile.branches[0];
  const address = primaryBranch
    ? [primaryBranch.addressLine1, primaryBranch.city, primaryBranch.state].filter(Boolean).join(', ')
    : null;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0' }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          mb: 1.5,
        }}
      >
        Hospital profile
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LocalHospitalOutlinedIcon sx={{ color: PRIMARY }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{profile.name}</Typography>
            <VerifiedIcon sx={{ fontSize: 16, color: PRIMARY }} />
          </Box>
          {profile.hospitalType ? (
            <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.25 }}>
              {profile.hospitalType.replace(/_/g, ' ')}
            </Typography>
          ) : null}
          {profile.averageRating != null ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mt: 0.75 }}>
              <StarRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{profile.averageRating.toFixed(1)}</Typography>
              <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>({profile.reviewCount} reviews)</Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      {branchLabel ? (
        <Typography sx={{ fontSize: 13, color: '#374151', mt: 1.5, fontWeight: 600 }}>
          Branch: {branchLabel}
        </Typography>
      ) : null}

      {address ? (
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1, alignItems: 'flex-start' }}>
          <PlaceOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8', mt: '2px' }} />
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>{address}</Typography>
        </Box>
      ) : null}

      {profile.emergencyInfo?.emergencyPhone ? (
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, alignItems: 'center' }}>
          <PhoneOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>{profile.emergencyInfo.emergencyPhone}</Typography>
        </Box>
      ) : null}

      <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
        {profile.emergencyInfo?.emergencyAvailable24x7 ? (
          <Chip size="small" label="24×7 Emergency" color="error" variant="outlined" />
        ) : null}
        {profile.emergencyInfo?.icuAvailable ? (
          <Chip size="small" label="ICU" variant="outlined" />
        ) : null}
        {profile.totalBedCount != null ? (
          <Chip size="small" label={`${profile.totalBedCount} beds`} variant="outlined" />
        ) : null}
        {profile.accreditation ? (
          <Chip size="small" label={profile.accreditation} color="success" variant="outlined" />
        ) : null}
      </Stack>

      {profile.departments?.length ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 0.75 }}>
            Departments
          </Typography>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {profile.departments.slice(0, 6).map((d) => (
              <Chip key={d.id} size="small" label={d.name} sx={{ bgcolor: '#F1F5F9' }} />
            ))}
            {profile.departments.length > 6 ? (
              <Chip size="small" label={`+${profile.departments.length - 6}`} sx={{ bgcolor: '#F1F5F9' }} />
            ) : null}
          </Stack>
        </Box>
      ) : null}

      {profile.description ? (
        <Typography sx={{ fontSize: 12, color: '#64748B', mt: 1.5, lineHeight: 1.5 }}>
          {profile.description.length > 160 ? `${profile.description.slice(0, 160)}…` : profile.description}
        </Typography>
      ) : null}

      <Button
        component={RouterLink}
        to={`/hospitals/${profile.id}`}
        size="small"
        endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}
      >
        View full hospital profile
      </Button>
    </Paper>
  );
}

function DoctorProfileCard({
  profile,
  loading,
  fallbackName,
}: {
  profile?: PublicDoctorProfile;
  loading: boolean;
  fallbackName?: string;
}) {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Skeleton width="40%" />
        <Skeleton height={28} sx={{ mt: 1 }} />
        <Skeleton height={60} sx={{ mt: 2 }} />
      </Paper>
    );
  }
  if (!profile) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#F8FAFC' }}>
        <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>
          {fallbackName
            ? `Loading profile for ${fallbackName}…`
            : 'Select a doctor to see their profile here.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0' }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          mb: 1.5,
        }}
      >
        Doctor profile
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            bgcolor: PRIMARY,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
            backgroundImage: profile.profilePhotoUrl ? `url(${profile.profilePhotoUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!profile.profilePhotoUrl ? initials(profile.name) : null}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{profile.name}</Typography>
            {profile.verified ? <VerifiedIcon sx={{ fontSize: 16, color: PRIMARY }} /> : null}
          </Box>
          <Typography sx={{ fontSize: 13, color: '#0D9488', fontWeight: 600, mt: 0.25 }}>
            {profile.specialization ?? profile.title ?? 'Doctor'}
          </Typography>
          {profile.averageRating != null ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mt: 0.75 }}>
              <StarRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{profile.averageRating.toFixed(1)}</Typography>
              <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>({profile.reviewCount} reviews)</Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ mt: 1.5 }}>
        {profile.yearsExperience != null ? (
          <Chip size="small" icon={<MedicalServicesOutlinedIcon />} label={`${profile.yearsExperience}+ yrs`} />
        ) : null}
        {profile.availabilityPreview?.availableToday ? (
          <Chip size="small" color="success" label="Available today" variant="outlined" />
        ) : null}
        {(profile.languages ?? []).slice(0, 3).map((lang) => (
          <Chip key={lang} size="small" label={lang} sx={{ bgcolor: '#F1F5F9' }} />
        ))}
      </Stack>

      {profile.qualifications?.length ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 0.75 }}>
            Qualifications
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>
            {profile.qualifications
              .slice(0, 3)
              .map((q) => q.degree)
              .join(' · ')}
          </Typography>
        </Box>
      ) : null}

      {profile.biography ? (
        <Typography sx={{ fontSize: 12, color: '#64748B', mt: 1.5, lineHeight: 1.5 }}>
          {profile.biography.length > 180 ? `${profile.biography.slice(0, 180)}…` : profile.biography}
        </Typography>
      ) : null}

      <Button
        component={RouterLink}
        to={`/patient/doctors/${profile.id}`}
        size="small"
        endIcon={<ChevronRightIcon sx={{ fontSize: '16px !important' }} />}
        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 600 }}
      >
        View full doctor profile
      </Button>
    </Paper>
  );
}

export function RequestOpdPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefillHospitalId = params.get('hospitalId') ?? '';
  const prefillBranchId = params.get('branchId') ?? '';
  const prefillDoctorId = params.get('doctorId') ?? '';
  const prefillHospitalName = params.get('hospitalName') ?? '';
  const prefillBranchName = params.get('branchName') ?? '';
  const prefillDoctorName = params.get('doctorName') ?? '';
  const fromFindDoctor = Boolean(prefillDoctorId || prefillHospitalId);

  const [hospitalQuery, setHospitalQuery] = useState(prefillHospitalName);
  const [selectedHospital, setSelectedHospital] = useState<{ id: string; name: string } | null>(
    prefillHospitalId ? { id: prefillHospitalId, name: prefillHospitalName } : null,
  );
  const [branchId, setBranchId] = useState(prefillBranchId);
  const [doctorId, setDoctorId] = useState(prefillDoctorId);
  const [visitReason, setVisitReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const registerRequest = useRegisterOpdRequest();

  const { data: hospitalSearch } = useQuery({
    queryKey: ['hospital-search', hospitalQuery],
    queryFn: () => searchHospitals({ q: hospitalQuery, page: 0, size: 10 }),
    enabled: hospitalQuery.trim().length >= 2,
  });

  const { data: selectedDoctorProfile, isLoading: doctorProfileLoading } = useQuery({
    queryKey: ['public-doctor-profile', doctorId],
    queryFn: () => fetchPublicDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  useEffect(() => {
    if (selectedHospital || !selectedDoctorProfile?.hospitals?.length) return;
    if (!prefillHospitalId && !prefillDoctorId) return;
    const primary = selectedDoctorProfile.hospitals[0];
    setSelectedHospital({ id: primary.hospitalId, name: primary.hospitalName });
    setHospitalQuery(primary.hospitalName);
    if (primary.branchId && !branchId) setBranchId(primary.branchId);
  }, [selectedDoctorProfile, selectedHospital, prefillHospitalId, prefillDoctorId, branchId]);

  const hospitalId = selectedHospital?.id ?? '';
  const { data: hospitalProfile, isLoading: hospitalProfileLoading } = useQuery({
    queryKey: ['public-hospital', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  const { data: doctorsPage } = useQuery({
    queryKey: ['hospital-doctors', hospitalId],
    queryFn: () => fetchHospitalDoctors(hospitalId, { page: 0, size: 50 }),
    enabled: Boolean(hospitalId),
  });

  const branches = hospitalProfile?.branches ?? [];
  const doctors = doctorsPage?.content ?? [];

  useEffect(() => {
    if (hospitalProfile?.name && selectedHospital && !selectedHospital.name) {
      setSelectedHospital({ id: selectedHospital.id, name: hospitalProfile.name });
      setHospitalQuery(hospitalProfile.name);
    }
  }, [hospitalProfile, selectedHospital]);

  useEffect(() => {
    if (!branches.length) return;
    if (prefillBranchId && branches.some((b) => b.id === prefillBranchId)) {
      setBranchId(prefillBranchId);
      return;
    }
    if (!branchId) {
      const primary = branches.find((b) => b.primary) ?? branches[0];
      setBranchId(primary.id);
    }
  }, [branches, branchId, prefillBranchId]);

  useEffect(() => {
    if (!prefillDoctorId || !doctors.length) return;
    if (doctors.some((d) => d.doctorId === prefillDoctorId)) {
      setDoctorId(prefillDoctorId);
    }
  }, [doctors, prefillDoctorId]);

  const resolvedHospitalName = useMemo(() => {
    if (selectedHospital?.name) return selectedHospital.name;
    return hospitalProfile?.name ?? prefillHospitalName;
  }, [selectedHospital, hospitalProfile, prefillHospitalName]);

  const resolvedDoctorName = useMemo(() => {
    const fromList = doctors.find((d) => d.doctorId === doctorId)?.name;
    return fromList ?? selectedDoctorProfile?.name ?? prefillDoctorName;
  }, [doctors, doctorId, selectedDoctorProfile, prefillDoctorName]);

  const resolvedBranchName = useMemo(() => {
    const fromList = branches.find((b) => b.id === branchId)?.name;
    return fromList ?? prefillBranchName;
  }, [branches, branchId, prefillBranchName]);

  const hospitalOptions = useMemo(() => {
    const list = hospitalSearch?.content ?? [];
    if (selectedHospital && !list.some((h) => h.hospitalId === selectedHospital.id)) {
      return [
        {
          hospitalId: selectedHospital.id,
          name: selectedHospital.name || resolvedHospitalName || 'Selected hospital',
          reviewCount: 0,
          emergencyAvailable24x7: false,
          icuAvailable: false,
          ambulanceAvailable: false,
        },
        ...list,
      ];
    }
    return list;
  }, [hospitalSearch, selectedHospital, resolvedHospitalName]);

  const handleSubmit = async () => {
    setError(null);
    if (!hospitalId || !branchId) {
      setError('Select hospital and branch.');
      return;
    }
    try {
      await registerRequest.mutateAsync({
        hospitalId,
        branchId,
        primaryDoctorId: doctorId || undefined,
        visitReason: visitReason.trim() || undefined,
      });
      navigate('/patient/opd');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={VISIT_FLOW.request.title}
        subtitle="Request a same-day OPD visit — like registering at the hospital counter"
        actions={
          <Button component={RouterLink} to="/patient/opd" variant="outlined">
            {VISIT_FLOW.queue.patientNav}
          </Button>
        }
      />

      <VisitFlowGuide variant="patient" compact />

      {fromFindDoctor ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prefilling from Find a Doctor
          {resolvedDoctorName ? (
            <>
              : <strong>{resolvedDoctorName}</strong>
            </>
          ) : null}
          {resolvedHospitalName ? (
            <>
              {' '}
              at <strong>{resolvedHospitalName}</strong>
              {resolvedBranchName ? ` · ${resolvedBranchName}` : ''}
            </>
          ) : null}
          . Review and submit.
        </Alert>
      ) : null}

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(300px, 380px)' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Autocomplete
              options={hospitalOptions}
              getOptionLabel={(o) => o.name}
              inputValue={hospitalQuery}
              onInputChange={(_, v) => setHospitalQuery(v)}
              value={hospitalOptions.find((h) => h.hospitalId === hospitalId) ?? null}
              onChange={(_, v) => {
                setSelectedHospital(v ? { id: v.hospitalId, name: v.name } : null);
                setBranchId('');
                if (!fromFindDoctor) setDoctorId('');
              }}
              isOptionEqualToValue={(a, b) => a.hospitalId === b.hospitalId}
              renderInput={(p) => (
                <TextField {...p} label="Hospital" placeholder="Search by name or city" required />
              )}
            />

            {resolvedHospitalName ? (
              <Typography variant="body2" color="text.secondary">
                Selected: <strong>{resolvedHospitalName}</strong>
              </Typography>
            ) : null}

            <TextField
              select
              label="Branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              disabled={!hospitalId || branches.length === 0}
              helperText={hospitalId && branches.length === 0 ? 'Loading branches…' : undefined}
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}{b.primary ? ' (main)' : ''} — {b.city}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!hospitalId}
              helperText={
                fromFindDoctor && doctorId
                  ? `Selected from Find a Doctor${resolvedDoctorName ? `: ${resolvedDoctorName}` : ''}`
                  : undefined
              }
            >
              <MenuItem value="">Any available doctor</MenuItem>
              {prefillDoctorId && !doctors.some((d) => d.doctorId === prefillDoctorId) ? (
                <MenuItem value={prefillDoctorId}>
                  {prefillDoctorName || 'Selected doctor'}
                </MenuItem>
              ) : null}
              {doctors.map((d: PublicHospitalDoctorSummary) => (
                <MenuItem key={d.doctorId} value={d.doctorId}>
                  {d.name}{d.specialization ? ` — ${d.specialization}` : ''}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Reason for visit"
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              multiline
              minRows={2}
              placeholder="e.g. fever since 2 days, follow-up for diabetes"
            />

            <Box>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={registerRequest.isPending || !hospitalId || !branchId}
              >
                {registerRequest.isPending ? 'Submitting…' : VISIT_FLOW.request.patientAction}
              </Button>
            </Box>

            <Alert severity="info">
              After submitting, go to <strong>{VISIT_FLOW.queue.patientNav}</strong> to see your queue position.
              Reception may also register walk-in patients who did not use the app.
            </Alert>
          </Stack>
        </Paper>

        <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
          <HospitalProfileCard
            profile={hospitalProfile}
            branchLabel={resolvedBranchName}
            loading={Boolean(hospitalId) && hospitalProfileLoading}
          />
          <DoctorProfileCard
            profile={selectedDoctorProfile}
            loading={Boolean(doctorId) && doctorProfileLoading}
            fallbackName={resolvedDoctorName}
          />
        </Stack>
      </Box>
    </AnimatedPage>
  );
}
