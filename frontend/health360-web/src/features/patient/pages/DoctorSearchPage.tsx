import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DoctorListCard } from '@/features/search/components/DoctorListCard';
import { useDoctorSearch } from '@/features/search/hooks/useDoctorSearch';
import { useSpecializations } from '@/features/search/hooks/useSearchQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { detectUserLocation } from '@/features/location/api/locationApi';

const PRIMARY = '#1D4ED8';
const PAGE_SIZE = 20;

const FALLBACK_SPECIALTIES = [
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Pediatrics',
  'Gynecology',
  'General Medicine',
];

const CONSULT_MODES = [
  { id: '', label: 'All' },
  { id: 'IN_PERSON', label: 'In-Person' },
  { id: 'VIDEO', label: 'Video' },
  { id: 'BOTH', label: 'Both' },
];

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      clickable
      sx={{
        height: 32,
        fontWeight: 600,
        fontSize: 12,
        borderRadius: '999px',
        bgcolor: active ? PRIMARY : '#fff',
        color: active ? '#fff' : '#374151',
        border: active ? `1px solid ${PRIMARY}` : '1px solid #E2E8F0',
        '&:hover': { bgcolor: active ? '#1E40AF' : '#F8FAFC' },
      }}
    />
  );
}

export function DoctorSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalFromQuery = searchParams.get('hospital') ?? '';

  const [q, setQ] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [consultationMode, setConsultationMode] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [language, setLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [gender, setGender] = useState('');
  const [sort, setSort] = useState('RELEVANCE');
  const [showFilters, setShowFilters] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [page, setPage] = useState(0);

  const { data: specializationOptions } = useSpecializations();
  const specialtyPills = useMemo(() => {
    const fromApi = (specializationOptions ?? []).map((s) => s.name).filter(Boolean);
    const list = fromApi.length ? fromApi.slice(0, 7) : FALLBACK_SPECIALTIES;
    return ['All', ...list];
  }, [specializationOptions]);

  const { data, isLoading, error, isFetching } = useDoctorSearch({
    q,
    specialization: specialization || undefined,
    hospital: hospitalFromQuery || undefined,
    city: city || undefined,
    language: language || undefined,
    gender: gender || undefined,
    minRating: minRating ? Number(minRating) : undefined,
    maxFee: maxFee ? Number(maxFee) : undefined,
    availableToday: availableToday || undefined,
    consultationMode: consultationMode || undefined,
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
  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);
  const locationLabel = city.trim() || (coords ? 'Near me' : 'Any location');

  return (
    <AnimatedPage>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Find a Doctor
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5 }}>
          Browse verified specialists and book an appointment
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search doctor, specialty, or condition"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 48,
              borderRadius: '12px',
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#94A3B8' },
              '&.Mui-focused fieldset': { borderColor: PRIMARY },
            },
          }}
        />
        <TextField
          select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(0);
          }}
          sx={{
            minWidth: { md: 180 },
            '& .MuiOutlinedInput-root': {
              height: 48,
              borderRadius: '12px',
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PlaceOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">{locationLabel === 'Near me' ? 'Near me' : 'Any location'}</MenuItem>
          <MenuItem value="Bengaluru">Bengaluru</MenuItem>
          <MenuItem value="Mumbai">Mumbai</MenuItem>
          <MenuItem value="Hyderabad">Hyderabad</MenuItem>
          <MenuItem value="Delhi">Delhi</MenuItem>
          <MenuItem value="Pune">Pune</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<TuneOutlinedIcon />}
          onClick={() => setShowFilters((v) => !v)}
          sx={{
            height: 48,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#E2E8F0',
            color: '#374151',
            px: 2.5,
            whiteSpace: 'nowrap',
            bgcolor: showFilters ? '#EFF6FF' : '#fff',
          }}
        >
          Filters
        </Button>
      </Stack>

      <Collapse in={showFilters}>
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField select size="small" label="Gender" value={gender} onChange={(e) => { setGender(e.target.value); setPage(0); }} fullWidth>
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
            </TextField>
            <TextField size="small" label="Language" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(0); }} fullWidth />
            <TextField size="small" label="Min rating" type="number" value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(0); }} fullWidth />
            <TextField size="small" label="Max fee" type="number" value={maxFee} onChange={(e) => { setMaxFee(e.target.value); setPage(0); }} fullWidth />
            <TextField select size="small" label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} fullWidth>
              <MenuItem value="RELEVANCE">Relevance</MenuItem>
              <MenuItem value="NEAREST" disabled={!coords}>Nearest</MenuItem>
              <MenuItem value="HIGHEST_RATED">Highest rated</MenuItem>
              <MenuItem value="MOST_EXPERIENCED">Most experienced</MenuItem>
              <MenuItem value="LOWEST_FEE">Lowest fee</MenuItem>
            </TextField>
          </Stack>
          <Stack direction="row" gap={1} sx={{ mt: 1.5 }} flexWrap="wrap">
            <Chip
              label={availableToday ? 'Available today ✓' : 'Available today'}
              onClick={() => { setAvailableToday((v) => !v); setPage(0); }}
              color={availableToday ? 'primary' : 'default'}
              variant={availableToday ? 'filled' : 'outlined'}
              size="small"
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<MyLocationIcon />}
              onClick={async () => {
                try {
                  setCoords(await detectUserLocation());
                  setSort('NEAREST');
                  setPage(0);
                } catch {
                  setCoords(null);
                }
              }}
            >
              {coords ? 'Location on' : 'Near me'}
            </Button>
          </Stack>
        </Box>
      </Collapse>

      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.25 }}>
        {specialtyPills.map((label) => {
          const active = label === 'All' ? !specialization : specialization === label;
          return (
            <FilterPill
              key={label}
              label={label}
              active={active}
              onClick={() => {
                setSpecialization(label === 'All' ? '' : label);
                setPage(0);
              }}
            />
          );
        })}
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
        {CONSULT_MODES.map((mode) => (
          <FilterPill
            key={mode.id || 'all-mode'}
            label={mode.label}
            active={consultationMode === mode.id}
            onClick={() => {
              setConsultationMode(mode.id);
              setPage(0);
            }}
          />
        ))}
      </Stack>

      {hospitalFromQuery ? (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => navigate('/patient/doctors')}>
          Showing doctors for <strong>{hospitalFromQuery}</strong>
        </Alert>
      ) : null}

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}

      {isLoading ? (
        <Typography sx={{ color: '#64748B', mb: 2 }}>Loading doctors…</Typography>
      ) : (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', mb: 1.5 }}>
          {totalElements} doctor{totalElements === 1 ? '' : 's'} found
        </Typography>
      )}

      {!isLoading && !parsedError ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {results.map((doctor) => (
              <DoctorListCard key={doctor.doctorId} doctor={doctor} />
            ))}
          </Box>

          {results.length === 0 ? (
            <Box
              sx={{
                mt: 2,
                py: 8,
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                bgcolor: '#fff',
              }}
            >
              <MedicalServicesOutlinedIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
              <Typography sx={{ fontWeight: 600, color: '#374151' }}>No doctors found</Typography>
              <Typography sx={{ fontSize: 13, color: '#94A3B8', mt: 0.5 }}>
                Try adjusting your search or filters.
              </Typography>
            </Box>
          ) : null}

          {totalPages > 1 ? (
            <Stack direction="row" justifyContent="center" alignItems="center" gap={2} sx={{ mt: 2.5 }}>
              <Button size="small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {page + 1} of {totalPages}</Typography>
              <Button size="small" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Updating…
        </Typography>
      ) : null}
    </AnimatedPage>
  );
}
