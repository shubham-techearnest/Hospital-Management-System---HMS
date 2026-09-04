import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { HospitalListCard } from '@/features/search/components/HospitalListCard';
import { useHospitalSearch } from '@/features/search/hooks/useSearchQueries';
import { parseApiError } from '@/shared/api/errorUtils';

const PRIMARY = '#1D4ED8';
const PAGE_SIZE = 20;

export function HospitalSearchPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, error, isFetching } = useHospitalSearch({
    q: q.trim() || undefined,
    page,
    size: PAGE_SIZE,
  });

  const results = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);

  return (
    <AnimatedPage>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Find a Hospital</Typography>
          <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5 }}>
            Discover verified hospitals and healthcare facilities near you.
          </Typography>
        </Box>

        <TextField
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          placeholder="Search hospital name or location..."
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 48,
              borderRadius: '12px',
              bgcolor: '#fff',
              fontSize: 16,
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#94A3B8' },
              '&.Mui-focused fieldset': { borderColor: PRIMARY, boxShadow: '0 0 0 2px #93C5FD' },
            },
          }}
        />

        {parsedError ? <Alert severity="error">{parsedError.message}</Alert> : null}

        {isLoading ? (
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>Loading hospitals…</Typography>
        ) : (
          <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
            {totalElements} hospital{totalElements === 1 ? '' : 's'} found
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
              {results.map((hospital) => (
                <HospitalListCard key={hospital.hospitalId} hospital={hospital} />
              ))}
            </Box>

            {results.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 8,
                  textAlign: 'center',
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#F1F5F9',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <LocalHospitalOutlinedIcon sx={{ fontSize: 28, color: '#94A3B8' }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No hospitals found</Typography>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
                  Try a different hospital name or location.
                </Typography>
              </Box>
            ) : null}
          </>
        ) : null}

        {totalPages > 1 ? (
          <Stack direction="row" justifyContent="center" alignItems="center" gap={2}>
            <Button size="small" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page + 1} of {totalPages}
            </Typography>
            <Button size="small" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </Stack>
        ) : null}

        {isFetching && !isLoading ? (
          <Typography variant="caption" color="text.secondary">
            Updating…
          </Typography>
        ) : null}
      </Box>
    </AnimatedPage>
  );
}
