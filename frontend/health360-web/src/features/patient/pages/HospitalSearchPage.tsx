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
import { CollapsibleFilterPanel } from '@/shared/filters/CollapsibleFilterPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

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
      <DashboardPageHeader
        title="Find a Hospital"
        subtitle="Search by name, department, emergency facilities, and distance."
      />

      <CollapsibleFilterPanel
        primary={
          <>
            <TextField label="Search" size="small" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} fullWidth />
            <TextField label="Department" size="small" value={department} onChange={(e) => { setDepartment(e.target.value); setPage(0); }} fullWidth />
            <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
              <FormControlLabel control={<Switch size="small" checked={emergency24x7} onChange={(e) => setEmergency24x7(e.target.checked)} />} label="24×7 Emergency" />
              <FormControlLabel control={<Switch size="small" checked={icuAvailable} onChange={(e) => setIcuAvailable(e.target.checked)} />} label="ICU" />
              <Button size="small" variant="outlined" startIcon={<MyLocationIcon />} onClick={async () => {
                try { setCoords(await detectUserLocation()); } catch { setCoords(null); }
              }}>
                {coords ? 'Location on' : 'Near me'}
              </Button>
            </Stack>
          </>
        }
        advanced={
          <TextField select label="Sort by" size="small" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ maxWidth: 240 }}>
            <MenuItem value="RELEVANCE">Relevance</MenuItem>
            <MenuItem value="NEAREST" disabled={!coords}>Nearest</MenuItem>
            <MenuItem value="HIGHEST_RATED">Highest rated</MenuItem>
          </TextField>
        }
      />

      {parsedError ? <Alert severity="error" sx={{ mb: 2 }}>{parsedError.message}</Alert> : null}
      {isLoading ? <Typography sx={{ mb: 2 }}>Loading hospitals…</Typography> : null}

      {!isLoading && !parsedError ? (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            Hospitals {data?.totalElements ? `(${data.totalElements})` : ''}
          </Typography>
          <Stack spacing={1.5}>
            {results.map((hospital) => (
              <HospitalListCard key={hospital.hospitalId} hospital={hospital} />
            ))}
          </Stack>
          {results.length === 0 ? <Alert severity="info">No hospitals match your filters.</Alert> : null}
          {(data?.totalPages ?? 0) > 1 ? (
            <Stack direction="row" justifyContent="center" gap={2} sx={{ mt: 2 }}>
              <Button size="small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" color="text.secondary">Page {page + 1} of {data?.totalPages}</Typography>
              <Button size="small" disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </>
      ) : null}

      {isFetching && !isLoading ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Updating…</Typography>
      ) : null}
    </AnimatedPage>
  );
}
