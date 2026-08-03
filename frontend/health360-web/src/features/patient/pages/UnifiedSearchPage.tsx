import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
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
      const location = await detectUserLocation();
      setCoords(location);
    } catch {
      setLocationError('Could not detect location. Enter a city on the doctor or hospital search pages instead.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>Search Healthcare Providers</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Find verified doctors and hospitals from one place.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3, maxWidth: 800 }}>
        <TextField
          label="Search doctors, hospitals, specialties, cities"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={handleUseLocation}
            disabled={locating}
          >
            {coords ? 'Location enabled' : 'Use my location'}
          </Button>
          <Button component={RouterLink} to="/patient/book" variant="text">Advanced doctor filters</Button>
          <Button component={RouterLink} to="/patient/hospitals" variant="text">Advanced hospital filters</Button>
        </Stack>
        {locationError ? <Alert severity="warning">{locationError}</Alert> : null}
        {coords ? (
          <Typography variant="caption" color="text.secondary">
            Showing results near your location (within 25 km when distance is available).
          </Typography>
        ) : null}
      </Stack>

      <Tabs value={type} onChange={(_, v) => setType(v)} sx={{ mb: 3 }}>
        <Tab label={`All (${(data?.doctorCount ?? 0) + (data?.hospitalCount ?? 0)})`} value="ALL" />
        <Tab label={`Doctors (${data?.doctorCount ?? 0})`} value="DOCTOR" />
        <Tab label={`Hospitals (${data?.hospitalCount ?? 0})`} value="HOSPITAL" />
      </Tabs>

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography>Searching…</Typography> : null}

      {!isLoading && !parsedError ? (
        <Stack spacing={3}>
          {(type === 'ALL' || type === 'DOCTOR') && (data?.doctors.length ?? 0) > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Doctors</Typography>
              <Stack spacing={2}>
                {data?.doctors.map((doctor) => (
                  <DoctorListCard key={doctor.doctorId} doctor={doctor} />
                ))}
              </Stack>
            </Box>
          ) : null}

          {(type === 'ALL' || type === 'HOSPITAL') && (data?.hospitals.length ?? 0) > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Hospitals</Typography>
              <Stack spacing={2}>
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
