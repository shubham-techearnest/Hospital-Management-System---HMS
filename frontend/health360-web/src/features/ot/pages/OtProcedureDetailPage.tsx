import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useOtMutations,
  useOtProcedure,
  useTheatres,
} from '@/features/ot/hooks/useOtQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SCHEDULED: 'warning',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const TEAM_ROLES = ['SURGEON', 'ASSISTANT', 'ANAESTHETIST', 'SCRUB_NURSE', 'CIRCULATING_NURSE'] as const;

function patientLabel(procedure: { patientName?: string; uhid?: string; patientId: string }) {
  if (procedure.patientName) {
    return procedure.uhid ? `${procedure.patientName} · ${procedure.uhid}` : procedure.patientName;
  }
  return procedure.patientId.length > 8 ? `${procedure.patientId.slice(0, 8)}…` : procedure.patientId;
}

export function OtProcedureDetailPage() {
  const { procedureId = '' } = useParams<{ procedureId: string }>();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();

  const { data: procedure, isLoading, isError } = useOtProcedure(procedureId || undefined);
  const { data: theatres = [] } = useTheatres(hospitalId || undefined, branchId || undefined);
  const mutations = useOtMutations(hospitalId, branchId);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
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
    procedure?.notes.some((n) => n.noteType === type) ?? false;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="OT procedure"
        subtitle="Schedule, assign team, document notes, start, and complete"
        actions={(
          <Button component={RouterLink} to="/ot/worklist" variant="outlined">
            Back to worklist
          </Button>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading procedure…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this procedure.</Alert> : null}

      {procedure ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700}>{procedure.procedureName}</Typography>
                  <Chip
                    label={procedure.status}
                    size="small"
                    color={STATUS_COLOR[procedure.status] ?? 'default'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {patientLabel(procedure)}
                  {procedure.theatreName ? ` · ${procedure.theatreName}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Received {new Date(procedure.receivedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {procedure.status === 'RECEIVED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Schedule in theatre</Typography>
              {theatres.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  No theatres configured. Add one in Catalog setup first.
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField
                  select
                  label="Theatre"
                  size="small"
                  sx={{ minWidth: 160 }}
                  value={scheduleForm.theatreId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, theatreId: e.target.value })}
                >
                  {theatres.map((t) => (
                    <MenuItem key={t.theatreId} value={t.theatreId}>{t.name} ({t.code})</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Start"
                  size="small"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleForm.scheduledStart}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledStart: e.target.value })}
                />
                <TextField
                  label="End"
                  size="small"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleForm.scheduledEnd}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEnd: e.target.value })}
                />
              </Stack>
              <TextField
                label="Pre-op notes (optional)"
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 1 }}
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              />
              <Button
                variant="contained"
                disabled={
                  !scheduleForm.theatreId
                  || !scheduleForm.scheduledStart
                  || !scheduleForm.scheduledEnd
                  || mutations.scheduleProcedure.isPending
                }
                onClick={async () => {
                  try {
                    await mutations.scheduleProcedure.mutateAsync({
                      procedureId: procedure.procedureId,
                      theatreId: scheduleForm.theatreId,
                      scheduledStart: new Date(scheduleForm.scheduledStart).toISOString(),
                      scheduledEnd: new Date(scheduleForm.scheduledEnd).toISOString(),
                      notes: scheduleForm.notes || undefined,
                    });
                    showSuccess('Procedure scheduled.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Schedule procedure
              </Button>
            </Paper>
          ) : null}

          {procedure.status === 'SCHEDULED' || procedure.status === 'IN_PROGRESS' ? (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Team members</Typography>
                {procedure.teamMembers.length > 0 ? (
                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                    {procedure.teamMembers.map((m) => (
                      <Typography key={m.teamMemberId} variant="body2">
                        {m.memberRole}: {m.memberName ?? m.userId}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No team members yet.</Typography>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    select
                    label="Role"
                    size="small"
                    sx={{ minWidth: 160 }}
                    value={teamForm.memberRole}
                    onChange={(e) => setTeamForm({ ...teamForm, memberRole: e.target.value })}
                  >
                    {TEAM_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>{role.replace(/_/g, ' ')}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="User ID"
                    size="small"
                    fullWidth
                    value={teamForm.userId}
                    onChange={(e) => setTeamForm({ ...teamForm, userId: e.target.value })}
                  />
                  <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    value={teamForm.memberName}
                    onChange={(e) => setTeamForm({ ...teamForm, memberName: e.target.value })}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  disabled={!teamForm.userId || mutations.addTeamMember.isPending}
                  onClick={async () => {
                    try {
                      await mutations.addTeamMember.mutateAsync({
                        procedureId: procedure.procedureId,
                        memberRole: teamForm.memberRole,
                        userId: teamForm.userId.trim(),
                        memberName: teamForm.memberName || undefined,
                      });
                      setTeamForm({ memberRole: 'SURGEON', userId: '', memberName: '' });
                      showSuccess('Team member added.');
                    } catch (e) {
                      showError(e);
                    }
                  }}
                >
                  Add team member
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Clinical notes</Typography>
                {procedure.notes.length > 0 ? (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {procedure.notes.map((note) => (
                      <Typography key={note.noteId} variant="body2">
                        <strong>{note.noteType}:</strong> {note.content}
                      </Typography>
                    ))}
                  </Stack>
                ) : null}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    select
                    label="Note type"
                    size="small"
                    sx={{ minWidth: 140 }}
                    value={noteForm.noteType}
                    onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })}
                  >
                    <MenuItem value="PRE_OP">Pre-op</MenuItem>
                    <MenuItem value="INTRA_OP">Intra-op</MenuItem>
                    <MenuItem value="POST_OP">Post-op</MenuItem>
                  </TextField>
                  <TextField
                    label="Content"
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  disabled={!noteForm.content.trim() || mutations.addNote.isPending}
                  onClick={async () => {
                    try {
                      await mutations.addNote.mutateAsync({
                        procedureId: procedure.procedureId,
                        noteType: noteForm.noteType,
                        content: noteForm.content.trim(),
                      });
                      setNoteForm({ ...noteForm, content: '' });
                      showSuccess('Note recorded.');
                    } catch (e) {
                      showError(e);
                    }
                  }}
                >
                  Add note
                </Button>
              </Paper>
            </>
          ) : null}

          {procedure.status === 'SCHEDULED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Start procedure</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Requires at least one team member and a pre-op note (can be entered during scheduling).
              </Typography>
              {procedure.schedule ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Scheduled {new Date(procedure.schedule.scheduledStart).toLocaleString()}
                  {' — '}
                  {new Date(procedure.schedule.scheduledEnd).toLocaleString()}
                </Typography>
              ) : null}
              <Button
                variant="contained"
                color="warning"
                disabled={
                  procedure.teamMembers.length === 0
                  || !hasNoteType('PRE_OP')
                  || mutations.startProcedure.isPending
                }
                onClick={async () => {
                  try {
                    await mutations.startProcedure.mutateAsync(procedure.procedureId);
                    showSuccess('Procedure started.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Start procedure
              </Button>
            </Paper>
          ) : null}

          {procedure.status === 'IN_PROGRESS' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Complete procedure</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Requires an intra-op note and post-op note or completion summary.
              </Typography>
              <TextField
                label="Completion summary"
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 1 }}
                value={completionSummary}
                onChange={(e) => setCompletionSummary(e.target.value)}
              />
              <Button
                variant="contained"
                color="success"
                disabled={
                  !hasNoteType('INTRA_OP')
                  || (!hasNoteType('POST_OP') && !completionSummary.trim())
                  || mutations.completeProcedure.isPending
                }
                onClick={async () => {
                  try {
                    await mutations.completeProcedure.mutateAsync({
                      procedureId: procedure.procedureId,
                      completionSummary: completionSummary.trim() || undefined,
                    });
                    showSuccess('Procedure completed.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Complete procedure
              </Button>
            </Paper>
          ) : null}

          {procedure.status === 'COMPLETED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Completed procedure</Typography>
              {procedure.completedAt ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Completed {new Date(procedure.completedAt).toLocaleString()}
                </Typography>
              ) : null}
              {procedure.notes.map((note) => (
                <Typography key={note.noteId} variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{note.noteType}:</strong> {note.content}
                </Typography>
              ))}
            </Paper>
          ) : null}
        </Stack>
      ) : null}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
