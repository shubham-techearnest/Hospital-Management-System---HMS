import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DoctorListCard } from '@/features/search/components/DoctorListCard';
import { useDoctorSearch } from '@/features/search/hooks/useDoctorSearch';
import { parseApiError } from '@/shared/api/errorUtils';
import { CollapsibleFilterPanel } from '@/shared/filters/CollapsibleFilterPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { detectUserLocation } from '@/features/location/api/locationApi';

const PAGE_SIZE = 20;

function hasFilters(q: string, specialization: string, city: string, availableToday: boolean) {
  return Boolean(q.trim() || specialization.trim() || city.trim() || availableToday);
}

export function DoctorSearchPage() {
  const [q, setQ] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [language, setLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [sort, setSort] = useState('RELEVANCE');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [page, setPage] = useState(0);
  const [browsePage, setBrowsePage] = useState(0);

  const filtersActive = hasFilters(q, specialization, city, availableToday);

  const { data, isLoading, error, isFetching } = useDoctorSearch({
    q,
    specialization: specialization || undefined,
    city: city || undefined,
    language: language || undefined,
    minRating: minRating ? Number(minRating) : undefined,
    maxFee: maxFee ? Number(maxFee) : undefined,
    availableToday: availableToday || undefined,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    maxDistance: coords ? 50 : undefined,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const results = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const showSearchEmpty = filtersActive && !isLoading && !error && results.length === 0;

  const browseQuery = useDoctorSearch(
    { page: browsePage, size: PAGE_SIZE },
    showSearchEmpty,
  );
  const browseDoctors = browseQuery.data?.content ?? [];
  const browseTotal = browseQuery.data?.totalElements ?? 0;
  const browseTotalPages = browseQuery.data?.totalPages ?? 0;

  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);

  const clearFilters = () => {
    setQ('');
    setSpecialization('');
    setCity('');
    setAvailableToday(false);
    setPage(0);
    setBrowsePage(0);
  };

  const listHeading = filtersActive
    ? `Search results${totalElements > 0 ? ` (${totalElements})` : ''}`
    : `All doctors${totalElements > 0 ? ` (${totalElements})` : ''}`;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Find a Doctor"
        subtitle="Browse verified doctors or search by name, specialty, city, rating, and fee."
        actions={
          <Button component={RouterLink} to="/patient/search" size="small" variant="outlined">
            Unified search
          </Button>
        }
      />

      <CollapsibleFilterPanel
        primary={
          <>
            <TextField
              label="Search"
              size="small"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Doctor name, hospital, specialty"
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField label="Specialty" size="small" value={specialization} onChange={(e) => { setSpecialization(e.target.value); setPage(0); }} fullWidth />
              <TextField label="City" size="small" value={city} onChange={(e) => { setCity(e.target.value); setPage(0); }} fullWidth />
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <FormControlLabel
                control={<Switch size="small" checked={availableToday} onChange={(e) => { setAvailableToday(e.target.checked); setPage(0); }} />}
                label="Available today"
              />
              <Button size="small" variant="outlined" startIcon={<MyLocationIcon />} onClick={async () => {
                try {
                  setCoords(await detectUserLocation());
                  setSort('NEAREST');
                } catch {
                  setCoords(null);
                }
              }}>
                {coords ? 'Location on' : 'Near me'}
              </Button>
              {filtersActive ? <Button size="small" onClick={clearFilters}>Clear</Button> : null}
            </Stack>
          </>
        }
        advanced={
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField label="Language" size="small" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(0); }} fullWidth />
              <TextField label="Min rating" size="small" type="number" inputProps={{ min: 1, max: 5, step: 0.1 }} value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(0); }} fullWidth />
              <TextField label="Max fee (INR)" size="small" type="number" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(0); }} fullWidth />
            </Stack>
            <TextField select label="Sort by" size="small" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ maxWidth: 240 }}>
              <MenuItem value="RELEVANCE">Relevance</MenuItem>
              <MenuItem value="NEAREST" disabled={!coords}>Nearest</MenuItem>
              <MenuItem value="HIGHEST_RATED">Highest rated</MenuItem>
              <MenuItem value="MOST_EXPERIENCED">Most experienced</MenuItem>
              <MenuItem value="LOWEST_FEE">Lowest fee</MenuItem>
            </TextField>
          </>
        }
      />

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography sx={{ mb: 2 }}>Loading doctors…</Typography> : null}

      {!isLoading && !parsedError ? (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>{listHeading}</Typography>

          {results.length === 0 && !filtersActive ? (
            <Alert severity="info" sx={{ mb: 2 }}>No verified doctors are listed yet.</Alert>
          ) : null}

          {showSearchEmpty ? (
            <Alert severity="info" sx={{ mb: 2 }}>No doctors match your search. Browse all available doctors below.</Alert>
          ) : null}

          <Stack spacing={1.5}>
            {results.map((doctor) => (
              <DoctorListCard key={doctor.doctorId} doctor={doctor} />
            ))}
          </Stack>

          {totalPages > 1 ? (
            <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mt: 2 }}>
              <Button size="small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {page + 1} of {totalPages}</Typography>
              <Button size="small" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </>
      ) : null}

      {showSearchEmpty && !browseQuery.isLoading && browseDoctors.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>All available doctors ({browseTotal})</Typography>
          <Stack spacing={1.5}>
            {browseDoctors.map((doctor) => (
              <DoctorListCard key={`browse-${doctor.doctorId}`} doctor={doctor} />
            ))}
          </Stack>
          {browseTotalPages > 1 ? (
            <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mt: 2 }}>
              <Button size="small" disabled={browsePage <= 0} onClick={() => setBrowsePage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {browsePage + 1} of {browseTotalPages}</Typography>
              <Button size="small" disabled={browsePage + 1 >= browseTotalPages} onClick={() => setBrowsePage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Box>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Updating results…</Typography>
      ) : null}
    </AnimatedPage>
  );
}
