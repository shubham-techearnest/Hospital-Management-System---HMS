import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useBranches, useHospitalDoctors, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useDisposeEdVisit,
  useEdBoard,
  useRegisterEdArrival,
  useTriageEdVisit,
} from '@/features/emergency/hooks/useEmergencyQueries';
import { useIpdBeds } from '@/features/ipd/hooks/useIpdQueries';
import { useIcuBeds } from '@/features/icu/hooks/useIcuQueries';
import { searchHospitalPatients, type HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { buildPatientSearchParams } from '@/features/reception/utils/patientSearchParams';
import { PatientSearchMatchList, PatientSelectedSummary } from '@/features/reception/components/PatientSearchMatchList';
import { parseApiError } from '@/shared/api/parseApiError';
import type { EdVisit } from '@/features/emergency/api/emergencyApi';

const ARRIVAL_MODES = ['WALK_IN', 'AMBULANCE', 'POLICE', 'TRANSFER_IN', 'OTHER'] as const;
const DISPOSITIONS = [
  'DISCHARGE_HOME',
  'ADMIT_IPD',
  'ADMIT_ICU',
  'TRANSFER_OUT',
  'LEFT_WITHOUT_BEING_SEEN',
  'REFER',
  'DEATH',
] as const;

export function HospitalEdBoardPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const { data: board, isLoading, isError, refetch } = useEdBoard(hospitalId || undefined, branchId || undefined, true);
  const { data: doctors = [] } = useHospitalDoctors();
  const registerArrival = useRegisterEdArrival(hospitalId, branchId);
  const triageVisit = useTriageEdVisit(hospitalId, branchId);
  const disposeVisit = useDisposeEdVisit(hospitalId, branchId);

  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<HospitalPatientSummary[]>([]);
  const [selected, setSelected] = useState<HospitalPatientSummary | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [arrivalMode, setArrivalMode] = useState<string>('WALK_IN');
  const [complaint, setComplaint] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [triageTarget, setTriageTarget] = useState<EdVisit | null>(null);
  const [acuity, setAcuity] = useState(3);
  const [triageNotes, setTriageNotes] = useState('');

  const [disposeTarget, setDisposeTarget] = useState<EdVisit | null>(null);
  const [disposition, setDisposition] = useState<string>('DISCHARGE_HOME');
  const [dispositionNotes, setDispositionNotes] = useState('');
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState('');
  const [disposeError, setDisposeError] = useState<string | null>(null);

  const { data: ipdBeds = [] } = useIpdBeds(
    disposition === 'ADMIT_IPD' ? hospitalId || undefined : undefined,
    disposition === 'ADMIT_IPD' ? branchId || undefined : undefined,
    'AVAILABLE',
  );
  const { data: icuBeds = [] } = useIcuBeds(
    disposition === 'ADMIT_ICU' ? hospitalId || undefined : undefined,
    disposition === 'ADMIT_ICU' ? branchId || undefined : undefined,
    'AVAILABLE',
  );

  const rows = board?.content ?? [];

  const runSearch = async () => {
    setSearchError(null);
    setSelected(null);
    setMatches([]);
    const params = buildPatientSearchParams(query);
    if (!params) {
      setSearchError('Enter UHID, name, mobile, or email.');
      return;
    }
    setSearching(true);
    try {
      const page = await searchHospitalPatients(params);
      const content = page.content ?? [];
      if (!content.length) {
        setSearchError('Patient not found — register at reception first.');
        return;
      }
      setMatches(content);
      if (content.length === 1) setSelected(content[0]);
    } catch (e) {
      setSearchError(parseApiError(e).message);
    } finally {
      setSearching(false);
    }
  };

  const onRegister = async () => {
    if (!selected || !hospitalId || !branchId) return;
    setActionError(null);
    try {
      await registerArrival.mutateAsync({
        hospitalId,
        branchId,
        patientId: selected.patientId,
        arrivalMode,
        chiefComplaint: complaint || undefined,
      });
      setSelected(null);
      setMatches([]);
      setQuery('');
      setComplaint('');
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  if (profileLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!hospitalId) {
    return <Alert severity="warning">Hospital profile not available.</Alert>;
  }

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Emergency board"
        subtitle="Register ED arrivals, triage acuity, and set disposition. Beds stay in IPD via ADT."
      />

      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Register arrival
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'flex-start' }}>
            <TextField
              size="small"
              label="Find patient"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runSearch();
              }}
              sx={{ minWidth: 260 }}
            />
            <Button variant="outlined" onClick={() => void runSearch()} disabled={searching}>
              Search
            </Button>
            <TextField
              select
              size="small"
              label="Arrival mode"
              value={arrivalMode}
              onChange={(e) => setArrivalMode(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {ARRIVAL_MODES.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Chief complaint"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <Button
              variant="contained"
              disabled={!selected || registerArrival.isPending}
              onClick={() => void onRegister()}
            >
              Arrive
            </Button>
          </Stack>
          {searchError ? <Alert severity="warning" sx={{ mt: 1.5 }}>{searchError}</Alert> : null}
          {actionError ? <Alert severity="error" sx={{ mt: 1.5 }}>{actionError}</Alert> : null}
          {selected ? (
            <Stack mt={1.5}>
              <PatientSelectedSummary patient={selected} />
              <Button size="small" onClick={() => setSelected(null)} sx={{ alignSelf: 'flex-start' }}>
                Clear selection
              </Button>
            </Stack>
          ) : (
            <PatientSearchMatchList matches={matches} onSelect={setSelected} />
          )}
        </Paper>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : null}
        {isError ? (
          <Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
            Failed to load ED board.
          </Alert>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <Alert severity="info">No active ED visits.</Alert>
        ) : null}

        {rows.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Visit</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Acuity</TableCell>
                  <TableCell>Complaint</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.visitNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(row.arrivedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.patientName || row.patientId.slice(0, 8)}</TableCell>
                    <TableCell>{row.arrivalMode}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} />
                    </TableCell>
                    <TableCell>{row.triageAcuity ?? '—'}</TableCell>
                    <TableCell>
                      <Typography variant="caption">{row.chiefComplaint || '—'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {row.status === 'ARRIVED' || row.status === 'TRIAGED' ? (
                          <Button size="small" onClick={() => {
                            setTriageTarget(row);
                            setAcuity(row.triageAcuity ?? 3);
                            setTriageNotes(row.triageNotes ?? '');
                          }}>
                            Triage
                          </Button>
                        ) : null}
                        {row.status !== 'DISPOSITIONED' && row.status !== 'CANCELLED' ? (
                          <Button size="small" variant="contained" onClick={() => {
                            setDisposeTarget(row);
                            setDisposition('DISCHARGE_HOME');
                            setDispositionNotes('');
                            setAdmitBedId('');
                            setAdmitDoctorId('');
                            setDisposeError(null);
                          }}>
                            Disposition
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Stack>

      <Dialog open={Boolean(triageTarget)} onClose={() => setTriageTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Triage {triageTarget?.visitNumber}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Acuity (1=critical … 5=non-urgent)"
              value={acuity}
              onChange={(e) => setAcuity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Triage notes"
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTriageTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={triageVisit.isPending || !triageTarget}
            onClick={() => {
              if (!triageTarget) return;
              void triageVisit.mutateAsync({
                visitId: triageTarget.id,
                triageAcuity: acuity,
                triageNotes: triageNotes || undefined,
              }).then(() => setTriageTarget(null));
            }}
          >
            Save triage
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(disposeTarget)} onClose={() => setDisposeTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Disposition {disposeTarget?.visitNumber}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Disposition"
              value={disposition}
              onChange={(e) => {
                setDisposition(e.target.value);
                setAdmitBedId('');
                setDisposeError(null);
              }}
            >
              {DISPOSITIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            {(disposition === 'ADMIT_IPD' || disposition === 'ADMIT_ICU') && (
              <>
                <TextField
                  select
                  label={disposition === 'ADMIT_IPD' ? 'IPD bed' : 'ICU bed'}
                  value={admitBedId}
                  onChange={(e) => setAdmitBedId(e.target.value)}
                  helperText="ADT will assign this bed on disposition"
                >
                  {(disposition === 'ADMIT_IPD' ? ipdBeds : icuBeds).map((b) => (
                    <MenuItem key={b.bedId} value={b.bedId}>
                      {'unitCode' in b && b.unitCode
                        ? `${b.unitCode} / ${b.bedNumber}`
                        : `${'wardCode' in b && b.wardCode ? b.wardCode : 'Bed'} / ${b.bedNumber}`}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Attending doctor"
                  value={admitDoctorId}
                  onChange={(e) => setAdmitDoctorId(e.target.value)}
                  required={disposition === 'ADMIT_IPD'}
                >
                  {doctors.map((d) => (
                    <MenuItem key={d.doctorId} value={d.doctorId}>
                      {d.doctorName || d.doctorId.slice(0, 8)}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            <TextField
              label="Notes"
              value={dispositionNotes}
              onChange={(e) => setDispositionNotes(e.target.value)}
              multiline
              minRows={2}
            />
            {disposeError ? <Alert severity="error">{disposeError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisposeTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={disposeVisit.isPending || !disposeTarget}
            onClick={() => {
              if (!disposeTarget) return;
              if ((disposition === 'ADMIT_IPD' || disposition === 'ADMIT_ICU') && !admitBedId) {
                setDisposeError('Select an available bed.');
                return;
              }
              if (disposition === 'ADMIT_IPD' && !admitDoctorId) {
                setDisposeError('Select an attending doctor.');
                return;
              }
              setDisposeError(null);
              void disposeVisit
                .mutateAsync({
                  visitId: disposeTarget.id,
                  disposition,
                  dispositionNotes: dispositionNotes || undefined,
                  bedId: admitBedId || undefined,
                  primaryDoctorId: admitDoctorId || undefined,
                })
                .then(() => setDisposeTarget(null))
                .catch((e) => setDisposeError(parseApiError(e).message));
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
