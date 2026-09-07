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
  const [implantForm, setImplantForm] = useState({
    implantName: '',
    implantType: '',
    manufacturer: '',
    lotNumber: '',
    serialNumber: '',
    quantity: '1',
    notes: '',
  });
  const [anesthesiaForm, setAnesthesiaForm] = useState({
    asaClass: 'II',
    anesthesiaType: 'GENERAL',
    inductionAgent: '',
    airwayDevice: '',
    notes: '',
    complications: '',
  });
  const [anesthesiaEventForm, setAnesthesiaEventForm] = useState({
    eventType: 'VITALS',
    systolicBp: '',
    diastolicBp: '',
    pulse: '',
    spo2: '',
    notes: '',
  });
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

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Implants</Typography>
                {(procedure.implants ?? []).length > 0 ? (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {(procedure.implants ?? []).map((implant) => (
                      <Typography key={implant.implantId} variant="body2">
                        <strong>{implant.implantName}</strong>
                        {implant.implantType ? ` · ${implant.implantType}` : ''}
                        {implant.manufacturer ? ` · ${implant.manufacturer}` : ''}
                        {implant.lotNumber ? ` · lot ${implant.lotNumber}` : ''}
                        {implant.serialNumber ? ` · S/N ${implant.serialNumber}` : ''}
                        {` · qty ${implant.quantity}`}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No implants recorded yet.
                  </Typography>
                )}
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Implant name"
                      size="small"
                      fullWidth
                      required
                      value={implantForm.implantName}
                      onChange={(e) => setImplantForm({ ...implantForm, implantName: e.target.value })}
                    />
                    <TextField
                      label="Type"
                      size="small"
                      fullWidth
                      value={implantForm.implantType}
                      onChange={(e) => setImplantForm({ ...implantForm, implantType: e.target.value })}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Manufacturer"
                      size="small"
                      fullWidth
                      value={implantForm.manufacturer}
                      onChange={(e) => setImplantForm({ ...implantForm, manufacturer: e.target.value })}
                    />
                    <TextField
                      label="Lot #"
                      size="small"
                      fullWidth
                      value={implantForm.lotNumber}
                      onChange={(e) => setImplantForm({ ...implantForm, lotNumber: e.target.value })}
                    />
                    <TextField
                      label="Serial #"
                      size="small"
                      fullWidth
                      value={implantForm.serialNumber}
                      onChange={(e) => setImplantForm({ ...implantForm, serialNumber: e.target.value })}
                    />
                    <TextField
                      label="Qty"
                      size="small"
                      sx={{ width: { xs: '100%', sm: 88 } }}
                      value={implantForm.quantity}
                      onChange={(e) => setImplantForm({ ...implantForm, quantity: e.target.value })}
                    />
                  </Stack>
                  <TextField
                    label="Notes"
                    size="small"
                    fullWidth
                    value={implantForm.notes}
                    onChange={(e) => setImplantForm({ ...implantForm, notes: e.target.value })}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  disabled={!implantForm.implantName.trim() || mutations.addImplant.isPending}
                  onClick={async () => {
                    try {
                      const qty = Number(implantForm.quantity);
                      await mutations.addImplant.mutateAsync({
                        procedureId: procedure.procedureId,
                        implantName: implantForm.implantName.trim(),
                        implantType: implantForm.implantType.trim() || undefined,
                        manufacturer: implantForm.manufacturer.trim() || undefined,
                        lotNumber: implantForm.lotNumber.trim() || undefined,
                        serialNumber: implantForm.serialNumber.trim() || undefined,
                        quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1,
                        notes: implantForm.notes.trim() || undefined,
                      });
                      setImplantForm({
                        implantName: '',
                        implantType: '',
                        manufacturer: '',
                        lotNumber: '',
                        serialNumber: '',
                        quantity: '1',
                        notes: '',
                      });
                      showSuccess('Implant recorded.');
                    } catch (e) {
                      showError(e);
                    }
                  }}
                >
                  Add implant
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Anesthesia chart</Typography>
                {procedure.anesthesiaChart ? (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {procedure.anesthesiaChart.anesthesiaType}
                    {procedure.anesthesiaChart.asaClass ? ` · ASA ${procedure.anesthesiaChart.asaClass}` : ''}
                    {procedure.anesthesiaChart.inductionAgent ? ` · ${procedure.anesthesiaChart.inductionAgent}` : ''}
                    {procedure.anesthesiaChart.airwayDevice ? ` · airway ${procedure.anesthesiaChart.airwayDevice}` : ''}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No anesthesia chart yet.
                  </Typography>
                )}
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      select
                      label="Type"
                      size="small"
                      sx={{ minWidth: 140 }}
                      value={anesthesiaForm.anesthesiaType}
                      onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, anesthesiaType: e.target.value })}
                    >
                      {['GENERAL', 'REGIONAL', 'LOCAL', 'SEDATION', 'COMBINED'].map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="ASA class"
                      size="small"
                      value={anesthesiaForm.asaClass}
                      onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, asaClass: e.target.value })}
                    />
                    <TextField
                      label="Induction agent"
                      size="small"
                      fullWidth
                      value={anesthesiaForm.inductionAgent}
                      onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, inductionAgent: e.target.value })}
                    />
                    <TextField
                      label="Airway"
                      size="small"
                      fullWidth
                      value={anesthesiaForm.airwayDevice}
                      onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, airwayDevice: e.target.value })}
                    />
                  </Stack>
                  <TextField
                    label="Notes"
                    size="small"
                    fullWidth
                    value={anesthesiaForm.notes}
                    onChange={(e) => setAnesthesiaForm({ ...anesthesiaForm, notes: e.target.value })}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  sx={{ mb: 2 }}
                  disabled={mutations.upsertAnesthesiaChart.isPending}
                  onClick={async () => {
                    try {
                      await mutations.upsertAnesthesiaChart.mutateAsync({
                        procedureId: procedure.procedureId,
                        anesthesiaType: anesthesiaForm.anesthesiaType,
                        asaClass: anesthesiaForm.asaClass.trim() || undefined,
                        inductionAgent: anesthesiaForm.inductionAgent.trim() || undefined,
                        airwayDevice: anesthesiaForm.airwayDevice.trim() || undefined,
                        notes: anesthesiaForm.notes.trim() || undefined,
                        complications: anesthesiaForm.complications.trim() || undefined,
                      });
                      showSuccess('Anesthesia chart saved.');
                    } catch (e) {
                      showError(e);
                    }
                  }}
                >
                  Save anesthesia chart
                </Button>

                {(procedure.anesthesiaChart?.events ?? []).length > 0 ? (
                  <Stack spacing={0.5} sx={{ mb: 1 }}>
                    {procedure.anesthesiaChart!.events.map((ev) => (
                      <Typography key={ev.eventId} variant="body2">
                        <strong>{ev.eventType}</strong>
                        {ev.systolicBp != null ? ` · BP ${ev.systolicBp}/${ev.diastolicBp ?? '—'}` : ''}
                        {ev.pulse != null ? ` · HR ${ev.pulse}` : ''}
                        {ev.spo2 != null ? ` · SpO₂ ${ev.spo2}%` : ''}
                        {ev.notes ? ` · ${ev.notes}` : ''}
                      </Typography>
                    ))}
                  </Stack>
                ) : null}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    select
                    label="Event"
                    size="small"
                    sx={{ minWidth: 140 }}
                    value={anesthesiaEventForm.eventType}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, eventType: e.target.value })}
                  >
                    {['VITALS', 'INDUCTION', 'INTUBATION', 'EXTUBATION', 'DRUG', 'OTHER'].map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Sys"
                    size="small"
                    sx={{ width: 80 }}
                    value={anesthesiaEventForm.systolicBp}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, systolicBp: e.target.value })}
                  />
                  <TextField
                    label="Dia"
                    size="small"
                    sx={{ width: 80 }}
                    value={anesthesiaEventForm.diastolicBp}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, diastolicBp: e.target.value })}
                  />
                  <TextField
                    label="HR"
                    size="small"
                    sx={{ width: 80 }}
                    value={anesthesiaEventForm.pulse}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, pulse: e.target.value })}
                  />
                  <TextField
                    label="SpO₂"
                    size="small"
                    sx={{ width: 80 }}
                    value={anesthesiaEventForm.spo2}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, spo2: e.target.value })}
                  />
                  <TextField
                    label="Notes"
                    size="small"
                    fullWidth
                    value={anesthesiaEventForm.notes}
                    onChange={(e) => setAnesthesiaEventForm({ ...anesthesiaEventForm, notes: e.target.value })}
                  />
                </Stack>
                <Button
                  variant="outlined"
                  disabled={mutations.addAnesthesiaEvent.isPending}
                  onClick={async () => {
                    try {
                      await mutations.addAnesthesiaEvent.mutateAsync({
                        procedureId: procedure.procedureId,
                        eventType: anesthesiaEventForm.eventType,
                        systolicBp: anesthesiaEventForm.systolicBp ? Number(anesthesiaEventForm.systolicBp) : undefined,
                        diastolicBp: anesthesiaEventForm.diastolicBp ? Number(anesthesiaEventForm.diastolicBp) : undefined,
                        pulse: anesthesiaEventForm.pulse ? Number(anesthesiaEventForm.pulse) : undefined,
                        spo2: anesthesiaEventForm.spo2 ? Number(anesthesiaEventForm.spo2) : undefined,
                        notes: anesthesiaEventForm.notes.trim() || undefined,
                      });
                      setAnesthesiaEventForm({
                        eventType: 'VITALS',
                        systolicBp: '',
                        diastolicBp: '',
                        pulse: '',
                        spo2: '',
                        notes: '',
                      });
                      showSuccess('Anesthesia event recorded.');
                    } catch (e) {
                      showError(e);
                    }
                  }}
                >
                  Add event
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
              {(procedure.implants ?? []).length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Implants</Typography>
                  {(procedure.implants ?? []).map((implant) => (
                    <Typography key={implant.implantId} variant="body2" sx={{ mb: 0.5 }}>
                      <strong>{implant.implantName}</strong>
                      {implant.lotNumber ? ` · lot ${implant.lotNumber}` : ''}
                      {implant.serialNumber ? ` · S/N ${implant.serialNumber}` : ''}
                      {` · qty ${implant.quantity}`}
                    </Typography>
                  ))}
                </Box>
              ) : null}
              {procedure.anesthesiaChart ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Anesthesia</Typography>
                  <Typography variant="body2">
                    {procedure.anesthesiaChart.anesthesiaType}
                    {procedure.anesthesiaChart.asaClass ? ` · ASA ${procedure.anesthesiaChart.asaClass}` : ''}
                  </Typography>
                  {(procedure.anesthesiaChart.events ?? []).map((ev) => (
                    <Typography key={ev.eventId} variant="body2" sx={{ mb: 0.5 }}>
                      {ev.eventType}
                      {ev.pulse != null ? ` · HR ${ev.pulse}` : ''}
                      {ev.spo2 != null ? ` · SpO₂ ${ev.spo2}%` : ''}
                    </Typography>
                  ))}
                </Box>
              ) : null}
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
