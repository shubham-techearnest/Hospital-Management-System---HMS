import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DoctorListCard } from '@/features/search/components/DoctorListCard';
import { HospitalListCard } from '@/features/search/components/HospitalListCard';
import { useUnifiedSearch } from '@/features/search/hooks/useSearchQueries';
import { detectUserLocation } from '@/features/location/api/locationApi';
import { parseApiError } from '@/shared/api/errorUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

type SearchType = 'ALL' | 'DOCTOR' | 'HOSPITAL';

export function UnifiedSearchPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<SearchType>('ALL');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const { data, isLoading, error } = useUnifiedSearch({
    q: q.trim() || undefined,
    type,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    maxDistance: coords ? 25 : undefined,
    page: 0,
    size: 20,
  });

  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);

  const handleUseLocation = async () => {
    setLocationError(null);
    setLocating(true);
    try {
      setCoords(await detectUserLocation());
    } catch {
      setLocationError('Could not detect location. Try the doctor or hospital search pages instead.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Search Healthcare Providers"
        subtitle="Find verified doctors and hospitals from one place."
      />

      <Stack spacing={1.5} sx={{ mb: 2, maxWidth: 800 }}>
        <TextField label="Search" size="small" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doctors, hospitals, specialties, cities" fullWidth />
        <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
          {([
            ['ALL', `All (${(data?.doctorCount ?? 0) + (data?.hospitalCount ?? 0)})`],
            ['DOCTOR', `Doctors (${data?.doctorCount ?? 0})`],
            ['HOSPITAL', `Hospitals (${data?.hospitalCount ?? 0})`],
          ] as const).map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              size="small"
              color={type === value ? 'primary' : 'default'}
              variant={type === value ? 'filled' : 'outlined'}
              onClick={() => setType(value)}
              sx={{ height: 28 }}
            />
          ))}
          <Button size="small" variant="outlined" startIcon={<MyLocationIcon />} onClick={handleUseLocation} disabled={locating}>
            {coords ? 'Location on' : 'Near me'}
          </Button>
          <Button component={RouterLink} to="/patient/book" size="small">Doctor filters</Button>
          <Button component={RouterLink} to="/patient/hospitals" size="small">Hospital filters</Button>
        </Stack>
        {locationError ? <Alert severity="warning" sx={{ py: 0.5 }}>{locationError}</Alert> : null}
      </Stack>

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography variant="body2">Searching…</Typography> : null}

      {!isLoading && !parsedError ? (
        <Stack spacing={2}>
          {(type === 'ALL' || type === 'DOCTOR') && (data?.doctors.length ?? 0) > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Doctors</Typography>
              <Stack spacing={1.5}>
                {data?.doctors.map((doctor) => (
                  <DoctorListCard key={doctor.doctorId} doctor={doctor} />
                ))}
              </Stack>
            </Box>
          ) : null}

          {(type === 'ALL' || type === 'HOSPITAL') && (data?.hospitals.length ?? 0) > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Hospitals</Typography>
              <Stack spacing={1.5}>
                {data?.hospitals.map((hospital) => (
                  <HospitalListCard key={hospital.hospitalId} hospital={hospital} />
                ))}
              </Stack>
            </Box>
          ) : null}

          {(data?.doctors.length ?? 0) === 0 && (data?.hospitals.length ?? 0) === 0 ? (
            <Alert severity="info">No results found. Try a different search or enable location.</Alert>
          ) : null}
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
