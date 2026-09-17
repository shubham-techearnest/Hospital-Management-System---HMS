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
import { useBloodMutations, useBloodRequests, useBloodUnits } from '@/features/blood/hooks/useBloodQueries';
import { parseApiError } from '@/shared/api/parseApiError';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PRODUCTS = ['PRBC', 'FFP', 'PLATELETS', 'CRYO', 'WHOLE_BLOOD'];

export function HospitalBloodBankPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);

  const { data: units } = useBloodUnits(hospitalId || undefined, branchId || undefined);
  const { data: requests } = useBloodRequests(hospitalId || undefined, branchId || undefined);
  const mutations = useBloodMutations(hospitalId, branchId);

  const [unitForm, setUnitForm] = useState({
    unitNumber: '',
    productType: 'PRBC',
    bloodGroup: 'O+',
    donorRef: '',
  });
  const [reqForm, setReqForm] = useState({
    patientId: '00000000-0000-0000-0000-000000000070',
    productType: 'PRBC',
    bloodGroup: 'O+',
    unitsRequested: '1',
    urgency: 'ROUTINE',
    indication: '',
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
      setError(parseApiError(err));
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Blood Bank"
        subtitle="Unit inventory, transfusion requests, issue and return"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" onClick={() => setUnitOpen(true)}>
          Receive unit
        </Button>
        <Button variant="contained" onClick={() => setReqOpen(true)}>
          New request
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Units" />
        <Tab label="Requests" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Unit #</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(units?.content ?? []).map((u) => (
                <TableRow key={u.unitId}>
                  <TableCell>{u.unitNumber}</TableCell>
                  <TableCell>{u.productType}</TableCell>
                  <TableCell>{u.bloodGroup}</TableCell>
                  <TableCell>
                    <Chip size="small" label={u.status} />
                  </TableCell>
                </TableRow>
              ))}
              {(units?.content ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No units in stock.</Typography>
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
                <TableCell>Request</TableCell>
                <TableCell>Product / Group</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(requests?.content ?? []).map((r) => (
                <TableRow key={r.requestId}>
                  <TableCell>{r.requestNumber}</TableCell>
                  <TableCell>
                    {r.productType} / {r.bloodGroup}
                  </TableCell>
                  <TableCell>{r.urgency}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.status} />
                  </TableCell>
                  <TableCell>{r.unitNumber ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                      {r.status === 'REQUESTED' && (
                        <>
                          <Button
                            size="small"
                            onClick={() =>
                              run(() =>
                                mutations.decide.mutateAsync({
                                  requestId: r.requestId,
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
                                mutations.decide.mutateAsync({
                                  requestId: r.requestId,
                                  decision: 'REJECTED',
                                }),
                              )
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {r.status === 'APPROVED' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => run(() => mutations.issue.mutateAsync({ requestId: r.requestId }))}
                        >
                          Issue
                        </Button>
                      )}
                      {r.status === 'ISSUED' && (
                        <>
                          <Button
                            size="small"
                            onClick={() => run(() => mutations.complete.mutateAsync(r.requestId))}
                          >
                            Complete
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() => run(() => mutations.returnIssued.mutateAsync(r.requestId))}
                          >
                            Return
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {(requests?.content ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No transfusion requests.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={unitOpen} onClose={() => setUnitOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Receive blood unit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Unit number"
              value={unitForm.unitNumber}
              onChange={(e) => setUnitForm((f) => ({ ...f, unitNumber: e.target.value }))}
              required
            />
            <TextField
              select
              label="Product"
              value={unitForm.productType}
              onChange={(e) => setUnitForm((f) => ({ ...f, productType: e.target.value }))}
            >
              {PRODUCTS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Blood group"
              value={unitForm.bloodGroup}
              onChange={(e) => setUnitForm((f) => ({ ...f, bloodGroup: e.target.value }))}
            >
              {GROUPS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Donor ref"
              value={unitForm.donorRef}
              onChange={(e) => setUnitForm((f) => ({ ...f, donorRef: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.receiveUnit.mutateAsync({
                  hospitalId,
                  branchId,
                  unitNumber: unitForm.unitNumber,
                  productType: unitForm.productType,
                  bloodGroup: unitForm.bloodGroup,
                  donorRef: unitForm.donorRef || undefined,
                });
                setUnitOpen(false);
              })
            }
          >
            Receive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reqOpen} onClose={() => setReqOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New transfusion request</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Patient ID"
              value={reqForm.patientId}
              onChange={(e) => setReqForm((f) => ({ ...f, patientId: e.target.value }))}
              required
            />
            <TextField
              select
              label="Product"
              value={reqForm.productType}
              onChange={(e) => setReqForm((f) => ({ ...f, productType: e.target.value }))}
            >
              {PRODUCTS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Blood group"
              value={reqForm.bloodGroup}
              onChange={(e) => setReqForm((f) => ({ ...f, bloodGroup: e.target.value }))}
            >
              {GROUPS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Units"
              type="number"
              value={reqForm.unitsRequested}
              onChange={(e) => setReqForm((f) => ({ ...f, unitsRequested: e.target.value }))}
            />
            <TextField
              select
              label="Urgency"
              value={reqForm.urgency}
              onChange={(e) => setReqForm((f) => ({ ...f, urgency: e.target.value }))}
            >
              {['ROUTINE', 'URGENT', 'STAT'].map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Indication"
              multiline
              minRows={2}
              value={reqForm.indication}
              onChange={(e) => setReqForm((f) => ({ ...f, indication: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReqOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createRequest.mutateAsync({
                  hospitalId,
                  branchId,
                  patientId: reqForm.patientId,
                  productType: reqForm.productType,
                  bloodGroup: reqForm.bloodGroup,
                  unitsRequested: Number(reqForm.unitsRequested) || 1,
                  urgency: reqForm.urgency,
                  indication: reqForm.indication || undefined,
                });
                setReqOpen(false);
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
