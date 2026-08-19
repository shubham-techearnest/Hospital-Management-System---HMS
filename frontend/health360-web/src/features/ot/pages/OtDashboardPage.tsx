import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useOtDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HealingIcon from '@mui/icons-material/Healing';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useOtMutations,
  useOtProcedure,
  useOtProcedures,
  usePendingOtWorklist,
  useTheatres,
} from '@/features/ot/hooks/useOtQueries';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SCHEDULED: 'warning',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const TEAM_ROLES = ['SURGEON', 'ASSISTANT', 'ANAESTHETIST', 'SCRUB_NURSE', 'CIRCULATING_NURSE'] as const;

export function OtDashboardPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);

  const [tab, setTab] = useState(0);
  const [manualHospitalId, setManualHospitalId] = useState(DEFAULT_HOSPITAL_ID);
  const [manualBranchId, setManualBranchId] = useState(DEFAULT_BRANCH_ID);
  const hospitalId = profile?.id ?? manualHospitalId;
  const branchId = primaryBranch?.id ?? manualBranchId;
  const showManualScope = !profile?.id;
  const [procedurePage, setProcedurePage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  const scopeParams = scopeReady
    ? { hospitalId: hospitalId.trim(), branchId: branchId.trim() }
    : undefined;
  const { data: stats, isLoading: statsLoading } = useOtDashboardStats(scopeParams, scopeReady);
  const { data: worklist = [] } = usePendingOtWorklist(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );
  const { data: proceduresPage } = useOtProcedures(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
    procedurePage,
    statusFilter || undefined,
  );
  const procedures = proceduresPage?.content ?? [];
  const procedureTotalPages = proceduresPage?.totalPages ?? 0;

  const { data: selectedProcedure } = useOtProcedure(selectedProcedureId || undefined);
  const { data: theatres = [] } = useTheatres(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );

  const mutations = useOtMutations(hospitalId.trim(), branchId.trim());

  const [theatreForm, setTheatreForm] = useState({ name: '', code: '' });
  const [scheduleForm, setScheduleForm] = useState({
    theatreId: '',
    scheduledStart: '',
    scheduledEnd: '',
    notes: '',
  });
  const [teamForm, setTeamForm] = useState({ memberRole: 'SURGEON', userId: '', memberName: '' });
  const [noteForm, setNoteForm] = useState({ noteType: 'PRE_OP', content: '' });
  const [completionSummary, setCompletionSummary] = useState('');

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  const hasNoteType = (type: string) =>
    selectedProcedure?.notes.some((n) => n.noteType === type) ?? false;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Operation Theatre"
        subtitle={
          primaryBranch
            ? `Receive procedure orders, schedule theatres, assign team, document pre/intra/post-op notes — ${primaryBranch.name}`
            : 'Receive procedure orders, schedule theatres, assign team, document pre/intra/post-op notes.'
        }
      />

      {scopeReady && (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Pending procedures', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <HealingIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <PlayArrowIcon /> },
            { label: 'Completed', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      )}

      {showManualScope ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Hospital scope</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField label="Hospital ID" size="small" fullWidth value={manualHospitalId}
              onChange={(e) => setManualHospitalId(e.target.value)} />
            <TextField label="Branch ID" size="small" fullWidth value={manualBranchId}
              onChange={(e) => setManualBranchId(e.target.value)} />
          </Stack>
        </Paper>
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label={`Worklist (${worklist.length})`} />
        <Tab label="Procedures" />
        <Tab label="Process procedure" />
        <Tab label="Theatre setup" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Procedure</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Ordered</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worklist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">No pending procedure orders.</Typography>
                  </TableCell>
                </TableRow>
              ) : worklist.map((item) => (
                <TableRow key={item.clinicalOrderItemId}>
                  <TableCell>{item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.patientId}</TableCell>
                  <TableCell>{new Date(item.orderedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" disabled={!scopeReady}
                      onClick={async () => {
                        try {
                          const procedure = await mutations.receiveProcedure.mutateAsync(item.clinicalOrderItemId);
                          setSelectedProcedureId(procedure.procedureId);
                          setTab(2);
                          showSuccess('Procedure received.');
                        } catch (e) {
                          showError(e);
                        }
                      }}>
                      Receive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <TextField select label="Status filter" size="small" sx={{ minWidth: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setProcedurePage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="RECEIVED">Received</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="IN_PROGRESS">In progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Procedure</TableCell>
                  <TableCell>Theatre</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {procedures.map((procedure) => (
                  <TableRow key={procedure.procedureId}>
                    <TableCell>{procedure.procedureName}</TableCell>
                    <TableCell>{procedure.theatreName ?? '—'}</TableCell>
                    <TableCell>
                      <Chip label={procedure.status} size="small" color={STATUS_COLOR[procedure.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{new Date(procedure.receivedAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => { setSelectedProcedureId(procedure.procedureId); setTab(2); }}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={1}>
            <Button disabled={procedurePage <= 0} onClick={() => setProcedurePage((p) => p - 1)}>Previous</Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {procedurePage + 1} of {Math.max(procedureTotalPages, 1)}
            </Typography>
            <Button disabled={procedurePage + 1 >= procedureTotalPages} onClick={() => setProcedurePage((p) => p + 1)}>
              Next
            </Button>
          </Stack>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          {!selectedProcedureId ? (
            <Alert severity="info">Select a procedure from the worklist or procedures tab.</Alert>
          ) : !selectedProcedure ? (
            <Alert severity="info">Loading procedure…</Alert>
          ) : (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">{selectedProcedure.procedureName}</Typography>
                  <Chip label={selectedProcedure.status} size="small" color={STATUS_COLOR[selectedProcedure.status] ?? 'default'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Procedure {selectedProcedure.procedureId} · Patient {selectedProcedure.patientId}
                  {selectedProcedure.theatreName ? ` · ${selectedProcedure.theatreName}` : ''}
                </Typography>
              </Paper>

              {selectedProcedure.status === 'RECEIVED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Schedule in theatre</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField select label="Theatre" size="small" sx={{ minWidth: 160 }}
                      value={scheduleForm.theatreId}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, theatreId: e.target.value })}>
                      {theatres.map((t) => (
                        <MenuItem key={t.theatreId} value={t.theatreId}>{t.name} ({t.code})</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Start" size="small" type="datetime-local" InputLabelProps={{ shrink: true }}
                      value={scheduleForm.scheduledStart}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledStart: e.target.value })} />
                    <TextField label="End" size="small" type="datetime-local" InputLabelProps={{ shrink: true }}
                      value={scheduleForm.scheduledEnd}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEnd: e.target.value })} />
                  </Stack>
                  <TextField label="Pre-op notes (optional)" fullWidth multiline minRows={2} sx={{ mb: 1 }}
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
                  <Button variant="contained" disabled={!scheduleForm.theatreId || !scheduleForm.scheduledStart || !scheduleForm.scheduledEnd}
                    onClick={async () => {
                      try {
                        await mutations.scheduleProcedure.mutateAsync({
                          procedureId: selectedProcedure.procedureId,
                          theatreId: scheduleForm.theatreId,
                          scheduledStart: new Date(scheduleForm.scheduledStart).toISOString(),
                          scheduledEnd: new Date(scheduleForm.scheduledEnd).toISOString(),
                          notes: scheduleForm.notes || undefined,
                        });
                        showSuccess('Procedure scheduled.');
                      } catch (e) {
                        showError(e);
                      }
                    }}>
                    Schedule procedure
                  </Button>
                </Paper>
              )}

              {(selectedProcedure.status === 'SCHEDULED' || selectedProcedure.status === 'IN_PROGRESS') && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Team members</Typography>
                  {selectedProcedure.teamMembers.length > 0 ? (
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      {selectedProcedure.teamMembers.map((m) => (
                        <Typography key={m.teamMemberId} variant="body2">
                          {m.memberRole}: {m.memberName ?? m.userId}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No team members yet.</Typography>
                  )}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField select label="Role" size="small" sx={{ minWidth: 160 }}
                      value={teamForm.memberRole}
                      onChange={(e) => setTeamForm({ ...teamForm, memberRole: e.target.value })}>
                      {TEAM_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>{role.replace(/_/g, ' ')}</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="User ID" size="small" fullWidth value={teamForm.userId}
                      onChange={(e) => setTeamForm({ ...teamForm, userId: e.target.value })} />
                    <TextField label="Name" size="small" fullWidth value={teamForm.memberName}
                      onChange={(e) => setTeamForm({ ...teamForm, memberName: e.target.value })} />
                  </Stack>
                  <Button variant="outlined" disabled={!teamForm.userId}
                    onClick={async () => {
                      try {
                        await mutations.addTeamMember.mutateAsync({
                          procedureId: selectedProcedure.procedureId,
                          memberRole: teamForm.memberRole,
                          userId: teamForm.userId.trim(),
                          memberName: teamForm.memberName || undefined,
                        });
                        showSuccess('Team member added.');
                      } catch (e) {
                        showError(e);
                      }
                    }}>
                    Add team member
                  </Button>
                </Paper>
              )}

              {(selectedProcedure.status === 'SCHEDULED' || selectedProcedure.status === 'IN_PROGRESS') && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Clinical notes</Typography>
                  {selectedProcedure.notes.length > 0 ? (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {selectedProcedure.notes.map((note) => (
                        <Typography key={note.noteId} variant="body2">
                          <strong>{note.noteType}:</strong> {note.content}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField select label="Note type" size="small" sx={{ minWidth: 140 }}
                      value={noteForm.noteType}
                      onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })}>
                      <MenuItem value="PRE_OP">Pre-op</MenuItem>
                      <MenuItem value="INTRA_OP">Intra-op</MenuItem>
                      <MenuItem value="POST_OP">Post-op</MenuItem>
                    </TextField>
                    <TextField label="Content" size="small" fullWidth multiline minRows={2}
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
                  </Stack>
                  <Button variant="outlined" disabled={!noteForm.content.trim()}
                    onClick={async () => {
                      try {
                        await mutations.addNote.mutateAsync({
                          procedureId: selectedProcedure.procedureId,
                          noteType: noteForm.noteType,
                          content: noteForm.content.trim(),
                        });
                        setNoteForm({ ...noteForm, content: '' });
                        showSuccess('Note recorded.');
                      } catch (e) {
                        showError(e);
                      }
                    }}>
                    Add note
                  </Button>
                </Paper>
              )}

              {selectedProcedure.status === 'SCHEDULED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Start procedure</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Requires at least one team member and a pre-op note (can be entered during scheduling).
                  </Typography>
                  {selectedProcedure.schedule ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Scheduled {new Date(selectedProcedure.schedule.scheduledStart).toLocaleString()}
                      {' — '}
                      {new Date(selectedProcedure.schedule.scheduledEnd).toLocaleString()}
                    </Typography>
                  ) : null}
                  <Button variant="contained" color="warning"
                    disabled={selectedProcedure.teamMembers.length === 0 || !hasNoteType('PRE_OP')}
                    onClick={async () => {
                      try {
                        await mutations.startProcedure.mutateAsync(selectedProcedure.procedureId);
                        showSuccess('Procedure started.');
                      } catch (e) {
                        showError(e);
                      }
                    }}>
                    Start procedure
                  </Button>
                </Paper>
              )}

              {selectedProcedure.status === 'IN_PROGRESS' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Complete procedure</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Requires an intra-op note and post-op note or completion summary.
                  </Typography>
                  <TextField label="Completion summary" fullWidth multiline minRows={2} sx={{ mb: 1 }}
                    value={completionSummary}
                    onChange={(e) => setCompletionSummary(e.target.value)} />
                  <Button variant="contained" color="success"
                    disabled={!hasNoteType('INTRA_OP') || (!hasNoteType('POST_OP') && !completionSummary.trim())}
                    onClick={async () => {
                      try {
                        await mutations.completeProcedure.mutateAsync({
                          procedureId: selectedProcedure.procedureId,
                          completionSummary: completionSummary.trim() || undefined,
                        });
                        showSuccess('Procedure completed.');
                      } catch (e) {
                        showError(e);
                      }
                    }}>
                    Complete procedure
                  </Button>
                </Paper>
              )}

              {selectedProcedure.status === 'COMPLETED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Completed procedure</Typography>
                  {selectedProcedure.completedAt ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Completed {new Date(selectedProcedure.completedAt).toLocaleString()}
                    </Typography>
                  ) : null}
                  {selectedProcedure.notes.map((note) => (
                    <Typography key={note.noteId} variant="body2" sx={{ mb: 0.5 }}>
                      <strong>{note.noteType}:</strong> {note.content}
                    </Typography>
                  ))}
                </Paper>
              )}
            </>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add operation theatre</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField label="Name" size="small" value={theatreForm.name}
                onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={theatreForm.code}
                onChange={(e) => setTheatreForm({ ...theatreForm, code: e.target.value })} />
            </Stack>
            <Button variant="contained" disabled={!scopeReady || !theatreForm.name.trim() || !theatreForm.code.trim()}
              onClick={async () => {
                try {
                  await mutations.createTheatre.mutateAsync({
                    hospitalId: hospitalId.trim(),
                    branchId: branchId.trim(),
                    name: theatreForm.name.trim(),
                    code: theatreForm.code.trim(),
                  });
                  showSuccess('Theatre added.');
                  setTheatreForm({ name: '', code: '' });
                } catch (e) {
                  showError(e);
                }
              }}>
              Add theatre
            </Button>
          </Paper>

          {theatres.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {theatres.map((theatre) => (
                    <TableRow key={theatre.theatreId}>
                      <TableCell>{theatre.code}</TableCell>
                      <TableCell>{theatre.name}</TableCell>
                      <TableCell>{theatre.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
