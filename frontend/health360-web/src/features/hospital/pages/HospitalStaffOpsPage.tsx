import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
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
  Tab,
  Tabs,
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
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useStaffList } from '@/features/hospital/hooks/useStaffQueries';
import {
  useStaffAttendance,
  useStaffLeave,
  useStaffOpsMutations,
  useStaffRoster,
  useStaffShifts,
} from '@/features/staffops/hooks/useStaffOpsQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalStaffOpsPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const { data: staff = [] } = useStaffList(hospitalId || undefined);
  const { data: shifts = [] } = useStaffShifts(hospitalId || undefined, branchId || undefined);
  const { data: roster } = useStaffRoster(hospitalId || undefined, branchId || undefined);
  const { data: attendance } = useStaffAttendance(hospitalId || undefined, branchId || undefined);
  const { data: leave } = useStaffLeave(hospitalId || undefined, branchId || undefined);
  const mutations = useStaffOpsMutations();

  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [attOpen, setAttOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [shiftForm, setShiftForm] = useState({
    code: 'MORNING',
    name: 'Morning',
    startTime: '07:00:00',
    endTime: '15:00:00',
  });
  const [rosterForm, setRosterForm] = useState({ staffId: '', shiftId: '', dutyDate: today });
  const [attForm, setAttForm] = useState({ staffId: '', dutyDate: today, status: 'PRESENT' });
  const [leaveForm, setLeaveForm] = useState({
    staffId: '',
    leaveType: 'CASUAL',
    startDate: today,
    endDate: today,
    reason: '',
  });

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const staffLabel = (id: string) => {
    const s = staff.find((m) => m.staffId === id);
    return s ? `${s.firstName} ${s.lastName}` : id.slice(0, 8);
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Staff operations"
        subtitle="Shifts, roster, attendance, and leave"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" onClick={() => setShiftOpen(true)}>
          Add shift
        </Button>
        <Button variant="outlined" onClick={() => setRosterOpen(true)}>
          Assign roster
        </Button>
        <Button variant="outlined" onClick={() => setAttOpen(true)}>
          Record attendance
        </Button>
        <Button variant="contained" onClick={() => setLeaveOpen(true)}>
          Request leave
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Shifts" />
        <Tab label="Roster" />
        <Tab label="Attendance" />
        <Tab label="Leave" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.shiftId}>
                  <TableCell>{s.code}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    {s.startTime} – {s.endTime}
                  </TableCell>
                </TableRow>
              ))}
              {shifts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">No shifts defined.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Shift</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(roster?.content ?? []).map((r) => (
                <TableRow key={r.rosterEntryId}>
                  <TableCell>{r.dutyDate}</TableCell>
                  <TableCell>{staffLabel(r.staffId)}</TableCell>
                  <TableCell>{r.shiftCode ?? r.shiftName}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clock in</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(attendance?.content ?? []).map((a) => (
                <TableRow key={a.attendanceId}>
                  <TableCell>{a.dutyDate}</TableCell>
                  <TableCell>{staffLabel(a.staffId)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={a.status} />
                  </TableCell>
                  <TableCell>{a.clockIn ? new Date(a.clockIn).toLocaleTimeString() : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 3 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Staff</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(leave?.content ?? []).map((l) => (
                <TableRow key={l.leaveRequestId}>
                  <TableCell>{staffLabel(l.staffId)}</TableCell>
                  <TableCell>{l.leaveType}</TableCell>
                  <TableCell>
                    {l.startDate} → {l.endDate}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={l.status} />
                  </TableCell>
                  <TableCell align="right">
                    {l.status === 'REQUESTED' && (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button
                          size="small"
                          onClick={() =>
                            run(() =>
                              mutations.decideLeave.mutateAsync({
                                leaveRequestId: l.leaveRequestId,
                                decision: 'APPROVED',
                              }),
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() =>
                            run(() =>
                              mutations.decideLeave.mutateAsync({
                                leaveRequestId: l.leaveRequestId,
                                decision: 'REJECTED',
                              }),
                            )
                          }
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={shiftOpen} onClose={() => setShiftOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add shift</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Code"
              value={shiftForm.code}
              onChange={(e) => setShiftForm((f) => ({ ...f, code: e.target.value }))}
            />
            <TextField
              label="Name"
              value={shiftForm.name}
              onChange={(e) => setShiftForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Start (HH:mm:ss)"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <TextField
              label="End (HH:mm:ss)"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShiftOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createShift.mutateAsync({
                  hospitalId,
                  branchId,
                  ...shiftForm,
                });
                setShiftOpen(false);
              })
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rosterOpen} onClose={() => setRosterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign roster</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Staff"
              value={rosterForm.staffId}
              onChange={(e) => setRosterForm((f) => ({ ...f, staffId: e.target.value }))}
            >
              {staff.map((s) => (
                <MenuItem key={s.staffId} value={s.staffId}>
                  {s.firstName} {s.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Shift"
              value={rosterForm.shiftId}
              onChange={(e) => setRosterForm((f) => ({ ...f, shiftId: e.target.value }))}
            >
              {shifts.map((s) => (
                <MenuItem key={s.shiftId} value={s.shiftId}>
                  {s.code} — {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Duty date"
              InputLabelProps={{ shrink: true }}
              value={rosterForm.dutyDate}
              onChange={(e) => setRosterForm((f) => ({ ...f, dutyDate: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRosterOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createRoster.mutateAsync({
                  hospitalId,
                  branchId,
                  staffId: rosterForm.staffId,
                  shiftId: rosterForm.shiftId,
                  dutyDate: rosterForm.dutyDate,
                  status: 'CONFIRMED',
                });
                setRosterOpen(false);
              })
            }
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={attOpen} onClose={() => setAttOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Record attendance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Staff"
              value={attForm.staffId}
              onChange={(e) => setAttForm((f) => ({ ...f, staffId: e.target.value }))}
            >
              {staff.map((s) => (
                <MenuItem key={s.staffId} value={s.staffId}>
                  {s.firstName} {s.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Duty date"
              InputLabelProps={{ shrink: true }}
              value={attForm.dutyDate}
              onChange={(e) => setAttForm((f) => ({ ...f, dutyDate: e.target.value }))}
            />
            <TextField
              select
              label="Status"
              value={attForm.status}
              onChange={(e) => setAttForm((f) => ({ ...f, status: e.target.value }))}
            >
              {['PRESENT', 'LATE', 'ABSENT', 'HALF_DAY'].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.recordAttendance.mutateAsync({
                  hospitalId,
                  branchId,
                  staffId: attForm.staffId,
                  dutyDate: attForm.dutyDate,
                  status: attForm.status,
                  clockInNow: attForm.status !== 'ABSENT',
                });
                setAttOpen(false);
              })
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request leave</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Staff"
              value={leaveForm.staffId}
              onChange={(e) => setLeaveForm((f) => ({ ...f, staffId: e.target.value }))}
            >
              {staff.map((s) => (
                <MenuItem key={s.staffId} value={s.staffId}>
                  {s.firstName} {s.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Type"
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm((f) => ({ ...f, leaveType: e.target.value }))}
            >
              {['CASUAL', 'SICK', 'EARNED', 'UNPAID', 'OTHER'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Start"
              InputLabelProps={{ shrink: true }}
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="End"
              InputLabelProps={{ shrink: true }}
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
            />
            <TextField
              label="Reason"
              multiline
              minRows={2}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createLeave.mutateAsync({
                  hospitalId,
                  branchId,
                  staffId: leaveForm.staffId,
                  leaveType: leaveForm.leaveType,
                  startDate: leaveForm.startDate,
                  endDate: leaveForm.endDate,
                  reason: leaveForm.reason || undefined,
                });
                setLeaveOpen(false);
              })
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
