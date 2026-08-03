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
import { detectUserLocation } from '@/features/location/api/locationApi';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DoctorListCard } from '@/features/search/components/DoctorListCard';
import { useDoctorSearch } from '@/features/search/hooks/useDoctorSearch';
import { parseApiError } from '@/shared/api/errorUtils';

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
      <Typography variant="h4" sx={{ mb: 1 }}>Find a Doctor</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse verified doctors in our network, or search by name, specialty, hospital, city, rating, and fee.
      </Typography>
      <Button component={RouterLink} to="/patient/search" size="small" sx={{ mb: 2 }}>
        Try unified search (doctors + hospitals)
      </Button>

      <Stack spacing={2} sx={{ mb: 3, maxWidth: 720 }}>
        <TextField
          label="Search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Doctor name, hospital, specialty"
          fullWidth
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Specialty"
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(0);
            }}
            fullWidth
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(0);
            }}
            fullWidth
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Language" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(0); }} fullWidth />
          <TextField label="Min rating (1–5)" type="number" inputProps={{ min: 1, max: 5, step: 0.1 }} value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(0); }} fullWidth />
          <TextField label="Max fee (INR)" type="number" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(0); }} fullWidth />
        </Stack>
        <TextField select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ maxWidth: 280 }}>
          <MenuItem value="RELEVANCE">Relevance</MenuItem>
          <MenuItem value="NEAREST" disabled={!coords}>Nearest</MenuItem>
          <MenuItem value="HIGHEST_RATED">Highest rated</MenuItem>
          <MenuItem value="MOST_EXPERIENCED">Most experienced</MenuItem>
          <MenuItem value="LOWEST_FEE">Lowest fee</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<MyLocationIcon />}
          onClick={async () => {
            try {
              setCoords(await detectUserLocation());
              setSort('NEAREST');
            } catch {
              setCoords(null);
            }
          }}
        >
          {coords ? 'Using your location' : 'Use my location for nearest results'}
        </Button>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <FormControlLabel
            control={
              <Switch
                checked={availableToday}
                onChange={(e) => {
                  setAvailableToday(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label="Available today"
          />
          {filtersActive ? (
            <Button size="small" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography sx={{ mb: 2 }}>Loading doctors…</Typography> : null}

      {!isLoading && !parsedError ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>{listHeading}</Typography>

          {results.length === 0 && !filtersActive ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No verified doctors are listed yet. Check back soon or contact your hospital administrator.
            </Alert>
          ) : null}

          {showSearchEmpty ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No doctors match your search. Browse all available doctors below or try different filters.
            </Alert>
          ) : null}

          <Stack spacing={2}>
            {results.map((doctor) => (
              <DoctorListCard key={doctor.doctorId} doctor={doctor} />
            ))}
          </Stack>

          {totalPages > 1 ? (
            <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mt: 3 }}>
              <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Typography variant="body2" color="text.secondary">
                Page {page + 1} of {totalPages}
              </Typography>
              <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </Stack>
          ) : null}
        </>
      ) : null}

      {showSearchEmpty && !browseQuery.isLoading && browseDoctors.length > 0 ? (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            All available doctors ({browseTotal})
          </Typography>
          <Stack spacing={2}>
            {browseDoctors.map((doctor) => (
              <DoctorListCard key={`browse-${doctor.doctorId}`} doctor={doctor} />
            ))}
          </Stack>
          {browseTotalPages > 1 ? (
            <Stack direction="row" alignItems="center" justifyContent="center" gap={2} sx={{ mt: 3 }}>
              <Button disabled={browsePage <= 0} onClick={() => setBrowsePage((p) => p - 1)}>
                Previous
              </Button>
              <Typography variant="body2" color="text.secondary">
                Page {browsePage + 1} of {browseTotalPages}
              </Typography>
              <Button disabled={browsePage + 1 >= browseTotalPages} onClick={() => setBrowsePage((p) => p + 1)}>
                Next
              </Button>
            </Stack>
          ) : null}
        </Box>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Updating results…
        </Typography>
      ) : null}
    </AnimatedPage>
  );
}
