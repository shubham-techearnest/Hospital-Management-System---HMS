import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useMedicationOrders } from '@/features/pharmacy/hooks/usePharmacyQueries';

function patientLabel(order: { patientName?: string; uhid?: string; patientId: string }) {
  if (order.patientName) {
    return order.uhid ? `${order.patientName} · ${order.uhid}` : order.patientName;
  }
  return order.patientId.length > 8 ? `${order.patientId.slice(0, 8)}…` : order.patientId;
}

export function NursingMarPage() {
  const scope = useStaffHospitalScope();
  const { hospitalId, branchId, scopeReady } = scope;

  const [orderPage, setOrderPage] = useState(0);

  const { data: ordersPage, isError } = useMedicationOrders(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    orderPage,
    'ACTIVE',
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Medications (MAR)"
        subtitle="Active medication orders ready for administration"
      />

      <StaffHospitalScopeBar
        {...scope}
        onScopeIndexChange={scope.setActiveScopeIndex}
        onBranchChange={scope.setBranchId}
      />

      {isError && scopeReady ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Unable to load medication orders. Confirm your hospital/branch assignment.
        </Alert>
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to load the MAR list.</Alert>
      ) : (
        <Stack spacing={2}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Visit</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.medicationOrderId} hover>
                    <TableCell>{order.encounterNumber ?? '—'}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{patientLabel(order)}</Typography>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell><Chip size="small" label={order.status} color="warning" /></TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/nursing/mar/${order.medicationOrderId}`}
                        size="small"
                        variant="outlined"
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" color="text.secondary">No active medication orders.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          {orderTotalPages > 1 ? (
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button disabled={orderPage === 0} onClick={() => setOrderPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {orderPage + 1} of {orderTotalPages}
              </Typography>
              <Button disabled={orderPage + 1 >= orderTotalPages} onClick={() => setOrderPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      )}
    </AnimatedPage>
  );
}
