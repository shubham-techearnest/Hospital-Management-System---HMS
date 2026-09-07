import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMyStaffScope } from '@/features/hospital/hooks/useStaffQueries';
import { fetchPublicHospitalProfile } from '@/features/public/api/publicProfileApi';
import { useOpdDesks, useOpdQueue } from '@/features/opd/hooks/useOpdQueries';
import type { OpdQueueEntry } from '@/features/opd/api/opdApi';
import type { StaffScope } from '@/features/hospital/api/staffApi';
import { Health360Logo } from '@/shared/brand/Health360Logo';

function displayName(entry: OpdQueueEntry): string {
  const raw = (entry.patientName ?? entry.encounter?.patientName ?? '').trim();
  if (!raw) return 'Patient';
  const parts = raw.split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function sortByToken(a: OpdQueueEntry, b: OpdQueueEntry): number {
  return a.tokenNumber - b.tokenNumber || a.priority - b.priority;
}

export function OpdDisplayBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: scopes = [], isLoading: scopeLoading } = useMyStaffScope();
  const [activeScopeIndex, setActiveScopeIndex] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const activeScope: StaffScope | undefined = scopes[activeScopeIndex];
  const hospitalId = searchParams.get('hospitalId') || activeScope?.hospitalId || '';
  const branchId = searchParams.get('branchId') || '';
  const deskId = searchParams.get('deskId') || '';

  const { data: hospitalProfile } = useQuery({
    queryKey: ['public-hospital-branches', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  const branches = useMemo(
    () =>
      (hospitalProfile?.branches ?? []).map((b) => ({
        id: b.id,
        name: b.name,
        primary: b.primary,
        city: b.city,
      })),
    [hospitalProfile],
  );

  useEffect(() => {
    if (!hospitalId || branchId) return;
    const preferred =
      branches.find((b) => b.id === activeScope?.branchId)
      ?? branches.find((b) => b.primary)
      ?? branches[0];
    if (!preferred) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('hospitalId', hospitalId);
        next.set('branchId', preferred.id);
        return next;
      },
      { replace: true },
    );
  }, [hospitalId, branchId, branches, activeScope?.branchId, setSearchParams]);

  useEffect(() => {
    if (!hospitalId || !activeScope) return;
    if (searchParams.get('hospitalId')) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('hospitalId', hospitalId);
        return next;
      },
      { replace: true },
    );
  }, [hospitalId, activeScope, searchParams, setSearchParams]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const scopeReady = Boolean(hospitalId && branchId);
  const { data: desks = [] } = useOpdDesks(hospitalId, branchId);
  const { data: queuePage, isError, isFetching } = useOpdQueue(
    hospitalId,
    branchId,
    undefined,
    0,
    100,
  );

  const entries = useMemo(() => {
    const rows = queuePage?.content ?? [];
    const filtered = deskId ? rows.filter((e) => e.deskId === deskId) : rows;
    return filtered;
  }, [queuePage?.content, deskId]);

  const nowServing = useMemo(
    () =>
      entries
        .filter((e) => e.status === 'CALLED' || e.status === 'IN_SERVICE')
        .sort((a, b) => {
          if (a.status === 'CALLED' && b.status !== 'CALLED') return -1;
          if (b.status === 'CALLED' && a.status !== 'CALLED') return 1;
          const aTime = a.calledAt ?? a.serviceStartedAt ?? '';
          const bTime = b.calledAt ?? b.serviceStartedAt ?? '';
          return bTime.localeCompare(aTime);
        }),
    [entries],
  );

  const waiting = useMemo(
    () => entries.filter((e) => e.status === 'WAITING').sort(sortByToken),
    [entries],
  );

  const updateParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        color: '#f8fafc',
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ md: 'center' }}
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Health360Logo size={36} withWordmark compact wordmarkColor="#f8fafc" />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              {hospitalProfile?.name ?? activeScope?.hospitalName ?? 'OPD display'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(248,250,252,0.7)' }}>
              Waiting room board · auto-refreshes
              {isFetching ? ' · updating…' : ''}
            </Typography>
          </Box>
        </Stack>
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{ fontVariantNumeric: 'tabular-nums', color: '#fff' }}
        >
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
        {scopes.length > 1 ? (
          <TextField
            select
            size="small"
            label="Location"
            value={activeScopeIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setActiveScopeIndex(idx);
              const scope = scopes[idx];
              if (!scope) return;
              setSearchParams({
                hospitalId: scope.hospitalId,
                ...(scope.branchId ? { branchId: scope.branchId } : {}),
              });
            }}
            sx={fieldSx}
          >
            {scopes.map((scope, idx) => (
              <MenuItem key={`${scope.hospitalId}-${scope.branchId}-${idx}`} value={idx}>
                {scope.hospitalName}
                {scope.branchName ? ` · ${scope.branchName}` : ''}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        {branches.length > 1 ? (
          <TextField
            select
            size="small"
            label="Branch"
            value={branchId}
            onChange={(e) => updateParam('branchId', e.target.value)}
            sx={fieldSx}
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
                {b.primary ? ' (main)' : ''}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        {desks.length > 0 ? (
          <TextField
            select
            size="small"
            label="Desk"
            value={deskId}
            onChange={(e) => updateParam('deskId', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="">All desks</MenuItem>
            {desks.map((d) => (
              <MenuItem key={d.deskId} value={d.deskId}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        <Button component={RouterLink} to="/reception/dashboard" variant="outlined" sx={linkBtnSx}>
          Back to queue
        </Button>
      </Stack>

      {scopeLoading ? (
        <Alert severity="info">Loading staff location…</Alert>
      ) : !scopeReady ? (
        <Alert severity="warning">Select a hospital branch to show today&apos;s queue.</Alert>
      ) : isError ? (
        <Alert severity="error">Unable to load OPD queue. Check permissions and try again.</Alert>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: '#1e293b',
              p: { xs: 2, md: 3 },
              border: '1px solid rgba(148,163,184,0.25)',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#94a3b8', letterSpacing: 2, fontWeight: 700 }}
            >
              Now serving
            </Typography>
            {nowServing.length === 0 ? (
              <Typography variant="h4" sx={{ mt: 3, color: 'rgba(248,250,252,0.55)' }}>
                No token called
              </Typography>
            ) : (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {nowServing.slice(0, 4).map((entry, idx) => (
                  <Box
                    key={entry.queueEntryId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: idx === 0 ? 'primary.main' : 'rgba(15,23,42,0.55)',
                    }}
                  >
                    <Box>
                      <Typography
                        variant={idx === 0 ? 'h2' : 'h4'}
                        fontWeight={800}
                        sx={{ lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {entry.tokenDisplay || `T-${entry.tokenNumber}`}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        {displayName(entry)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ opacity: 0.9 }}>
                      {entry.status === 'CALLED' ? 'Please proceed' : 'In consultation'}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              bgcolor: '#1e293b',
              p: { xs: 2, md: 3 },
              border: '1px solid rgba(148,163,184,0.25)',
              overflow: 'auto',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#94a3b8', letterSpacing: 2, fontWeight: 700 }}
            >
              Waiting ({waiting.length})
            </Typography>
            {waiting.length === 0 ? (
              <Typography variant="h5" sx={{ mt: 3, color: 'rgba(248,250,252,0.55)' }}>
                Queue clear
              </Typography>
            ) : (
              <Stack spacing={1.25} sx={{ mt: 2 }}>
                {waiting.slice(0, 12).map((entry) => (
                  <Stack
                    key={entry.queueEntryId}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,23,42,0.45)',
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {entry.tokenDisplay || `T-${entry.tokenNumber}`}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.85 }}>
                      {displayName(entry)}
                    </Typography>
                  </Stack>
                ))}
                {waiting.length > 12 ? (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    +{waiting.length - 12} more waiting
                  </Typography>
                ) : null}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

const fieldSx = {
  minWidth: 200,
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    '& fieldset': { borderColor: 'rgba(148,163,184,0.4)' },
    '&:hover fieldset': { borderColor: 'rgba(148,163,184,0.7)' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(248,250,252,0.7)' },
  '& .MuiSelect-icon': { color: 'rgba(248,250,252,0.7)' },
};

const linkBtnSx = {
  color: '#f8fafc',
  borderColor: 'rgba(148,163,184,0.5)',
  alignSelf: 'center',
};
