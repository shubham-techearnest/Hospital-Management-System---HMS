import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { HospitalListCard } from '@/features/search/components/HospitalListCard';
import { useHospitalSearch } from '@/features/search/hooks/useSearchQueries';
import { detectUserLocation } from '@/features/location/api/locationApi';
import { parseApiError } from '@/shared/api/errorUtils';

const PAGE_SIZE = 20;

export function HospitalSearchPage() {
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [emergency24x7, setEmergency24x7] = useState(false);
  const [icuAvailable, setIcuAvailable] = useState(false);
  const [sort, setSort] = useState('RELEVANCE');
  const [page, setPage] = useState(0);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data, isLoading, error, isFetching } = useHospitalSearch({
    q: q.trim() || undefined,
    department: department || undefined,
    emergency24x7: emergency24x7 || undefined,
    icuAvailable: icuAvailable || undefined,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    maxDistance: coords ? 50 : undefined,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const results = data?.content ?? [];
  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>Find a Hospital</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Search hospitals by name, department, facilities, and distance from your location.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3, maxWidth: 720 }}>
        <TextField label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} fullWidth />
        <TextField label="Department" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }} fullWidth />
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <FormControlLabel control={<Switch checked={emergency24x7} onChange={(e) => setEmergency24x7(e.target.checked)} />} label="24×7 Emergency" />
          <FormControlLabel control={<Switch checked={icuAvailable} onChange={(e) => setIcuAvailable(e.target.checked)} />} label="ICU available" />
        </Stack>
        <TextField select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ maxWidth: 280 }}>
          <MenuItem value="RELEVANCE">Relevance</MenuItem>
          <MenuItem value="NEAREST" disabled={!coords}>Nearest</MenuItem>
          <MenuItem value="HIGHEST_RATED">Highest rated</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<MyLocationIcon />}
          onClick={async () => {
            try {
              setCoords(await detectUserLocation());
            } catch {
              setCoords(null);
            }
          }}
        >
          {coords ? 'Using your location' : 'Use my location'}
        </Button>
      </Stack>

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography sx={{ mb: 2 }}>Loading hospitals…</Typography> : null}

      {!isLoading && !parsedError ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hospitals {data?.totalElements ? `(${data.totalElements})` : ''}
          </Typography>
          <Stack spacing={2}>
            {results.map((hospital) => (
              <HospitalListCard key={hospital.hospitalId} hospital={hospital} />
            ))}
          </Stack>
          {results.length === 0 ? <Alert severity="info">No hospitals match your filters.</Alert> : null}
          {(data?.totalPages ?? 0) > 1 ? (
            <Stack direction="row" justifyContent="center" gap={2} sx={{ mt: 3 }}>
              <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {page + 1} of {data?.totalPages}</Typography>
              <Button disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>Updating…</Typography>
      ) : null}
    </AnimatedPage>
  );
}
