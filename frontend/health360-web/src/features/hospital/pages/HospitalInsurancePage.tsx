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
import {
  useInsuranceClaims,
  useInsuranceMutations,
  useInsurancePayers,
  useInsurancePolicies,
  usePreAuthorizations,
} from '@/features/insurance/hooks/useInsuranceQueries';
import { parseApiError } from '@/shared/api/parseApiError';

export function HospitalInsurancePage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [payerOpen, setPayerOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);

  const { data: payers = [] } = useInsurancePayers(hospitalId || undefined);
  const { data: policies } = useInsurancePolicies(hospitalId || undefined, branchId || undefined);
  const { data: auths } = usePreAuthorizations(hospitalId || undefined, branchId || undefined);
  const { data: claims } = useInsuranceClaims(hospitalId || undefined, branchId || undefined);
  const mutations = useInsuranceMutations(hospitalId, branchId);

  const [payerForm, setPayerForm] = useState({ code: '', name: '', payerType: 'TPA' });
  const [policyForm, setPolicyForm] = useState({
    patientId: '00000000-0000-0000-0000-000000000070',
    payerId: '',
    policyNumber: '',
    claimMode: 'CASHLESS',
    coverageLimit: '500000',
  });
  const [authForm, setAuthForm] = useState({ policyId: '', requestedAmount: '50000' });
  const [claimForm, setClaimForm] = useState({ policyId: '', preAuthorizationId: '', claimedAmount: '25000' });

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
        title="Insurance / TPA"
        subtitle="Payers, patient policies, pre-authorization, and claims"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" onClick={() => setPayerOpen(true)}>
          Add payer
        </Button>
        <Button variant="outlined" onClick={() => setPolicyOpen(true)}>
          Register policy
        </Button>
        <Button variant="outlined" onClick={() => setAuthOpen(true)}>
          Request pre-auth
        </Button>
        <Button variant="contained" onClick={() => setClaimOpen(true)}>
          Create claim
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Payers" />
        <Tab label="Policies" />
        <Tab label="Pre-auth" />
        <Tab label="Claims" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payers.map((p) => (
                <TableRow key={p.payerId}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.payerType}</TableCell>
                </TableRow>
              ))}
              {payers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">No payers yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Policy</TableCell>
                <TableCell>Payer</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(policies?.content ?? []).map((p) => (
                <TableRow key={p.policyId}>
                  <TableCell>{p.policyNumber}</TableCell>
                  <TableCell>{p.payerName ?? p.payerId.slice(0, 8)}</TableCell>
                  <TableCell>{p.claimMode}</TableCell>
                  <TableCell>
                    <Chip size="small" label={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Auth #</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(auths?.content ?? []).map((a) => (
                <TableRow key={a.preAuthorizationId}>
                  <TableCell>{a.authNumber}</TableCell>
                  <TableCell>{a.authType}</TableCell>
                  <TableCell>{a.requestedAmount ?? '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={a.status} />
                  </TableCell>
                  <TableCell>
                    {a.status === 'REQUESTED' && (
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          color="success"
                          onClick={() =>
                            run(() =>
                              mutations.decidePreAuth.mutateAsync({
                                authId: a.preAuthorizationId,
                                decision: 'APPROVED',
                                approvedAmount: a.requestedAmount,
                              }),
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            run(() =>
                              mutations.decidePreAuth.mutateAsync({
                                authId: a.preAuthorizationId,
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

      {tab === 3 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Claim #</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(claims?.content ?? []).map((c) => (
                <TableRow key={c.claimId}>
                  <TableCell>{c.claimNumber}</TableCell>
                  <TableCell>{c.claimedAmount}</TableCell>
                  <TableCell>
                    <Chip size="small" label={c.status} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {c.status === 'DRAFT' && (
                        <Button
                          size="small"
                          onClick={() => run(() => mutations.submitClaim.mutateAsync(c.claimId))}
                        >
                          Submit
                        </Button>
                      )}
                      {c.status === 'SUBMITTED' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            onClick={() =>
                              run(() =>
                                mutations.decideClaim.mutateAsync({
                                  claimId: c.claimId,
                                  decision: 'APPROVED',
                                }),
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            onClick={() =>
                              run(() =>
                                mutations.decideClaim.mutateAsync({
                                  claimId: c.claimId,
                                  decision: 'SETTLED',
                                  settledAmount: c.claimedAmount,
                                }),
                              )
                            }
                          >
                            Settle
                          </Button>
                        </>
                      )}
                      {c.status === 'APPROVED' && (
                        <Button
                          size="small"
                          onClick={() =>
                            run(() =>
                              mutations.decideClaim.mutateAsync({
                                claimId: c.claimId,
                                decision: 'SETTLED',
                                settledAmount: c.approvedAmount ?? c.claimedAmount,
                              }),
                            )
                          }
                        >
                          Settle
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={payerOpen} onClose={() => setPayerOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add payer / TPA</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Code"
              value={payerForm.code}
              onChange={(e) => setPayerForm((f) => ({ ...f, code: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Name"
              value={payerForm.name}
              onChange={(e) => setPayerForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Type"
              value={payerForm.payerType}
              onChange={(e) => setPayerForm((f) => ({ ...f, payerType: e.target.value }))}
              fullWidth
            >
              {['TPA', 'INSURER', 'CORPORATE', 'GOVERNMENT'].map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayerOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createPayer.mutateAsync({
                  hospitalId,
                  code: payerForm.code,
                  name: payerForm.name,
                  payerType: payerForm.payerType,
                });
                setPayerOpen(false);
              })
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={policyOpen} onClose={() => setPolicyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Register policy</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Patient ID"
              value={policyForm.patientId}
              onChange={(e) => setPolicyForm((f) => ({ ...f, patientId: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Payer"
              value={policyForm.payerId}
              onChange={(e) => setPolicyForm((f) => ({ ...f, payerId: e.target.value }))}
              fullWidth
            >
              {payers.map((p) => (
                <MenuItem key={p.payerId} value={p.payerId}>
                  {p.code} — {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Policy number"
              value={policyForm.policyNumber}
              onChange={(e) => setPolicyForm((f) => ({ ...f, policyNumber: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Coverage limit"
              value={policyForm.coverageLimit}
              onChange={(e) => setPolicyForm((f) => ({ ...f, coverageLimit: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createPolicy.mutateAsync({
                  hospitalId,
                  branchId,
                  patientId: policyForm.patientId,
                  payerId: policyForm.payerId,
                  policyNumber: policyForm.policyNumber,
                  claimMode: policyForm.claimMode,
                  coverageLimit: Number(policyForm.coverageLimit) || undefined,
                });
                setPolicyOpen(false);
              })
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request pre-authorization</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Policy"
              value={authForm.policyId}
              onChange={(e) => setAuthForm((f) => ({ ...f, policyId: e.target.value }))}
              fullWidth
            >
              {(policies?.content ?? []).map((p) => (
                <MenuItem key={p.policyId} value={p.policyId}>
                  {p.policyNumber}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Requested amount"
              value={authForm.requestedAmount}
              onChange={(e) => setAuthForm((f) => ({ ...f, requestedAmount: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.requestPreAuth.mutateAsync({
                  policyId: authForm.policyId,
                  requestedAmount: Number(authForm.requestedAmount),
                });
                setAuthOpen(false);
                setTab(2);
              })
            }
          >
            Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={claimOpen} onClose={() => setClaimOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create claim</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Policy"
              value={claimForm.policyId}
              onChange={(e) => setClaimForm((f) => ({ ...f, policyId: e.target.value }))}
              fullWidth
            >
              {(policies?.content ?? []).map((p) => (
                <MenuItem key={p.policyId} value={p.policyId}>
                  {p.policyNumber}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Approved pre-auth (optional)"
              value={claimForm.preAuthorizationId}
              onChange={(e) => setClaimForm((f) => ({ ...f, preAuthorizationId: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {(auths?.content ?? [])
                .filter((a) => a.status === 'APPROVED')
                .map((a) => (
                  <MenuItem key={a.preAuthorizationId} value={a.preAuthorizationId}>
                    {a.authNumber}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              label="Claimed amount"
              value={claimForm.claimedAmount}
              onChange={(e) => setClaimForm((f) => ({ ...f, claimedAmount: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              run(async () => {
                await mutations.createClaim.mutateAsync({
                  policyId: claimForm.policyId,
                  preAuthorizationId: claimForm.preAuthorizationId || undefined,
                  claimedAmount: Number(claimForm.claimedAmount),
                });
                setClaimOpen(false);
                setTab(3);
              })
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
