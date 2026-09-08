import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listInvoicesByEncounter } from '@/features/billing/api/billingApi';
import {
  assignIpdPayer,
  clearIpdFinancial,
  createIpdChargeEvent,
  createIpdDeposit,
  createIpdPayerAuthorization,
  decideIpdPayerAuthorization,
  getIpdFinancialClearance,
  listIpdChargeEvents,
  listIpdPayerAuthorizations,
  listIpdPayers,
  postIpdInterimInvoice,
  type IpdAdmission,
} from '@/features/ipd/api/ipdApi';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  admission: IpdAdmission;
  enabledServices?: Record<string, boolean>;
  canManage: boolean;
  onMessage: (message: string, severity: 'success' | 'error') => void;
};

export function IpdBillingPanel({ admission, enabledServices, canManage, onMessage }: Props) {
  const qc = useQueryClient();
  const depositOn = enabledServices?.IPD_DEPOSIT !== false;
  const interimOn = enabledServices?.IPD_INTERIM_BILLING !== false;
  const tpaOn = enabledServices?.IPD_INSURANCE_TPA !== false;

  const chargesQuery = useQuery({
    queryKey: ['ipd', 'charges', admission.admissionId],
    queryFn: () => listIpdChargeEvents(admission.admissionId),
  });
  const invoicesQuery = useQuery({
    queryKey: ['billing', 'encounter-invoices', admission.encounterId],
    queryFn: () => listInvoicesByEncounter(admission.encounterId),
  });
  const payersQuery = useQuery({
    queryKey: ['ipd', 'payers', admission.admissionId],
    queryFn: () => listIpdPayers(admission.admissionId),
  });
  const authsQuery = useQuery({
    queryKey: ['ipd', 'auths', admission.admissionId],
    queryFn: () => listIpdPayerAuthorizations(admission.admissionId),
    enabled: tpaOn,
  });
  const clearanceQuery = useQuery({
    queryKey: ['ipd', 'financial-clearance', admission.admissionId],
    queryFn: () => getIpdFinancialClearance(admission.admissionId),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['ipd', 'charges', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['billing', 'encounter-invoices', admission.encounterId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'payers', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'auths', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'financial-clearance', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['billing'] });
  };

  const run = async (ok: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      invalidate();
      onMessage(ok, 'success');
    } catch (e) {
      onMessage(parseApiError(e).message, 'error');
    }
  };

  const [chargeType, setChargeType] = useState('BED_DAY');
  const [chargeDesc, setChargeDesc] = useState('Bed day');
  const [unitPrice, setUnitPrice] = useState('1500');
  const [depositAmount, setDepositAmount] = useState('5000');
  const [payerMode, setPayerMode] = useState('SELF_PAY');
  const [payerName, setPayerName] = useState('');
  const [claimMode, setClaimMode] = useState('');
  const [authType, setAuthType] = useState('PRE_AUTH');

  const pending = (chargesQuery.data ?? []).filter((c) => c.status === 'PENDING');

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Charge events</Typography>
        {canManage ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField select size="small" label="Type" value={chargeType}
              onChange={(e) => setChargeType(e.target.value)} sx={{ minWidth: 140 }}>
              {['BED_DAY', 'NURSING', 'PROCEDURE', 'MANUAL', 'OTHER'].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" label="Description" fullWidth value={chargeDesc}
              onChange={(e) => setChargeDesc(e.target.value)} />
            <TextField size="small" label="Unit price" value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)} sx={{ width: 120 }} />
            <Button variant="outlined" onClick={() => void run('Charge added', () => createIpdChargeEvent(admission.admissionId, {
              chargeType,
              description: chargeDesc.trim() || chargeType,
              quantity: 1,
              unitPrice: Number(unitPrice) || 0,
            }))}>
              Add
            </Button>
          </Stack>
        ) : null}
        {(chargesQuery.data ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">No charges yet.</Typography>
        ) : (
          <Stack spacing={0.75} divider={<Divider flexItem />}>
            {(chargesQuery.data ?? []).map((c) => (
              <Typography key={c.chargeEventId} variant="body2">
                {c.serviceDate} · {c.chargeType} · {c.description} · {c.amount} · {c.status}
              </Typography>
            ))}
          </Stack>
        )}
        {canManage && interimOn ? (
          <Button
            sx={{ mt: 1.5 }}
            variant="contained"
            disabled={pending.length === 0}
            onClick={() => void run('Interim invoice created', () => postIpdInterimInvoice(admission.admissionId))}
          >
            Post interim bill ({pending.length} pending)
          </Button>
        ) : null}
      </Paper>

      {depositOn ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Deposit</Typography>
          {canManage ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField size="small" label="Amount" value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)} sx={{ width: 140 }} />
              <Button variant="outlined" onClick={() => void run('Deposit recorded', () => createIpdDeposit(admission.admissionId, {
                amount: Number(depositAmount) || 0,
                paymentMethod: 'CASH',
              }))}>
                Record deposit
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Deposits enabled for this hospital.</Typography>
          )}
        </Paper>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Invoices</Typography>
        {(invoicesQuery.data ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">No invoices yet.</Typography>
        ) : (
          <Stack spacing={0.75}>
            {(invoicesQuery.data ?? []).map((inv) => (
              <Stack key={inv.invoiceId} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2">
                  {inv.invoiceNumber} · {inv.invoiceKind ?? 'STANDARD'} · {inv.status} · {inv.totalAmount}
                </Typography>
                <Chip size="small" label={inv.invoiceKind ?? 'STANDARD'} />
              </Stack>
            ))}
          </Stack>
        )}
        <Button
          sx={{ mt: 1.5 }}
          component={RouterLink}
          to={`/hospital/billing/checkout/${admission.encounterId}`}
          state={{ from: 'ipd', mode: 'IPD' }}
          variant="outlined"
          size="small"
        >
          Final checkout
        </Button>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>Payer</Typography>
        {canManage ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5 }}>
            <TextField select size="small" label="Mode" value={payerMode}
              onChange={(e) => setPayerMode(e.target.value)} sx={{ minWidth: 160 }}>
              {['SELF_PAY', 'INSURANCE', 'TPA', 'CORPORATE', 'GOVERNMENT'].map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" label="Payer name" fullWidth value={payerName}
              onChange={(e) => setPayerName(e.target.value)} />
            <TextField select size="small" label="Claim mode" value={claimMode}
              onChange={(e) => setClaimMode(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">—</MenuItem>
              {['CASHLESS', 'REIMBURSEMENT', 'CO_PAY', 'PACKAGE'].map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" onClick={() => void run('Payer assigned', () => assignIpdPayer(admission.admissionId, {
              payerMode,
              payerName: payerName.trim() || undefined,
              claimMode: claimMode || undefined,
              primaryPayer: true,
            }))}>
              Assign
            </Button>
          </Stack>
        ) : null}
        {(payersQuery.data ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">Default self-pay (no payer row).</Typography>
        ) : (
          (payersQuery.data ?? []).map((p) => (
            <Typography key={p.payerId} variant="body2">
              {p.payerMode}{p.payerName ? ` · ${p.payerName}` : ''}{p.claimMode ? ` · ${p.claimMode}` : ''}
              {p.primaryPayer ? ' · primary' : ''}
            </Typography>
          ))
        )}
      </Paper>

      {tpaOn ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Authorizations</Typography>
          {canManage ? (
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <TextField select size="small" label="Type" value={authType}
                onChange={(e) => setAuthType(e.target.value)} sx={{ minWidth: 160 }}>
                {['ELIGIBILITY', 'PRE_AUTH', 'ENHANCEMENT', 'FINAL_AUTH'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={() => void run('Auth requested', () => createIpdPayerAuthorization(admission.admissionId, {
                authType,
                payerId: payersQuery.data?.find((p) => p.primaryPayer)?.payerId,
              }))}>
                Request
              </Button>
            </Stack>
          ) : null}
          {(authsQuery.data ?? []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No authorizations.</Typography>
          ) : (
            <Stack spacing={1}>
              {(authsQuery.data ?? []).map((a) => (
                <Box key={a.authorizationId}>
                  <Typography variant="body2">{a.authType} · {a.status}{a.authNumber ? ` · ${a.authNumber}` : ''}</Typography>
                  {canManage && a.status === 'REQUESTED' ? (
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Button size="small" onClick={() => void run('Auth approved', () => decideIpdPayerAuthorization(
                        admission.admissionId, a.authorizationId, { status: 'APPROVED' },
                      ))}>Approve</Button>
                      <Button size="small" color="warning" onClick={() => void run('Auth denied', () => decideIpdPayerAuthorization(
                        admission.admissionId, a.authorizationId, { status: 'DENIED' },
                      ))}>Deny</Button>
                    </Stack>
                  ) : null}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Financial clearance</Typography>
          <Chip
            size="small"
            color={clearanceQuery.data?.status === 'CLEARED' ? 'success' : 'default'}
            label={clearanceQuery.data?.status ?? 'PENDING'}
          />
        </Stack>
        {canManage && clearanceQuery.data?.status !== 'CLEARED' ? (
          <Button variant="contained" onClick={() => void run('Financially cleared', () => clearIpdFinancial(admission.admissionId))}>
            Mark financially cleared
          </Button>
        ) : null}
        {clearanceQuery.data?.status !== 'CLEARED' ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            When hospital country config requires clearance/pre-auth, discharge is blocked until cleared.
          </Alert>
        ) : null}
      </Paper>
    </Stack>
  );
}
